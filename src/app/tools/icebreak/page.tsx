// ============================================
// ICE BREAKING GENERATOR PAGE
// ============================================

'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ToolPreviewTabs, ToolActions } from '@/components/tool-preview-tabs'
import type { IcebreakResponse } from '@/lib/tools-schema'
import { exportIcebreakToDocx, copyToolData } from '@/lib/tools-docx-export'

const IconBase = ({ children, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
)

const DicesIcon = (props: any) => (
  <IconBase {...props}><rect width="18" height="18" x="3" y="3" ry="2" /><circle cx="7.5" cy="7.5" r="0.75" transform="translate(6 6)" /><circle cx="7.5" cy="7.5" r="0.75" transform="translate(12 3)" /><circle cx="7.5" cy="7.5" r="0.75" transform="translate(6 12)" /><circle cx="7.5" cy="7.5" r="0.75" transform="translate(12 12)" /></IconBase>
)
const ArrowLeftIcon = (props: any) => (
  <IconBase {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></IconBase>
)
const BrainIcon = (props: any) => (
  <IconBase {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></IconBase>
)
const SettingsIcon = (props: any) => (
  <IconBase {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></IconBase>
)

interface FormState {
  kelas: string
  durasi: string
  jumlahSiswa: number
  tema: string
  jenis: 'dalam' | 'luar' | 'campuran'
}

export default function IcebreakPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState<IcebreakResponse | null>(null)
  const [activeTab, setActiveTab] = useState('aktivitas')
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [warnings, setWarnings] = useState<string[]>([])

  const [formData, setFormData] = useState<FormState>({
    kelas: '',
    durasi: '10-15 menit',
    jumlahSiswa: 30,
    tema: '',
    jenis: 'campuran',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'jumlahSiswa' ? parseInt(value) || 0 : value,
    }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setActiveTab('aktivitas')
    setError(null)
    setWarnings([])
    setIsLoading(true)
    setGeneratedData(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'icebreak',
          data: {
            kelas: formData.kelas || undefined,
            durasi: formData.durasi,
            jumlahSiswa: formData.jumlahSiswa,
            tema: formData.tema || undefined,
            jenis: formData.jenis,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Gagal generate icebreak')
      }

      const result = await response.json()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal generate icebreak')
      }

      setGeneratedData(result.data as IcebreakResponse)
      setAttempts(result.attempts || 1)
      setWarnings(result.warnings || [])

    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedData) return
    await exportIcebreakToDocx(generatedData)
  }

  const handleCopy = () => {
    if (!generatedData) return
    copyToolData(generatedData)
    alert('Data icebreak berhasil disalin ke clipboard!')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="border-t-4 border-pink-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    )
  }

  const renderPreview = () => {
    if (!generatedData) return null

    switch (activeTab) {
      case 'aktivitas':
        return (
          <div className="space-y-4">
            <div className="bg-pink-50 rounded-xl p-4 border border-pink-200 text-center">
              <h2 className="font-bold text-pink-900 text-xl mb-2">{generatedData.judul}</h2>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Aktivitas</h4>
              <p className="text-slate-700 mb-1"><span className="font-medium">Nama:</span> {generatedData.aktivitas.nama}</p>
              <p className="text-slate-700"><span className="font-medium">Deskripsi:</span> {generatedData.aktivitas.deskripsi}</p>
            </div>
          </div>
        )

      case 'langkah':
        return (
          <div className="space-y-4">
            {generatedData.langkah.map((langkah, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-pink-600 text-white rounded-full font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 font-medium">Langkah {i + 1}</span>
                </div>
                <p className="text-slate-800 ml-11">{langkah}</p>
              </div>
            ))}
          </div>
        )

      case 'tips':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3">Tips Pelaksanaan</h4>
              <ul className="space-y-2">
                {generatedData.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            {generatedData.peralatan && generatedData.peralatan.length > 0 && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3">Peralatan yang Diperlukan</h4>
                <ul className="list-disc list-inside space-y-1">
                  {generatedData.peralatan.map((alat, i) => (
                    <li key={i} className="text-slate-800">{alat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500 text-white rounded-xl flex items-center justify-center">
                <DicesIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">Ice Breaking Generator</h1>
                <p className="text-xs text-slate-500">Ide permainan seru untuk mencairkan suasana kelas</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/profile" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <SettingsIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <DicesIcon className="w-4 h-4" />
                  KONFIGURASI ICE BREAKING
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">KELAS (Opsional)</label>
                      <input
                        type="text"
                        name="kelas"
                        value={formData.kelas}
                        onChange={handleInputChange}
                        placeholder="Cth: X, 5, 12"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">DURASI</label>
                      <input
                        type="text"
                        name="durasi"
                        value={formData.durasi}
                        onChange={handleInputChange}
                        placeholder="Cth: 10-15 menit"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">JUMLAH SISWA</label>
                      <input
                        type="number"
                        name="jumlahSiswa"
                        value={formData.jumlahSiswa}
                        onChange={handleInputChange}
                        min="5"
                        max="50"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">JENIS</label>
                      <select
                        name="jenis"
                        value={formData.jenis}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      >
                        <option value="dalam">Indoor (Dalam Kelas)</option>
                        <option value="luar">Outdoor (Luar Kelas)</option>
                        <option value="campuran">Campuran</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TEMA (Opsional)</label>
                    <input
                      type="text"
                      name="tema"
                      value={formData.tema}
                      onChange={handleInputChange}
                      placeholder="Cth: Kerjasama, Kepercayaan, Komunikasi, dll"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                  <p className="font-semibold mb-1">Peringatan:</p>
                  <ul className="list-disc list-inside">
                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold hover:bg-pink-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-pink-200"
              >
                {isLoading ? 'Sedang Memproses...' : 'Generate Ice Breaking'}
              </button>

              {attempts > 0 && (
                <p className="text-xs text-center text-slate-500">
                  Selesai dalam {attempts} percobaan {attempts > 1 && '(dengan auto-retry)'}
                </p>
              )}
            </form>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-7 space-y-6">
            {isLoading ? (
              <div className="bg-white p-12 rounded-[28px] shadow-sm border border-slate-200 text-center sticky top-24">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <BrainIcon className="text-slate-600 w-10 h-10" />
                  </div>
                  <div className="absolute inset-0 border-4 border-t-pink-600 border-slate-200 rounded-full animate-spin"></div>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Sedang Membuat Ice Breaking...</h4>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
              </div>
            ) : generatedData ? (
              <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200 sticky top-24">
                <ToolPreviewTabs tool="icebreak" activeTab={activeTab} onTabChange={setActiveTab} />
                {renderPreview()}
                <ToolActions onCopy={handleCopy} onDownload={handleDownload} />
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DicesIcon className="text-slate-400 w-10 h-10" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Belum Ada Ice Breaking</h4>
                <p className="text-sm text-slate-500">Klik "Generate Ice Breaking" untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
