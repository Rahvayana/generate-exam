import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admins don't see banners
    if (session.user.role === 'admin') {
      return NextResponse.json({ success: true, banners: [] })
    }

    const userId = session.user.id

    // Get active banners that show on user dashboard
    const activeBanners = await prisma.engagementBanner.findMany({
      where: {
        active: true,
        showOnUserDashboard: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (activeBanners.length === 0) {
      return NextResponse.json({ success: true, banners: [] })
    }

    // Get banners the user has already dismissed
    const dismissedBannerIds = (
      await prisma.bannerDismiss.findMany({
        where: {
          userId,
          bannerId: { in: activeBanners.map((b) => b.id) },
        },
        select: { bannerId: true },
      })
    ).map((d) => d.bannerId)

    // Filter out dismissed banners
    const availableBanners = activeBanners.filter(
      (banner) => !dismissedBannerIds.includes(banner.id)
    )

    return NextResponse.json({ success: true, banners: availableBanners })
  } catch (error: any) {
    console.error('Error fetching active banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}
