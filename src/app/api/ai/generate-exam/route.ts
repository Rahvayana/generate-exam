// ============================================
// STRUCTURED EXAM GENERATION API
// ============================================

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import {
  ExamGenerationRequest,
  ExamGenerationResponse,
  DifficultyLevel,
  CognitiveLevel,
  calculateDistribution,
  calculateCognitiveDistribution,
  reorderQuestionsByDifficulty
} from '@/lib/exam-schema'
import { generateExamWithRetry } from '@/lib/exam-retry'
import { validateDifficultyByNumber } from '@/lib/exam-validator'
import {
  detectPromptInjection,
  sanitizeInput,
  getSecurityInstruction,
} from '@/lib/prompt-injection-defense'

const prisma = new PrismaClient()

// User's API key takes priority, fall back to environment variable
async function getUserApiKey(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiKey: true },
  })

  if (user?.apiKey) {
    return user.apiKey
  }

  return process.env.GEMINI_API_KEY || null
}

// Call Gemini API
async function callGemini(
  prompt: string,
  systemInstruction: string,
  apiKey: string
): Promise<string> {
  const requestBody: any = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
    systemInstruction: { parts: [{ text: systemInstruction + getSecurityInstruction() }] }
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
      throw new Error('API_KEY_INVALID')
    }

    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Empty response from Gemini')
  }

  return text
}

// Generate images for questions with image_prompt
async function generateImages(
  questions: ExamGenerationResponse['questions'],
  apiKey: string
): Promise<Record<number, string>> {
  const images: Record<number, string> = {}

  const uniquePrompts = new Map<string, number[]>()
  questions.forEach((q, idx) => {
    if (q.image_prompt) {
      const key = q.image_prompt
      if (!uniquePrompts.has(key)) {
        uniquePrompts.set(key, [])
      }
      uniquePrompts.get(key)!.push(idx)
    }
  })

  for (const [prompt, questionIndices] of uniquePrompts) {
    try {
      // Anti-prompt injection: Check image prompts
      if (detectPromptInjection(prompt)) {
        console.warn('Skipping image with suspicious prompt:', prompt)
        continue
      }

      const sanitizedPrompt = sanitizeInput(prompt)

      // Try Imagen API first
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: `Educational illustration: ${sanitizedPrompt}` }],
            parameters: {
              sampleCount: 1,
              aspectRatio: '16:9',
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded
        if (base64Image) {
          const imageUrl = `data:image/png;base64,${base64Image}`
          questionIndices.forEach(idx => { images[idx] = imageUrl })
          continue
        }
      }

      throw new Error('Imagen failed')
    } catch (e) {
      // Fallback to pollinations.ai
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=400&nologo=true&seed=${Math.random()}`
      questionIndices.forEach(idx => { images[idx] = fallbackUrl })
    }
  }

  return images
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Parse request body
    const body = await req.json()

    // Anti-prompt injection: Validate all text input fields
    const fieldsToCheck = [
      'subject', 'mataPelajaran',
      'topic', 'materiPokok',
      'specialInstructions', 'instruksiKhusus',
      'referenceText', 'teksReferensi',
      'teacherName', 'namaGuru',
      'schoolName', 'namaSekolah',
      'principalName', 'namaKepsek',
      'curriculum', 'kurikulum',
    ]

    for (const field of fieldsToCheck) {
      const value = body[field]
      if (value && typeof value === 'string' && detectPromptInjection(value)) {
        return NextResponse.json(
          { error: `Field "${field}" mengandung pola yang tidak valid. Silakan gunakan input yang wajar.` },
          { status: 400 }
        )
      }
    }

    // Build request object
    const difficultyLevels = (body.difficultyLevels || ['Mudah', 'Sedang', 'Sulit']).map((d: string) =>
      d.toLowerCase() as DifficultyLevel
    )
    const cognitiveLevels = (body.cognitiveLevels || ['C1', 'C2', 'C3']).map((c: string): CognitiveLevel => {
      const upper = c.toUpperCase()
      if (['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].includes(upper)) {
        return upper as CognitiveLevel
      }
      return 'C2'
    })

    const examRequest: ExamGenerationRequest = {
      metadata: {
        subject: body.subject || body.mataPelajaran || '-',
        topic: body.topic || body.materiPokok || '-',
        class_level: body.classLevel || body.kelas || '-',
        education_level: body.educationLevel || body.jenjang || '-',
        year: body.year || body.tahunPenyusunan || new Date().getFullYear().toString(),
        total_questions: parseInt(body.totalQuestions || body.jumlahSoal) || 10,
        question_type: String(body.questionType ?? body.tipeSoal ?? 'Pilihan Ganda')
          .toLowerCase()
          .replace(/ /g, '_') as any,
        curriculum: body.curriculum || body.kurikulum || undefined,
      },
      educator: {
        teacher_name: body.teacherName || body.namaGuru || undefined,
        teacher_nip: body.teacherNip || body.nipGuru || undefined,
        school_name: body.schoolName || body.namaSekolah || undefined,
        principal_name: body.principalName || body.namaKepsek || undefined,
        principal_nip: body.principalNip || body.nipKepsek || undefined,
      },
      difficulty_distribution: calculateDistribution(
        parseInt(body.totalQuestions || body.jumlahSoal) || 10,
        difficultyLevels
      ),
      cognitive_distribution: calculateCognitiveDistribution(
        parseInt(body.totalQuestions || body.jumlahSoal) || 10,
        cognitiveLevels
      ),
      include_images: body.includeImages || body.visualisasiSoal || false,
      special_instructions: body.specialInstructions || body.instruksiKhusus || undefined,
      reference_text: body.referenceText || body.teksReferensi || undefined,
    }

    // Generate with retry logic
    const result = await generateExamWithRetry(
      examRequest,
      async (prompt, systemInstruction) => callGemini(prompt, systemInstruction, apiKey),
      { maxAttempts: 3 }
    )

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          error: 'Gagal generate soal. Silakan coba lagi.',
          details: result.errors,
          validationErrors: result.validation?.errors,
        },
        { status: 500 }
      )
    }

    let examData = result.data

    // Validate difficulty distribution by question number
    const distributionValidation = validateDifficultyByNumber(
      examData.questions,
      examData.metadata.total_questions
    )

    // If questions are not in correct difficulty order, reorder them
    if (distributionValidation.warnings.length > 0) {
      console.log('Questions not in correct difficulty order, reordering...')
      examData.questions = reorderQuestionsByDifficulty(
        examData.questions,
        examRequest.difficulty_distribution
      )

      // Re-validate after reordering
      const revalidation = validateDifficultyByNumber(
        examData.questions,
        examData.metadata.total_questions
      )

      if (revalidation.warnings.length > 0) {
        console.warn('Still have distribution warnings after reordering:', revalidation.warnings)
      }
    }

    // Generate images if needed
    let images: Record<number, string> = {}
    if (examRequest.include_images) {
      images = await generateImages(examData.questions, apiKey)
    }

    return NextResponse.json({
      success: true,
      data: examData,
      images,
      attempts: result.attempts,
      warnings: [
        ...(result.validation?.warnings || []),
        ...distributionValidation.warnings.map(w => w.message)
      ],
    })

  } catch (error) {
    console.error('Exam generation error:', error)

    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return NextResponse.json(
        {
          error: 'API Key tidak valid. Silakan periksa API Key Anda di halaman Profile.',
          invalidApiKey: true,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
