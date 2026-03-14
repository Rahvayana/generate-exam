'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  updateName,
  changePassword,
  updateApiKey,
  removeApiKey,
} from './actions'

// Icons
const UserIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const LockIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const KeyIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 18a3 3 0 1 0 3-3 6 6 0 0 0-3 3" /><path d="M20.9 7.6a2.2 2.2 0 0 0-2.6.6l-.3.3a2.2 2.2 0 0 0-.6 2.6l7.7 7.7a2.2 2.2 0 0 0 2.6.6l.3-.3a2.2 2.2 0 0 0 .6-2.6z" />
    <circle cx="12" cy="12" r="10" />
  </svg>
)
const RefreshIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
)
const CheckIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const ArrowLeft = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
)

type UserRole = 'admin' | 'user'
type UserStatus = 'pending' | 'approved' | 'rejected' | 'unapproved'

interface UserData {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  apiKey: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [nameValue, setNameValue] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [apiKeyValue, setApiKeyValue] = useState('')

  // Message states
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [apiKeyMessage, setApiKeyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Loading states
  const [nameLoading, setNameLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [apiKeyLoading, setApiKeyLoading] = useState(false)
  const [testConnectionLoading, setTestConnectionLoading] = useState(false)

  // Connection test state
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'idle' | 'success' | 'error'
    message: string
  }>({ type: 'idle', message: '' })

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (status === 'unauthenticated') {
        router.push('/login')
        return
      }

      if (status === 'authenticated' && session?.user?.email) {
        try {
          const res = await fetch('/api/user/profile')
          if (res.ok) {
            const data = await res.json()
            setUser(data)
            setNameValue(data.name || '')
            setApiKeyValue(data.apiKey || '')
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [status, session, router])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Memuat data pengguna...</div>
      </div>
    )
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameLoading(true)
    setNameMessage(null)

    const formData = new FormData()
    formData.append('name', nameValue)

    const result = await updateName(formData)

    if (result.error) {
      setNameMessage({ type: 'error', text: result.error })
    } else {
      setNameMessage({ type: 'success', text: result.message || 'Nama berhasil diperbarui' })
      setUser({ ...user, name: nameValue })
    }

    setNameLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    const formData = new FormData()
    formData.append('oldPassword', oldPassword)
    formData.append('newPassword', newPassword)
    formData.append('confirmPassword', confirmPassword)

    const result = await changePassword(formData)

    if (result.error) {
      setPasswordMessage({ type: 'error', text: result.error })
    } else {
      setPasswordMessage({ type: 'success', text: result.message || 'Password berhasil diubah' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setPasswordLoading(false)
  }

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiKeyLoading(true)
    setApiKeyMessage(null)

    const formData = new FormData()
    formData.append('apiKey', apiKeyValue)

    const result = await updateApiKey(formData)

    if (result.error) {
      setApiKeyMessage({ type: 'error', text: result.error })
    } else {
      setApiKeyMessage({ type: 'success', text: result.message || 'API Key berhasil disimpan' })
      setUser({ ...user, apiKey: apiKeyValue })
    }

    setApiKeyLoading(false)
  }

  const handleRemoveApiKey = async () => {
    if (!confirm('Hapus API Key? Anda tidak akan bisa menggunakan fitur AI tanpa API Key.')) {
      return
    }

    setApiKeyLoading(true)
    setApiKeyMessage(null)

    const result = await removeApiKey()

    if (result.error) {
      setApiKeyMessage({ type: 'error', text: result.error })
    } else {
      setApiKeyMessage({ type: 'success', text: result.message || 'API Key berhasil dihapus' })
      setApiKeyValue('')
      setUser({ ...user, apiKey: null })
      setConnectionStatus({ type: 'idle', message: '' })
    }

    setApiKeyLoading(false)
  }

  const handleTestConnection = async () => {
    setTestConnectionLoading(true)
    setConnectionStatus({ type: 'idle', message: '' })

    try {
      const res = await fetch('/api/user/test-apikey', {
        method: 'POST',
      })

      const data = await res.json()

      if (data.valid) {
        setConnectionStatus({
          type: 'success',
          message: data.message || 'Koneksi berhasil!',
        })
      } else {
        setConnectionStatus({
          type: 'error',
          message: data.error || 'Koneksi gagal',
        })
      }
    } catch (error) {
      setConnectionStatus({
        type: 'error',
        message: 'Terjadi kesalahan saat menguji koneksi',
      })
    } finally {
      setTestConnectionLoading(false)
    }
  }

  const maskApiKey = (key: string | null) => {
    if (!key) return 'Belum diatur'
    if (key.length <= 8) return '****' + key.slice(-4)
    return key.slice(0, 4) + '...' + key.slice(-4)
  }

  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      unapproved: 'bg-slate-100 text-slate-800',
    }
    return styles[status]
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Profile Pengguna</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-600">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold uppercase">
                  {user.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Update Name */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Update Nama</h3>
              <p className="text-sm text-slate-500">Ubuh nama lengkap Anda</p>
            </div>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {nameMessage && (
              <div className={`p-3 rounded-xl text-sm ${nameMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {nameMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={nameLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {nameLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <LockIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Ganti Password</h3>
              <p className="text-sm text-slate-500">Ubuh password akun Anda</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password Lama</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan password lama"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan password baru (minimal 6 karakter)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ulangi password baru"
              />
            </div>

            {passwordMessage && (
              <div className={`p-3 rounded-xl text-sm ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {passwordMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {passwordLoading ? 'Mengubah...' : 'Ganti Password'}
            </button>
          </form>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <KeyIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">API Key Gemini</h3>
              <p className="text-sm text-slate-500">Gunakan API key sendiri untuk fitur AI</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">API Key saat ini:</p>
                <p className="font-mono text-slate-900">{maskApiKey(user.apiKey)}</p>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testConnectionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshIcon className={`w-4 h-4 ${testConnectionLoading ? 'animate-spin' : ''}`} />
                {testConnectionLoading ? 'Menguji...' : 'Test Koneksi'}
              </button>
            </div>

            {connectionStatus.type !== 'idle' && (
              <div className={`mt-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
                connectionStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {connectionStatus.type === 'success' ? (
                  <CheckIcon className="w-4 h-4 shrink-0" />
                ) : null}
                <span>{connectionStatus.message}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleUpdateApiKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Google AI API Key</label>
              <input
                type="password"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="Masukkan API Key (AIza...)"
              />
              <p className="text-xs text-slate-500 mt-2">
                Dapatkan API Key gratis di{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {apiKeyMessage && (
              <div className={`p-3 rounded-xl text-sm ${apiKeyMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {apiKeyMessage.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={apiKeyLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {apiKeyLoading ? 'Menyimpan...' : 'Simpan API Key'}
              </button>
              {user.apiKey && (
                <button
                  type="button"
                  onClick={handleRemoveApiKey}
                  disabled={apiKeyLoading}
                  className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Hapus API Key
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
          >
            Keluar
          </button>
        </div>
      </main>
    </div>
  )
}
