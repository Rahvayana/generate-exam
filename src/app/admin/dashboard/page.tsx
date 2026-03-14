'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SparklesIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, UsersIcon } from '@heroicons/react/24/outline'

interface Banner {
  id: string
  title: string
  message: string
  buttonText: string
  buttonUrl: string
  showOnUserDashboard: boolean
  allowDismiss: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  dismissCount?: number
}

interface FormData {
  title: string
  message: string
  buttonText: string
  buttonUrl: string
  showOnUserDashboard: boolean
  allowDismiss: boolean
  active: boolean
}

interface User {
  id: string
  name: string
  email: string
  status: string
  createdAt: string
}

const emptyForm: FormData = {
  title: '',
  message: '',
  buttonText: '',
  buttonUrl: '',
  showOnUserDashboard: true,
  allowDismiss: true,
  active: true,
}

type TabType = 'users' | 'engagement'

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('users')

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [userFilter, setUserFilter] = useState({ status: 'all', q: '' })

  // Engagement state
  const [banners, setBanners] = useState<Banner[]>([])
  const [bannersLoading, setBannersLoading] = useState(true)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [bannerFormData, setBannerFormData] = useState<FormData>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [includeInactive, setIncludeInactive] = useState(false)

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/')
      return
    }

    if (activeTab === 'users') {
      fetchUsers()
    } else {
      fetchBanners()
    }
  }, [activeTab, session, userFilter, includeInactive])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (userFilter.status !== 'all') params.append('status', userFilter.status)
      if (userFilter.q) params.append('q', userFilter.q)

      const response = await fetch(`/api/admin/users/list?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchBanners = async () => {
    try {
      const response = await fetch(`/api/admin/engagement/list?includeInactive=${includeInactive}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) setBanners(data.banners)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setBannersLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'approve' | 'reject' | 'unapprove') => {
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action }),
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleCreateBanner = () => {
    setEditingBanner(null)
    setBannerFormData(emptyForm)
    setShowBannerForm(true)
    setError(null)
    setSuccess(null)
  }

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner)
    setBannerFormData({
      title: banner.title,
      message: banner.message,
      buttonText: banner.buttonText,
      buttonUrl: banner.buttonUrl,
      showOnUserDashboard: banner.showOnUserDashboard,
      allowDismiss: banner.allowDismiss,
      active: banner.active,
    })
    setShowBannerForm(true)
    setError(null)
    setSuccess(null)
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch('/api/admin/engagement/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setSuccess('Banner deleted successfully')
        fetchBanners()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete banner')
      }
    } catch (error) {
      setError('Failed to delete banner')
    }
  }

  const handleToggleBannerActive = async (banner: Banner) => {
    try {
      const response = await fetch('/api/admin/engagement/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...banner,
          active: !banner.active,
        }),
      })

      if (response.ok) {
        setSuccess(`Banner ${banner.active ? 'deactivated' : 'activated'} successfully`)
        fetchBanners()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update banner')
      }
    } catch (error) {
      setError('Failed to update banner')
    }
  }

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const endpoint = editingBanner ? '/api/admin/engagement/update' : '/api/admin/engagement/create'
      const payload = editingBanner ? { ...bannerFormData, id: editingBanner.id } : bannerFormData

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSuccess(editingBanner ? 'Banner updated successfully' : 'Banner created successfully')
        setShowBannerForm(false)
        setBannerFormData(emptyForm)
        setEditingBanner(null)
        fetchBanners()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save banner')
      }
    } catch (error) {
      setError('Failed to save banner')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage users and promotional banners</p>
          </div>
          <a href="/" className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors">
            Go to App
          </a>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UsersIcon className="w-5 h-5 inline mr-2" />
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'engagement'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SparklesIcon className="w-5 h-5 inline mr-2" />
            Engagement Tools
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              <form
                className="flex gap-4 w-full md:w-auto"
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  setUserFilter({
                    status: formData.get('status') as string,
                    q: formData.get('q') as string,
                  })
                }}
              >
                <input
                  name="q"
                  placeholder="Search by email..."
                  className="w-full md:w-64 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <select
                  name="status"
                  defaultValue="all"
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="unapproved">Unapproved</option>
                </select>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shrink-0">
                  Filter
                </button>
              </form>
            </div>

            {usersLoading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading users...</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Name</th>
                      <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Email</th>
                      <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Status</th>
                      <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Joined</th>
                      <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">No users found.</td>
                      </tr>
                    ) : users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                              user.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : user.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {user.status !== 'approved' && (
                              <button
                                onClick={() => handleUserAction(user.id, 'approve')}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {user.status === 'pending' && (
                              <button
                                onClick={() => handleUserAction(user.id, 'reject')}
                                className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                              >
                                Reject
                              </button>
                            )}
                            {user.status === 'approved' && (
                              <button
                                onClick={() => handleUserAction(user.id, 'unapprove')}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                              >
                                Unapprove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <>
            {/* Banner Form */}
            {showBannerForm && (
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-200 p-6 md:p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowBannerForm(false)
                      setEditingBanner(null)
                      setBannerFormData(emptyForm)
                    }}
                    className="text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveBanner} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Promo Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bannerFormData.title}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                        placeholder="e.g., Special Offer!"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Button Text <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bannerFormData.buttonText}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, buttonText: e.target.value })}
                        placeholder="e.g., Learn More"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Promo Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={bannerFormData.message}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, message: e.target.value })}
                      placeholder="Enter your promotional message here..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Button URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={bannerFormData.buttonUrl}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, buttonUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bannerFormData.showOnUserDashboard}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, showOnUserDashboard: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">Show on User Dashboard</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bannerFormData.allowDismiss}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, allowDismiss: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">Allow users to dismiss</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bannerFormData.active}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, active: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">Active</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBannerForm(false)
                        setEditingBanner(null)
                        setBannerFormData(emptyForm)
                      }}
                      className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Banners List */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-200 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">All Banners</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIncludeInactive(!includeInactive)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      includeInactive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {includeInactive ? 'Showing All' : 'Active Only'}
                  </button>
                  <button
                    onClick={handleCreateBanner}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    New Banner
                  </button>
                </div>
              </div>

              {bannersLoading ? (
                <div className="text-center py-12 text-slate-500 font-medium">Loading banners...</div>
              ) : banners.length === 0 ? (
                <div className="text-center py-12">
                  <SparklesIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No banners found. Create your first banner!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      className={`p-5 rounded-2xl border-2 transition-all ${
                        banner.active
                          ? 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50'
                          : 'border-slate-200 bg-slate-50 opacity-70'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{banner.title}</h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                banner.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {banner.active ? 'Active' : 'Inactive'}
                            </span>
                            {banner.showOnUserDashboard && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                Dashboard
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mb-3">{banner.message}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span>
                              <strong>Button:</strong> {banner.buttonText}
                            </span>
                            <span>
                              <strong>URL:</strong> {banner.buttonUrl}
                            </span>
                            <span>
                              <strong>Dismissals:</strong> {banner.dismissCount || 0}
                            </span>
                            <span>
                              <strong>Allow Dismiss:</strong> {banner.allowDismiss ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleToggleBannerActive(banner)}
                            className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                            title={banner.active ? 'Deactivate' : 'Activate'}
                          >
                            {banner.active ? <EyeIcon className="w-5 h-5 text-slate-600" /> : <EyeSlashIcon className="w-5 h-5 text-slate-400" />}
                          </button>
                          <button
                            onClick={() => handleEditBanner(banner)}
                            className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
