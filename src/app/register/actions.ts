'use server'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function registerUser(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!name || !email || !password || !confirmPassword) {
        return { error: 'All fields are required.' }
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { error: 'Email already exists.' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // status is 'pending' and role is 'user' by default from Prisma Schema
            },
        })

        return { success: true }
    } catch (error) {
        console.error('Registration Error:', error)
        return { error: 'An unexpected error occurred.' }
    }
}
