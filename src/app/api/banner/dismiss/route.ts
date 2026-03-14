import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { bannerId } = body

    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    // Check if banner exists and allows dismiss
    const banner = await prisma.engagementBanner.findUnique({
      where: { id: bannerId },
    })

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    if (!banner.allowDismiss) {
      return NextResponse.json(
        { error: 'This banner cannot be dismissed' },
        { status: 400 }
      )
    }

    // Check if already dismissed
    const existingDismiss = await prisma.bannerDismiss.findUnique({
      where: {
        bannerId_userId: {
          bannerId,
          userId,
        },
      },
    })

    if (existingDismiss) {
      return NextResponse.json({ success: true, alreadyDismissed: true })
    }

    // Create dismiss record
    await prisma.bannerDismiss.create({
      data: {
        bannerId,
        userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error dismissing banner:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss banner' },
      { status: 500 }
    )
  }
}
