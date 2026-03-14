// ============================================
// RPP / MODUL AJAR GENERATOR PAGE
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ToolPreviewTabs, ToolActions } from '@/components/tool-preview-tabs'
import type { RPPResponse } from '@/lib/tools-schema'
import { exportRPPToDocx, copyToolData } from '@/lib/tools-docx-export'

// Icons
const IconBase = ({ children, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
)

const BookOpenIcon = (props: any) => (
  <IconBase {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></IconBase>
)
const UserIcon = (props: any) => (
  <IconBase {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></IconBase>
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

// Constants
const MAPEL_OPTIONS = [
  "Pendidikan Agama", "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Bahasa Inggris", "Seni Budaya",
  "PJOK", "Informatika", "Prakarya", "Sejarah", "Fisika", "Kimia", "Biologi", "Geografi", "Ekonomi",
  "Sosiologi", "Lainnya"
]

const JENJANG_OPTIONS = ["PAUD/TK", "SD", "SMP", "SMA", "SMK", "Kuliah"]
const KURIKULUM_OPTIONS = ["Kurikulum Merdeka", "KBC Kemenag", "Kurikulum 2013", "Kurikulum 2006", "Lainnya"]
const ALOKASI_WAKTU_OPTIONS = ["1 x pertemuan", "2 x pertemuan", "1 minggu", "2 minggu", "1 semester"]

interface FormState {
  // Identitas Guru
  namaGuru: string
  sekolah: string

  // Informasi Akademik
  jenjang: string
  mataPelajaran: string
  mataPelajaranKustom: string
  kelas: string
  materi: string
  kurikulum: string
  alokasiWaktu: string

  // Tambahan
  tujuanPembelajaran: string
}

export default function RPPPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState<RPPResponse | null>(null)
  const [activeTab, setActiveTab] = useState('identitas')
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [warnings, setWarnings] = useState<string[]>([])

  const [formData, setFormData] = useState<FormState>({
    namaGuru: '',
    sekolah: '',
    jenjang: '',
    mataPelajaran: '',
    mataPelajaranKustom: '',
    kelas: '',
    materi: '',
    kurikulum: 'Kurikulum Merdeka',
    alokasiWaktu: '2 x pertemuan',
    tujuanPembelajaran: '',
  })

  // Load saved identity
  useEffect(() => {
    const saved = sessionStorage.getItem('globalIdentitasPendidik')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFormData((prev) => ({
        ...prev,
        namaGuru: parsed.namaGuru || '',
        sekolah: parsed.namaSekolah || '',
      }))
    }
  }, [])

  // Save identity
  useEffect(() => {
    const identitas = {
      namaGuru: formData.namaGuru,
      namaSekolah: formData.sekolah,
    }
    sessionStorage.setItem('globalIdentitasPendidik', JSON.stringify(identitas))
  }, [formData.namaGuru, formData.sekolah])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (!formData.jenjang || !formData.kelas || !formData.mataPelajaran || !formData.materi) {
      setError('Harap lengkapi field yang wajib diisi.')
      return
    }

    setActiveTab('identitas')
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
          tool: 'rpp',
          data: {
            namaGuru: formData.namaGuru || undefined,
            sekolah: formData.sekolah || undefined,
            mataPelajaran: mapel,
            kelas: formData.kelas,
            materi: formData.materi,
            jenjang: formData.jenjang,
            kurikulum: formData.kurikulum,
            alokasiWaktu: formData.alokasiWaktu,
            tujuanPembelajaran: formData.tujuanPembelajaran || undefined,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        if (errorData.needsApiKey || errorData.invalidApiKey) {
          throw new Error(errorData.error || 'API Key tidak valid')
        }
        throw new Error(errorData.error || 'Gagal generate RPP')
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal generate RPP')
      }

      setGeneratedData(result.data as RPPResponse)
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
    await exportRPPToDocx(generatedData)
  }

  const handleCopy = () => {
    if (!generatedData) return
    copyToolData(generatedData)
    alert('Data RPP berhasil disalin ke clipboard!')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    )
  }

  // Render preview content
  const renderPreview = () => {
    if (!generatedData) return null

    switch (activeTab) {
      case 'identitas':
        return (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3">Identitas Mata Pelajaran</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {generatedData.identitas.namaGuru && (
                  <div><span className="font-medium">Nama Guru:</span> {generatedData.identitas.namaGuru}</div>
                )}
                {generatedData.identitas.sekolah && (
                  <div><span className="font-medium">Sekolah:</span> {generatedData.identitas.sekolah}</div>
                )}
                <div><span className="font-medium">Mata Pelajaran:</span> {generatedData.identitas.mataPelajaran}</div>
                <div><span className="font-medium">Kelas:</span> {generatedData.identitas.kelas}</div>
                <div className="md:col-span-2"><span className="font-medium">Materi:</span> {generatedData.identitas.materi}</div>
                {generatedData.identitas.alokasiWaktu && (
                  <div><span className="font-medium">Alokasi Waktu:</span> {generatedData.identitas.alokasiWaktu}</div>
                )}
              </div>
            </div>
          </div>
        )

      case 'tujuan':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3">Tujuan Pembelajaran</h4>
              <ol className="list-decimal list-inside space-y-2">
                {generatedData.tujuanPembelajaran.map((tujuan, i) => (
                  <li key={i} className="text-slate-800">{tujuan}</li>
                ))}
              </ol>
            </div>
          </div>
        )

      case 'langkah':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Pendahuluan
              </h4>
              <p className="text-slate-700 text-justify ml-8">{generatedData.langkahPembelajaran.pendahuluan}</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Kegiatan Inti
              </h4>
              <p className="text-slate-700 text-justify ml-8 whitespace-pre-line">{generatedData.langkahPembelajaran.inti}</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Penutup
              </h4>
              <p className="text-slate-700 text-justify ml-8">{generatedData.langkahPembelajaran.penutup}</p>
            </div>
          </div>
        )

      case 'asesmen':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">No</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">Jenis</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">Teknik</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedData.asesmen.map((asesmen, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 border-b border-slate-200">{i + 1}</td>
                      <td className="px-4 py-3 border-b border-slate-200">{asesmen.jenis}</td>
                      <td className="px-4 py-3 border-b border-slate-200">{asesmen.teknik}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-3">Media Pembelajaran</h4>
              <ul className="list-disc list-inside space-y-1">
                {generatedData.mediaPembelajaran.map((media, i) => (
                  <li key={i} className="text-slate-800">{media}</li>
                ))}
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/"
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">RPP / Modul Ajar</h1>
                <p className="text-xs text-slate-500">Generate RPP terstruktur dengan kurikulum beragam</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Identitas Guru */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <UserIcon className="w-4 h-4" />
                  IDENTITAS GURU
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">NAMA GURU</label>
                    <input
                      type="text"
                      name="namaGuru"
                      value={formData.namaGuru}
                      onChange={handleInputChange}
                      placeholder="Cth: Budi Santoso, S.Pd."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">NAMA SEKOLAH</label>
                    <input
                      type="text"
                      name="sekolah"
                      value={formData.sekolah}
                      onChange={handleInputChange}
                      placeholder="Cth: SD Negeri 1 Jakarta"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Informasi Akademik */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <BookOpenIcon className="w-4 h-4" />
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                        className="w-full mt-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">KURIKULUM</label>
                      <select
                        name="kurikulum"
                        value={formData.kurikulum}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {KURIKULUM_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ALOKASI WAKTU</label>
                      <select
                        name="alokasiWaktu"
                        value={formData.alokasiWaktu}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {ALOKASI_WAKTU_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MATERI POKOK <span className="text-red-500">*</span></label>
                    <textarea
                      name="materi"
                      value={formData.materi}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Cth: Bilangan Pecahan, Sistem Pencernaan Manusia, dll"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TUJUAN PEMBELAJARAN (Opsional)</label>
                    <textarea
                      name="tujuanPembelajaran"
                      value={formData.tujuanPembelajaran}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Jika ada, tuliskan tujuan pembelajaran spesifik yang diinginkan"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                  <p className="font-semibold mb-1">Peringatan:</p>
                  <ul className="list-disc list-inside">
                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                {isLoading ? 'Sedang Memproses...' : 'Generate RPP'}
              </button>

              {attempts > 0 && (
                <p className="text-xs text-center text-slate-500">
                  Selesai dalam {attempts} percobaan {attempts > 1 && '(dengan auto-retry)'}
                </p>
              )}
            </form>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white p-12 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <BrainIcon className="text-slate-600 w-10 h-10" />
                  </div>
                  <div className="absolute inset-0 border-4 border-t-blue-600 border-slate-200 rounded-full animate-spin"></div>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Sedang Menyusun RPP...</h4>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
              </div>
            ) : generatedData ? (
              <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200">
                <ToolPreviewTabs tool="rpp" activeTab={activeTab} onTabChange={setActiveTab} />
                {renderPreview()}
                <ToolActions
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  downloadLabel="Download DOCX"
                />
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpenIcon className="text-slate-400 w-10 h-10" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Belum Ada RPP</h4>
                <p className="text-sm text-slate-500">Isi form di sebelah kiri dan klik "Generate RPP" untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
