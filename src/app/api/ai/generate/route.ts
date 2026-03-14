import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import type { ToolType } from '@/lib/tools-schema'
import {
  buildSystemInstruction,
  buildToolPrompt,
} from '@/lib/tools-prompt-builder'
import {
  validateToolResponse,
  buildToolRetryPrompt,
} from '@/lib/tools-validator'
import {
  detectPromptInjection,
  sanitizeInput,
  validateToolData,
  getSecurityInstruction,
} from '@/lib/prompt-injection-defense'

const prisma = new PrismaClient()

// User's API key takes priority, fall back to environment variable
async function getUserApiKey(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiKey: true },
  })

  // Return user's API key if exists
  if (user?.apiKey) {
    return user.apiKey
  }

  // Fall back to environment variable
  return process.env.GEMINI_API_KEY || null
}

// Parse JSON safely
function safeParseJSON(text: string): { success: boolean; data?: unknown; error?: string } {
  try {
    let cleaned = text.trim()
    cleaned = cleaned.replace(/^```json\s*/i, '')
    cleaned = cleaned.replace(/^```\s*/, '')
    cleaned = cleaned.replace(/```\s*$/, '')

    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
    }

    const parsed = JSON.parse(cleaned)
    return { success: true, data: parsed }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    }
  }
}

// Generate tool content with retry logic
async function generateToolWithRetry(
  tool: ToolType,
  toolData: Record<string, any>,
  apiKey: string,
  maxAttempts = 3
): Promise<{
  success: boolean
  data?: unknown
  attempts: number
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let prompt: string
      let systemInstruction = 'You are an expert educational content specialist. Return valid JSON only.'

      if (attempt === 1) {
        systemInstruction = buildSystemInstruction() + getSecurityInstruction()
        prompt = buildToolPrompt(tool, toolData)
      } else {
        const lastErrors = errors.map(e => ({ field: 'unknown', message: e }))
        prompt = buildToolRetryPrompt(tool, lastErrors)
        systemInstruction = buildSystemInstruction() + getSecurityInstruction()
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid API Key')
        }
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }

      const result = await response.json()
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error('No content generated')
      }

      const parseResult = safeParseJSON(generatedText)

      if (!parseResult.success) {
        errors.push(`Parse failed: ${parseResult.error}`)
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
        break
      }

      const validation = validateToolResponse(tool, parseResult.data)
      validation.warnings.forEach(w => warnings.push(`${w.field}: ${w.message}`))

      if (validation.valid) {
        return {
          success: true,
          data: parseResult.data,
          attempts: attempt,
          errors: [],
          warnings,
        }
      }

      validation.errors.forEach(e => errors.push(`${e.field}: ${e.message}`))

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Attempt ${attempt}: ${errorMsg}`)

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  return {
    success: false,
    attempts: maxAttempts,
    errors,
    warnings,
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user status
    if (session.user.status !== 'approved') {
      return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
    }

    const apiKey = await getUserApiKey(session.user.id)

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API Key tidak ditemukan. Silakan tambahkan API Key Gemini di halaman Profile.',
          needsApiKey: true,
        },
        { status: 400 }
      )
    }

    const body = await req.json()

    // NEW: Tool-based JSON generation
    if (body.tool && body.data) {
      const { tool, data } = body

      const validTools: ToolType[] = ['rpp', 'lkpd', 'materi', 'presentasi', 'rubrik', 'icebreak', 'refleksi']

      if (!validTools.includes(tool as ToolType)) {
        return NextResponse.json(
          { success: false, error: `Invalid tool type: ${tool}` },
          { status: 400 }
        )
      }

      // Anti-prompt injection: Validate tool data
      const validation = validateToolData(tool, data)
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.reason },
          { status: 400 }
        )
      }

      const result = await generateToolWithRetry(tool as ToolType, data, apiKey)
      return NextResponse.json(result)
    }

    // Legacy: Text generation with Gemini
    const { prompt, imagePrompt, systemInstruction } = body

    if (prompt) {
      // Anti-prompt injection: Check for injection attempts
      if (detectPromptInjection(prompt)) {
        return NextResponse.json(
          { error: 'Input mengandung pola yang tidak valid. Silakan gunakan input yang wajar.' },
          { status: 400 }
        )
      }

      // Sanitize the prompt
      const sanitizedPrompt = sanitizeInput(prompt)

      const requestBody: any = {
        contents: [{ role: 'user', parts: [{ text: sanitizedPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }

      if (systemInstruction) {
        requestBody.systemInstruction = { parts: [{ text: systemInstruction + getSecurityInstruction() }] }
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Gemini API error:', errorData)

        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            {
              error: 'API Key tidak valid. Silakan periksa kembali API Key Anda di halaman Profile.',
              invalidApiKey: true,
            },
            { status: 400 }
          )
        }

        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        throw new Error('Format respons tidak valid')
      }

      return NextResponse.json({ text })
    }

    if (imagePrompt) {
      // Anti-prompt injection: Check for injection attempts
      if (detectPromptInjection(imagePrompt)) {
        return NextResponse.json(
          { error: 'Input mengandung pola yang tidak valid. Silakan gunakan input yang wajar.' },
          { status: 400 }
        )
      }

      // Sanitize the prompt
      const sanitizedPrompt = sanitizeInput(imagePrompt)

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: sanitizedPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: '16:9',
            },
          }),
        }
      )

      if (!response.ok) {
        console.error('Imagen API error:', response.status)
        throw new Error(`Imagen API error: ${response.status}`)
      }

      const data = await response.json()
      const base64Image = data.predictions?.[0]?.bytesBase64Encoded

      if (base64Image) {
        const imageDataUrl = `data:image/png;base64,${base64Image}`
        return NextResponse.json({ imageUrl: imageDataUrl })
      }

      throw new Error('Format respons gambar tidak valid')
    }

    return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
