import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const banners = await prisma.engagementBanner.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { createdAt: 'desc' },
    })

    // Get dismiss counts for each banner
    const bannerIds = banners.map((b) => b.id)
    const dismissCounts = await prisma.bannerDismiss.groupBy({
      by: ['bannerId'],
      where: { bannerId: { in: bannerIds } },
      _count: { id: true },
    })

    const dismissCountMap = Object.fromEntries(
      dismissCounts.map((d) => [d.bannerId, d._count.id])
    )

    const bannersWithStats = banners.map((banner) => ({
      ...banner,
      dismissCount: dismissCountMap[banner.id] || 0,
    }))

    return NextResponse.json({ success: true, banners: bannersWithStats })
  } catch (error: any) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}
