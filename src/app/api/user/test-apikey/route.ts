import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's API key (or fall back to env)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiKey: true },
    })

    const apiKey = user?.apiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Tidak ada API Key yang tersedia', valid: false },
        { status: 400 }
      )
    }

    // Test the API key with a simple request to Gemini
    const testResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Test connection. Reply with: OK' }] }],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      }
    )

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}))

      if (testResponse.status === 401 || testResponse.status === 403) {
        return NextResponse.json(
          {
            error: 'API Key tidak valid atau kedaluwarsa',
            valid: false,
            invalidKey: true,
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: `Gagal terhubung ke Google AI (Status: ${testResponse.status})`,
          valid: false,
        },
        { status: 400 }
      )
    }

    const data = await testResponse.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK'

    return NextResponse.json({
      valid: true,
      message: 'Koneksi berhasil! API Key berfungsi dengan baik.',
      reply,
    })
  } catch (error) {
    console.error('API key test error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menguji koneksi', valid: false },
      { status: 500 }
    )
  }
}
