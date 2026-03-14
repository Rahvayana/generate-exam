import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, message, buttonText, buttonUrl, showOnUserDashboard, allowDismiss, active } = body

    // Validation
    if (!title || !message || !buttonText || !buttonUrl) {
      return NextResponse.json(
        { error: 'Title, message, button text, and button URL are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(buttonUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid button URL format' },
        { status: 400 }
      )
    }

    const banner = await prisma.engagementBanner.create({
      data: {
        title,
        message,
        buttonText,
        buttonUrl,
        showOnUserDashboard: showOnUserDashboard ?? true,
        allowDismiss: allowDismiss ?? true,
        active: active ?? true,
      },
    })

    return NextResponse.json({ success: true, banner })
  } catch (error: any) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}
