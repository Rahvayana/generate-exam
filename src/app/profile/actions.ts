'use server'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

// Update user name
export async function updateName(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string

  if (!name || name.trim().length < 2) {
    return { error: 'Nama harus minimal 2 karakter' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    })

    return { success: true, message: 'Nama berhasil diperbarui' }
  } catch (error) {
    console.error('Update name error:', error)
    return { error: 'Terjadi kesalahan saat memperbarui nama' }
  }
}

// Change password
export async function changePassword(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const oldPassword = formData.get('oldPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: 'Semua field harus diisi' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Password baru tidak cocok' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password minimal 6 karakter' }
  }

  try {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return { error: 'User tidak ditemukan' }
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password)
    if (!isValid) {
      return { error: 'Password lama salah' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return { success: true, message: 'Password berhasil diubah' }
  } catch (error) {
    console.error('Change password error:', error)
    return { error: 'Terjadi kesalahan saat mengubah password' }
  }
}

// Update API Key
export async function updateApiKey(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const apiKey = formData.get('apiKey') as string

  if (!apiKey || apiKey.trim().length === 0) {
    return { error: 'API Key tidak boleh kosong' }
  }

  // Basic validation for Gemini API key format
  if (!apiKey.trim().startsWith('AIza') && !apiKey.trim().startsWith('GOOGLE')) {
    return { error: 'Format API Key tidak valid. Gunakan API Key dari Google AI Studio' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKey: apiKey.trim() },
    })

    return { success: true, message: 'API Key berhasil disimpan' }
  } catch (error) {
    console.error('Update API key error:', error)
    return { error: 'Terjadi kesalahan saat menyimpan API Key' }
  }
}

// Remove API Key
export async function removeApiKey() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKey: null },
    })

    return { success: true, message: 'API Key berhasil dihapus' }
  } catch (error) {
    console.error('Remove API key error:', error)
    return { error: 'Terjadi kesalahan saat menghapus API Key' }
  }
}
