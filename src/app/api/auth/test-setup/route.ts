// ============================================
// TEST SETUP API (Cypress Helper)
// ============================================
// This endpoint is ONLY for testing and should be disabled in production

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Disable this endpoint in production
const isDevelopment = process.env.NODE_ENV !== 'production'

export async function POST(req: Request) {
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { email, password, name, role = 'user', status = 'approved', apiKey } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      // Update existing user
      const updateData: any = {
        status,
        role,
      }

      if (password !== 'keep') {
        updateData.password = await bcrypt.hash(password, 10)
      }

      if (apiKey !== undefined) {
        updateData.apiKey = apiKey
      }

      const updated = await prisma.user.update({
        where: { email },
        data: updateData,
      })

      return NextResponse.json({
        success: true,
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
          status: updated.status,
        }
      })
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role,
        status,
        apiKey: apiKey || null,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      }
    })
  } catch (error: any) {
    console.error('Test setup error:', error)
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    )
  }
}

// Allow DELETE to clean up test data
export async function DELETE(req: Request) {
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Delete test user
    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@cypress.test'
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Cleanup failed' },
      { status: 500 }
    )
  }
}
