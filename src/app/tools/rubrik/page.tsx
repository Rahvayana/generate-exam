// ============================================
// RUBRIK PENILAIAN PAGE
// ============================================

'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ToolPreviewTabs, ToolActions } from '@/components/tool-preview-tabs'
import type { RubrikResponse } from '@/lib/tools-schema'
import { exportRubrikToDocx, copyToolData } from '@/lib/tools-docx-export'

const IconBase = ({ children, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
)

const ListChecksIcon = (props: any) => (
  <IconBase {...props}><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /><path d="M9 6l2 2 4-4" /></IconBase>
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

const MAPEL_OPTIONS = [
  "Pendidikan Agama", "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Bahasa Inggris", "Seni Budaya",
  "PJOK", "Informatika", "Prakarya", "Sejarah", "Fisika", "Kimia", "Biologi", "Geografi", "Ekonomi",
  "Sosiologi", "Lainnya"
]

interface FormState {
  mataPelajaran: string
  mataPelajaranKustom: string
  jenisTugas: string
  kriteria: string
  aspekPenilaian: string
}

export default function RubrikPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState<RubrikResponse | null>(null)
  const [activeTab, setActiveTab] = useState('rubrik')
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [warnings, setWarnings] = useState<string[]>([])

  const [formData, setFormData] = useState<FormState>({
    mataPelajaran: '',
    mataPelajaranKustom: '',
    jenisTugas: '',
    kriteria: '',
    aspekPenilaian: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (!formData.jenisTugas) {
      setError('Harap lengkapi field yang wajib diisi.')
      return
    }

    setActiveTab('rubrik')
    setError(null)
    setWarnings([])
    setIsLoading(true)
    setGeneratedData(null)

    try {
      const mapel = formData.mataPelajaran === 'Lainnya' ? formData.mataPelajaranKustom : formData.mataPelajaran

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'rubrik',
          data: {
            mataPelajaran: mapel || undefined,
            jenisTugas: formData.jenisTugas,
            kriteria: formData.kriteria || undefined,
            aspekPenilaian: formData.aspekPenilaian ? formData.aspekPenilaian.split(',').map(s => s.trim()) : undefined,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Gagal generate rubrik')
      }

      const result = await response.json()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal generate rubrik')
      }

      setGeneratedData(result.data as RubrikResponse)
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
    await exportRubrikToDocx(generatedData)
  }

  const handleCopy = () => {
    if (!generatedData) return
    copyToolData(generatedData)
    alert('Data rubrik berhasil disalin ke clipboard!')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="border-t-4 border-orange-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    )
  }

  const renderPreview = () => {
    if (!generatedData) return null

    switch (activeTab) {
      case 'rubrik':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-xl">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">Aspek</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">Kriteria</th>
                    <th className="px-2 py-2 text-center font-semibold text-slate-700 border-b border-slate-200">1</th>
                    <th className="px-2 py-2 text-center font-semibold text-slate-700 border-b border-slate-200">2</th>
                    <th className="px-2 py-2 text-center font-semibold text-slate-700 border-b border-slate-200">3</th>
                    <th className="px-2 py-2 text-center font-semibold text-slate-700 border-b border-slate-200">4</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedData.rubrik.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-2 border-b border-slate-200 font-medium">{item.aspek}</td>
                      <td className="px-3 py-2 border-b border-slate-200 text-slate-600 text-xs">{item.kriteria}</td>
                      <td className="px-2 py-2 border-b border-slate-200 text-center text-red-600 text-xs">{item.skor1.substring(0, 30)}...</td>
                      <td className="px-2 py-2 border-b border-slate-200 text-center text-orange-600 text-xs">{item.skor2.substring(0, 30)}...</td>
                      <td className="px-2 py-2 border-b border-slate-200 text-center text-yellow-600 text-xs">{item.skor3.substring(0, 30)}...</td>
                      <td className="px-2 py-2 border-b border-slate-200 text-center text-green-600 text-xs">{item.skor4.substring(0, 30)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 text-center italic">Scroll horizontal untuk melihat lengkapnya</p>
          </div>
        )

      case 'skala':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-bold text-orange-900 mb-3">Skala Penilaian</h4>
              <p className="text-slate-700">{generatedData.skalaPenilaian}</p>
            </div>
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
              <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center">
                <ListChecksIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">Rubrik Penilaian</h1>
                <p className="text-xs text-slate-500">Buat rubrik penilaian tugas detail</p>
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
                  <ListChecksIcon className="w-4 h-4" />
                  INFORMASI RUBRIK
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MATA PELAJARAN (Opsional)</label>
                    <select
                      name="mataPelajaran"
                      value={formData.mataPelajaran}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    >
                      <option value="">Pilih Mata Pelajaran</option>
                      {MAPEL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {formData.mataPelajaran === 'Lainnya' && (
                      <input
                        type="text"
                        name="mataPelajaranKustom"
                        value={formData.mataPelajaranKustom}
                        onChange={handleInputChange}
                        placeholder="Masukkan mata pelajaran..."
                        className="w-full mt-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">JENIS TUGAS <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="jenisTugas"
                      value={formData.jenisTugas}
                      onChange={handleInputChange}
                      placeholder="Cth: Proyek Pembuatan Poster, Presentasi Kelompok, dll"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">KRITERIA PENILAIAN (Opsional)</label>
                    <textarea
                      name="kriteria"
                      value={formData.kriteria}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Deskripsi singkat tentang apa yang dinilai"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ASPEK PENILAIAN (Opsional)</label>
                    <input
                      type="text"
                      name="aspekPenilaian"
                      value={formData.aspekPenilaian}
                      onChange={handleInputChange}
                      placeholder="Cth: Konten, Kreativitas, Presentasi (pisahkan dengan koma)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
              >
                {isLoading ? 'Sedang Memproses...' : 'Generate Rubrik'}
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
                  <div className="absolute inset-0 border-4 border-t-orange-600 border-slate-200 rounded-full animate-spin"></div>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Sedang Membuat Rubrik...</h4>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
              </div>
            ) : generatedData ? (
              <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200 sticky top-24">
                <ToolPreviewTabs tool="rubrik" activeTab={activeTab} onTabChange={setActiveTab} />
                {renderPreview()}
                <ToolActions onCopy={handleCopy} onDownload={handleDownload} />
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ListChecksIcon className="text-slate-400 w-10 h-10" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Belum Ada Rubrik</h4>
                <p className="text-sm text-slate-500">Isi form di sebelah kiri dan klik "Generate Rubrik" untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
