'use client'

import { useState } from 'react'
import { registerUser } from './actions'
import Link from 'next/link'

export default function RegisterPage() {
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const result = await registerUser(formData)

        if (result?.error) {
            setError(result.error)
        } else if (result?.success) {
            setSuccess(true)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/30 p-8 border border-slate-200 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Registration Successful!</h2>
                    <p className="text-slate-600 mb-6">
                        Your account has been created and is waiting for admin approval.
                    </p>
                    <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/30 p-8 border border-slate-200">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Register</h1>
                    <p className="text-slate-600 mt-2 font-medium">Create your AI Module Generator Account</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            className="block w-full px-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 text-slate-900 placeholder-slate-400 font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="block w-full px-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 text-slate-900 placeholder-slate-400 font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="block w-full px-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 text-slate-900 placeholder-slate-400 font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            className="block w-full px-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 text-slate-900 placeholder-slate-400 font-medium"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#2563eb] text-white shadow-md shadow-blue-200 py-4 rounded-2xl font-bold hover:bg-[#1d4ed8] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>

                    <p className="text-center text-slate-600 text-sm mt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
