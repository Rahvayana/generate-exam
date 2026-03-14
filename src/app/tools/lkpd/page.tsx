// ============================================
// LKPD GENERATOR PAGE
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ToolPreviewTabs, ToolActions } from '@/components/tool-preview-tabs'
import type { LKPDResponse } from '@/lib/tools-schema'
import { exportLKPDToDocx, copyToolData } from '@/lib/tools-docx-export'

// Icons
const IconBase = ({ children, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
)

const FileEditIcon = (props: any) => (
  <IconBase {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></IconBase>
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

const JENJANG_OPTIONS = ["PAUD/TK", "SD", "SMP", "SMA", "SMK", "Kuliah"]

interface FormState {
  jenjang: string
  mataPelajaran: string
  mataPelajaranKustom: string
  kelas: string
  materi: string
  instruksi: string
  jumlahSoal: number
  tujuanPembelajaran: string
}

export default function LKPDPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState<LKPDResponse | null>(null)
  const [activeTab, setActiveTab] = useState('judul')
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [warnings, setWarnings] = useState<string[]>([])

  const [formData, setFormData] = useState<FormState>({
    jenjang: '',
    mataPelajaran: '',
    mataPelajaranKustom: '',
    kelas: '',
    materi: '',
    instruksi: '',
    jumlahSoal: 10,
    tujuanPembelajaran: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'jumlahSoal' ? parseInt(value) || 0 : value,
    }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (!formData.jenjang || !formData.kelas || !formData.mataPelajaran || !formData.materi) {
      setError('Harap lengkapi field yang wajib diisi.')
      return
    }

    setActiveTab('judul')
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
          tool: 'lkpd',
          data: {
            mataPelajaran: mapel,
            kelas: formData.kelas,
            materi: formData.materi,
            jenjang: formData.jenjang,
            instruksi: formData.instruksi || undefined,
            jumlahSoal: formData.jumlahSoal,
            tujuanPembelajaran: formData.tujuanPembelajaran || undefined,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        if (errorData.needsApiKey || errorData.invalidApiKey) {
          throw new Error(errorData.error || 'API Key tidak valid')
        }
        throw new Error(errorData.error || 'Gagal generate LKPD')
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal generate LKPD')
      }

      setGeneratedData(result.data as LKPDResponse)
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
    await exportLKPDToDocx(generatedData)
  }

  const handleCopy = () => {
    if (!generatedData) return
    copyToolData(generatedData)
    alert('Data LKPD berhasil disalin ke clipboard!')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="border-t-4 border-emerald-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    )
  }

  const renderPreview = () => {
    if (!generatedData) return null

    switch (activeTab) {
      case 'judul':
        return (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
              <h2 className="font-bold text-emerald-900 text-xl mb-2">{generatedData.judul}</h2>
              <p className="text-slate-700 text-sm bg-white rounded-lg p-3 border border-emerald-100">
                <span className="font-semibold">Petunjuk:</span> {generatedData.petunjuk}
              </p>
            </div>
          </div>
        )

      case 'tujuan':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3">Tujuan Pembelajaran</h4>
              <ol className="list-decimal list-inside space-y-2">
                {generatedData.tujuan.map((tujuan, i) => (
                  <li key={i} className="text-slate-800">{tujuan}</li>
                ))}
              </ol>
            </div>
          </div>
        )

      case 'kegiatan':
        return (
          <div className="space-y-4">
            {generatedData.kegiatan.map((kegiatan) => (
              <div key={kegiatan.nomor} className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-emerald-600 text-white rounded-full font-bold text-sm">
                    {kegiatan.nomor}
                  </span>
                  <span className="text-slate-700">Kegiatan {kegiatan.nomor}</span>
                </div>
                <p className="text-slate-800 ml-11">{kegiatan.kegiatan}</p>
              </div>
            ))}
          </div>
        )

      case 'pertanyaan':
        return (
          <div className="space-y-4">
            {generatedData.pertanyaan.map((pertanyaan) => (
              <div key={pertanyaan.nomor} className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                    {pertanyaan.nomor}
                  </span>
                  <span className="text-slate-700 font-medium">Pertanyaan {pertanyaan.nomor}</span>
                </div>
                <p className="text-slate-800 ml-11">{pertanyaan.pertanyaan}</p>
              </div>
            ))}
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
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                <FileEditIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">LKPD Generator</h1>
                <p className="text-xs text-slate-500">Buat Lembar Kerja Peserta Didik yang terstruktur</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <FileEditIcon className="w-4 h-4" />
                  INFORMASI AKADEMIK
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">JENJANG <span className="text-red-500">*</span></label>
                      <select
                        name="jenjang"
                        value={formData.jenjang}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        required
                      >
                        <option value="">Pilih Jenjang</option>
                        {JENJANG_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">KELAS <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="kelas"
                        value={formData.kelas}
                        onChange={handleInputChange}
                        placeholder="Cth: X, 5, 12"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MATA PELAJARAN <span className="text-red-500">*</span></label>
                    <select
                      name="mataPelajaran"
                      value={formData.mataPelajaran}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      required
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
                        className="w-full mt-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MATERI POKOK <span className="text-red-500">*</span></label>
                    <textarea
                      name="materi"
                      value={formData.materi}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Cth: Bilangan Pecahan, Sistem Pencernaan Manusia, dll"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">JUMLAH SOAL</label>
                    <input
                      type="number"
                      name="jumlahSoal"
                      value={formData.jumlahSoal}
                      onChange={handleInputChange}
                      min="3"
                      max="20"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="text-lg">⚙️</span>
                  PENGATURAN TAMBAHAN
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">PETUNJUK KHUSUS (Opsional)</label>
                    <textarea
                      name="instruksi"
                      value={formData.instruksi}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Instruksi khusus untuk LKPD"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TUJUAN PEMBELAJARAN (Opsional)</label>
                    <textarea
                      name="tujuanPembelajaran"
                      value={formData.tujuanPembelajaran}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Tujuan pembelajaran spesifik yang diinginkan"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
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
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
              >
                {isLoading ? 'Sedang Memproses...' : 'Generate LKPD'}
              </button>

              {attempts > 0 && (
                <p className="text-xs text-center text-slate-500">
                  Selesai dalam {attempts} percobaan {attempts > 1 && '(dengan auto-retry)'}
                </p>
              )}
            </form>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white p-12 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <BrainIcon className="text-slate-600 w-10 h-10" />
                  </div>
                  <div className="absolute inset-0 border-4 border-t-emerald-600 border-slate-200 rounded-full animate-spin"></div>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Sedang Membuat LKPD...</h4>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
              </div>
            ) : generatedData ? (
              <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200">
                <ToolPreviewTabs tool="lkpd" activeTab={activeTab} onTabChange={setActiveTab} />
                {renderPreview()}
                <ToolActions onCopy={handleCopy} onDownload={handleDownload} />
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileEditIcon className="text-slate-400 w-10 h-10" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Belum Ada LKPD</h4>
                <p className="text-sm text-slate-500">Isi form di sebelah kiri dan klik "Generate LKPD" untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
