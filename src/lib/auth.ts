import { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string
            role: 'admin' | 'user'
            status: 'pending' | 'approved' | 'rejected' | 'unapproved'
        } & DefaultSession['user']
    }

    interface User {
        role: 'admin' | 'user'
        status: 'pending' | 'approved' | 'rejected' | 'unapproved'
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials')
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                if (!user) {
                    throw new Error('User not found')
                }

                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) {
                    throw new Error('Invalid credentials')
                }

                if (user.status === 'pending') {
                    throw new Error('Your account is waiting for admin approval.')
                }

                if (user.status === 'rejected') {
                    throw new Error('Your registration was rejected.')
                }

                if (user.status === 'unapproved') {
                    throw new Error('Your account has been disabled by admin.')
                }

                if (user.status === 'approved') {
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        status: user.status,
                    }
                }

                throw new Error('Unknown error')
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.status = user.status
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as 'admin' | 'user'
                session.user.status = token.status as 'pending' | 'approved' | 'rejected' | 'unapproved'
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET || 'super-secret-key-for-dev',
}
