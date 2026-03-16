// ============================================
// BUAT SOAL OTOMATIS PAGE
// Client Feedback Implementation
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ExamRenderer, ExamTabs, ExamActions, type ExamTab } from '@/components/exam-renderer'
import { exportToDocx, copyExamData } from '@/lib/exam-docx-export'
import type { ExamGenerationResponse } from '@/lib/exam-schema'

// Icons
const IconBase = ({ children, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
)

const GraduationCap = (props: any) => (
  <IconBase {...props}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></IconBase>
)
const ArrowLeft = (props: any) => (
  <IconBase {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></IconBase>
)
const Brain = (props: any) => (
  <IconBase {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 2.5 0 0 1 1.98-3A2.5 2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 2.5 0 0 0-1.98-3A2.5 2.5 2.5 0 0 0 14.5 2Z" /></IconBase>
)
const Settings = (props: any) => (
  <IconBase {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></IconBase>
)
const CheckIcon = (props: any) => (
  <IconBase {...props}><polyline points="20 6 9 17 4 12" /></IconBase>
)

// Constants
const KELAS_OPTIONS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const JENJANG_OPTIONS = ["", "SD", "SMP", "SMA", "SMK"]
const SEMESTER_OPTIONS = ["Semester 1", "Semester 2"]
const FASE_OPTIONS = ["", "Fase A (1-2)", "Fase B (3-4)", "Fase C (5-6)", "Fase D (7-9)", "Fase E (10)", "Fase F (11-12)"]

const MAPEL_OPTIONS = [
  { value: "", label: "Pilih Mata Pelajaran" },
  { value: "Matematika", label: "Matematika" },
  { value: "Bahasa Indonesia", label: "Bahasa Indonesia" },
  { value: "IPA", label: "IPA" },
  { value: "IPS", label: "IPS" },
  { value: "IPAS", label: "IPAS" },
  { value: "Bahasa Inggris", label: "Bahasa Inggris" },
  { value: "Fisika", label: "Fisika" },
  { value: "Kimia", label: "Kimia" },
  { value: "Biologi", label: "Biologi" },
  { value: "Ekonomi", label: "Ekonomi" },
  { value: "Sejarah", label: "Sejarah" },
  { value: "Geografi", label: "Geografi" },
  { value: "PJOK", label: "PJOK" },
  { value: "Seni Budaya", label: "Seni Budaya" },
  { value: "PPKn", label: "PPKn" },
  { value: "Prakarya", label: "Prakarya" },
  { value: "Informatika", label: "Informatika" },
  { value: "Quran Hadits", label: "Quran Hadits" },
  { value: "Akidah Akhlak", label: "Akidah Akhlak" },
  { value: "Fiqih", label: "Fiqih" },
  { value: "SKI", label: "SKI" },
  { value: "Bahasa Arab", label: "Bahasa Arab" },
  { value: "lainnya", label: "✏️  Lainnya — tulis sendiri" },
]

const ASESMEN_TYPES = [
  { id: 'harian', name: 'Ulangan Harian', icon: '📋', desc: 'Per KD/materi, 1 pertemuan', hal: '3-4', wkt: '45' },
  { id: 'pts', name: 'PTS / UTS', icon: '📄', desc: 'Tengah semester, multi-KD', hal: '5-6', wkt: '90' },
  { id: 'pas', name: 'PAS / UAS', icon: '📑', desc: 'Akhir semester, komprehensif', hal: '6-8', wkt: '120' },
  { id: 'akm', name: 'AKM / Literasi', icon: '🎯', desc: 'Berbasis stimulus teks/data', hal: '4-5', wkt: '90' },
]

const TIPE_SOAL = [
  'Pilihan Ganda', 'PG Kompleks (AKM)', 'Uraian', 'Isian Singkat', 'Benar / Salah', 'Menjodohkan'
]

const OUTPUT_FORMATS = [
  { id: 'soal', name: 'Soal Saja', icon: '📄', desc: 'Untuk dibagikan ke siswa — tanpa kunci' },
  { id: 'kunci', name: 'Soal + Kunci Jawaban', icon: '🔑', desc: 'Untuk pegangan guru' },
  { id: 'pembahasan', name: 'Soal + Kunci + Pembahasan', icon: '📚', desc: 'Lengkap dengan langkah penyelesaian' },
  { id: 'kartu', name: 'Kartu Soal', icon: '🗂️', desc: 'Format resmi — KD, indikator, level, kunci' },
]

type CurriculumType = 'merdeka' | 'k13' | 'kemenag'
type AsesmenType = 'harian' | 'pts' | 'pas' | 'akm'
type OutputFormat = 'soal' | 'kunci' | 'pembahasan' | 'kartu'

interface DifficultyDist {
  mudah: number
  sedang: number
  sulit: number
  enabled: { mudah: boolean, sedang: boolean, sulit: boolean }
}

interface KomposisiSoal {
  tipe: string
  jumlah: number
}

interface FormState {
  // Identitas
  namaGuru: string
  nipGuru: string
  namaKepsek: string
  nipKepsek: string
  sekolah: string
  npsn: string

  // Akademik
  kurikulum: CurriculumType
  jenjang: string
  kelas: string
  fase?: string
  mataPelajaran: string
  mataPelajaranLainnya?: string
  tahunAjaran: string
  semester: string
  materiPokok: string
  kdCpTp?: string

  // Kemenag
  jenjangKemenag?: string
  kelasKemenag?: string

  // Asesmen
  jenisAsesmen: AsesmenType

  // Pengaturan Soal
  tipeSoal: string[]
  komposisiSoal: KomposisiSoal[]
  distribusiKesulitan: DifficultyDist
  targetKognitif: string[]

  // Output
  formatOutput: OutputFormat

  // Tambahan
  konteksKhusus?: string
  teksReferensi?: string
  sertakanGambar: boolean
}

const KELAS_KEMENAG: Record<string, number[]> = {
  MI: [1, 2, 3, 4, 5, 6],
  MTs: [7, 8, 9],
  MA: [10, 11, 12],
  MAK: [10, 11, 12],
}

export default function BuatSoalPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState<ExamGenerationResponse | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({})
  const [activeTab, setActiveTab] = useState<ExamTab>('naskah')
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [warnings, setWarnings] = useState<string[]>([])

  const [formData, setFormData] = useState<FormState>({
    namaGuru: '',
    nipGuru: '',
    namaKepsek: '',
    nipKepsek: '',
    sekolah: '',
    npsn: '',
    kurikulum: 'merdeka',
    jenjang: '',
    kelas: '',
    fase: '',
    mataPelajaran: '',
    mataPelajaranLainnya: '',
    tahunAjaran: '',
    semester: 'Semester 1',
    materiPokok: '',
    kdCpTp: '',
    jenjangKemenag: '',
    kelasKemenag: '',
    jenisAsesmen: 'harian',
    tipeSoal: ['Pilihan Ganda', 'Uraian'],
    komposisiSoal: [
      { tipe: 'Pilihan Ganda', jumlah: 10 },
      { tipe: 'Uraian', jumlah: 5 },
    ],
    distribusiKesulitan: {
      mudah: 5,
      sedang: 3,
      sulit: 2,
      enabled: { mudah: true, sedang: true, sulit: true }
    },
    targetKognitif: ['C1', 'C2', 'C3', 'C4'],
    formatOutput: 'soal',
    konteksKhusus: '',
    teksReferensi: '',
    sertakanGambar: false,
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
        nipGuru: parsed.nipGuru || '',
        namaKepsek: parsed.namaKepsek || '',
        nipKepsek: parsed.nipKepsek || '',
        npsn: parsed.npsn || '',
        tahunAjaran: parsed.tahunAjaran || '',
        semester: parsed.semester || 'Semester 1',
      }))
    }
  }, [])

  // Save identity
  useEffect(() => {
    const identitas = {
      namaGuru: formData.namaGuru,
      namaSekolah: formData.sekolah,
      nipGuru: formData.nipGuru,
      namaKepsek: formData.namaKepsek,
      nipKepsek: formData.nipKepsek,
      npsn: formData.npsn,
      tahunAjaran: formData.tahunAjaran,
      semester: formData.semester,
    }
    sessionStorage.setItem('globalIdentitasPendidik', JSON.stringify(identitas))
  }, [formData.namaGuru, formData.sekolah, formData.nipGuru, formData.namaKepsek, formData.nipKepsek, formData.npsn, formData.tahunAjaran, formData.semester])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleKurikulumChange = (kurikulum: CurriculumType) => {
    setFormData((prev) => ({ ...prev, kurikulum }))
  }

  const toggleTipeSoal = (tipe: string) => {
    setFormData((prev) => {
      const exists = prev.tipeSoal.includes(tipe)
      let newTipeSoal: string[]
      if (exists) {
        newTipeSoal = prev.tipeSoal.filter(t => t !== tipe)
      } else {
        newTipeSoal = [...prev.tipeSoal, tipe]
      }
      const newKomposisi = newTipeSoal.map(t => ({
        tipe: t,
        jumlah: prev.komposisiSoal.find(k => k.tipe === tipe)?.jumlah || 5
      }))
      return { ...prev, tipeSoal: newTipeSoal, komposisiSoal: newKomposisi }
    })
  }

  const updateKomposisi = (tipe: string, jumlah: number) => {
    setFormData((prev) => ({
      ...prev,
      komposisiSoal: prev.komposisiSoal.map(k =>
        k.tipe === tipe ? { ...k, jumlah } : k
      )
    }))
  }

  const getTotalSoal = () => {
    return formData.komposisiSoal.reduce((sum, k) => sum + k.jumlah, 0)
  }

  const adjustDifficultyCount = (level: 'mudah' | 'sedang' | 'sulit', delta: number) => {
    if (!formData.distribusiKesulitan.enabled[level]) return
    setFormData((prev) => {
      const newCount = Math.max(0, prev.distribusiKesulitan[level] + delta)
      return {
        ...prev,
        distribusiKesulitan: {
          ...prev.distribusiKesulitan,
          [level]: newCount
        }
      }
    })
  }

  const toggleDifficulty = (level: 'mudah' | 'sedang' | 'sulit') => {
    setFormData((prev) => {
      const newState = !prev.distribusiKesulitan.enabled[level]
      return {
        ...prev,
        distribusiKesulitan: {
          ...prev.distribusiKesulitan,
          enabled: {
            ...prev.distribusiKesulitan.enabled,
            [level]: newState
          },
          [level]: newState ? (level === 'mudah' ? 5 : level === 'sedang' ? 3 : 2) : 0
        }
      }
    })
  }

  const toggleKognitif = (level: string) => {
    setFormData((prev) => {
      const exists = prev.targetKognitif.includes(level)
      return {
        ...prev,
        targetKognitif: exists
          ? prev.targetKognitif.filter(l => l !== level)
          : [...prev.targetKognitif, level]
      }
    })
  }

  const getKepsekLabel = () => {
    return formData.kurikulum === 'kemenag' ? 'Kepala Madrasah' : 'Kepala Sekolah'
  }

  const getSekolahLabel = () => {
    return formData.kurikulum === 'kemenag' ? 'Nama Madrasah' : 'Nama Sekolah'
  }

  const getKelasValue = () => {
    if (formData.kurikulum === 'kemenag') return formData.kelasKemenag
    return formData.kelas
  }

  const getMapelValue = () => {
    return formData.mataPelajaran === 'lainnya' ? formData.mataPelajaranLainnya : formData.mataPelajaran
  }

  const getAsesmenInfo = () => ASESMEN_TYPES.find(a => a.id === formData.jenisAsesmen) || ASESMEN_TYPES[0]

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (!getKelasValue() || !formData.mataPelajaran || !formData.materiPokok) {
      setError('Harap lengkapi field yang wajib diisi.')
      return
    }

    setActiveTab('naskah')
    setError(null)
    setWarnings([])
    setIsLoading(true)
    setGeneratedData(null)
    setGeneratedImages({})

    try {
      const mapel = getMapelValue()
      const kelas = getKelasValue()

      const response = await fetch('/api/ai/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherName: formData.namaGuru || undefined,
          teacherNip: formData.nipGuru || undefined,
          schoolName: formData.sekolah || undefined,
          principalName: formData.namaKepsek || undefined,
          principalNip: formData.nipKepsek || undefined,
          educationLevel: formData.jenjang || undefined,
          classLevel: kelas,
          subject: mapel,
          topic: formData.materiPokok,
          tahunAjaran: formData.tahunAjaran || undefined,
          semester: formData.semester || undefined,
          kurikulum: formData.kurikulum === 'merdeka' ? 'Kurikulum Merdeka' :
                    formData.kurikulum === 'k13' ? 'Kurikulum 2013' : 'KBC Kemenag',
          kdCpTp: formData.kdCpTp || undefined,
          jenisAsesmen: getAsesmenInfo().name,
          tipeSoal: formData.tipeSoal,
          komposisiSoal: formData.komposisiSoal,
          distribusiKesulitan: formData.distribusiKesulitan,
          targetKognitif: formData.targetKognitif,
          formatOutput: formData.formatOutput,
          konteksKhusus: formData.konteksKhusus || undefined,
          teksReferensi: formData.teksReferensi || undefined,
          includeImages: formData.sertakanGambar,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        if (errorData.needsApiKey || errorData.invalidApiKey) {
          throw new Error(errorData.error || 'API Key tidak valid')
        }
        throw new Error(errorData.error || 'Gagal generate soal')
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal generate soal')
      }

      setGeneratedData(result.data)
      setGeneratedImages(result.images || {})
      setAttempts(result.attempts || 1)
      setWarnings(result.warnings?.map((w: any) => w.message) || [])

    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedData) return
    await exportToDocx(generatedData, generatedImages)
  }

  const handleCopy = () => {
    if (!generatedData) return
    copyExamData(generatedData)
    alert('Data soal berhasil disalin ke clipboard!')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="border-t-4 border-red-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    )
  }

  const getTabButtonClass = (type: CurriculumType) => {
    const baseClass = "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
    if (formData.kurikulum === type) {
      switch (type) {
        case 'merdeka':
          return `${baseClass} bg-[#042C53] text-[#B5D4F4]`
        case 'k13':
          return `${baseClass} bg-[#185FA5] text-[#E6F1FB]`
        case 'kemenag':
          return `${baseClass} bg-[#3B6D11] text-[#EAF3DE]`
      }
    }
    return `${baseClass} bg-transparent text-slate-500 border border-slate-300 hover:bg-slate-50`
  }

  const getDifficultyTotal = () => {
    const { mudah, sedang, sulit } = formData.distribusiKesulitan
    return mudah + sedang + sulit
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">Buat Soal Otomatis</h1>
                <p className="text-xs text-slate-500">Generate soal terstruktur dengan validasi format & distribusi level kognitif</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CheckIcon className="w-3.5 h-3.5 text-green-600" />
              Profil tersimpan
            </div>
            <Link href="/profile" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleGenerate} className="space-y-4">

              {/* IDENTITAS */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Identitas
                  <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-normal">Dari profil guru</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama Guru <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="namaGuru"
                      value={formData.namaGuru}
                      onChange={handleInputChange}
                      placeholder="Cth: Drs. Hendra Kurniawan, M.Si."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">NIP / NUPTK</label>
                    <input
                      type="text"
                      name="nipGuru"
                      value={formData.nipGuru}
                      onChange={handleInputChange}
                      placeholder="Cth: 196908201994031003"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 border-l-4 border-l-green-500 rounded-lg p-3 mb-4">
                  <div className="text-[10px] font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    Data Kepala Sekolah / Madrasah
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nama {getKepsekLabel()} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="namaKepsek"
                        value={formData.namaKepsek}
                        onChange={handleInputChange}
                        placeholder="Cth: Dra. Nurhaedah, M.Pd."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">NIP {getKepsekLabel()}</label>
                      <input
                        type="text"
                        name="nipKepsek"
                        value={formData.nipKepsek}
                        onChange={handleInputChange}
                        placeholder="Cth: 196605211992012001"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{getSekolahLabel()} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="sekolah"
                      value={formData.sekolah}
                      onChange={handleInputChange}
                      placeholder="Cth: SMA Negeri 1 Makassar"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{formData.kurikulum === 'kemenag' ? 'NSM' : 'NPSN'}</label>
                    <input
                      type="text"
                      name="npsn"
                      value={formData.npsn}
                      onChange={handleInputChange}
                      placeholder="Cth: 40307550"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* INFORMASI AKADEMIK */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Informasi Akademik
                </h3>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1 border-b border-slate-100">Kurikulum</div>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => handleKurikulumChange('merdeka')}
                    className={getTabButtonClass('merdeka')}
                  >
                    <div>Kurikulum Merdeka</div>
                    <div className="text-[10px] opacity-75">Kemendikbudristek</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKurikulumChange('k13')}
                    className={getTabButtonClass('k13')}
                  >
                    <div>Kurikulum K-13</div>
                    <div className="text-[10px] opacity-75">K-13 / K-13 Revisi</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKurikulumChange('kemenag')}
                    className={getTabButtonClass('kemenag')}
                  >
                    <div>KBC Kemenag</div>
                    <div className="text-[10px] opacity-75">Kementerian Agama RI</div>
                  </button>
                </div>

                {/* Merdeka Panel */}
                {formData.kurikulum === 'merdeka' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Jenjang <span className="text-red-500">*</span></label>
                      <select
                        name="jenjang"
                        value={formData.jenjang}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        <option value="">Pilih</option>
                        {JENJANG_OPTIONS.map(opt => opt && <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Kelas <span className="text-red-500">*</span></label>
                      <select
                        name="kelas"
                        value={formData.kelas}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        {KELAS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Pilih'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Fase</label>
                      <select
                        name="fase"
                        value={formData.fase}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        {FASE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Pilih'}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* K-13 Panel */}
                {formData.kurikulum === 'k13' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Jenjang <span className="text-red-500">*</span></label>
                      <select
                        name="jenjang"
                        value={formData.jenjang}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        <option value="">Pilih</option>
                        {JENJANG_OPTIONS.map(opt => opt && <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Kelas <span className="text-red-500">*</span></label>
                      <select
                        name="kelas"
                        value={formData.kelas}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        {KELAS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Pilih'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Versi K-13</label>
                      <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none">
                        <option>K-13 Revisi (2017)</option>
                        <option>K-13 Original (2013)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Kemenag Panel */}
                {formData.kurikulum === 'kemenag' && (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Naungan Institusi <span className="text-red-500">*</span></label>
                      <div className="flex gap-4 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked className="w-4 h-4 text-red-600" />
                          Madrasah (MI / MTs / MA / MAK)
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Jenjang <span className="text-red-500">*</span></label>
                        <select
                          name="jenjangKemenag"
                          value={formData.jenjangKemenag}
                          onChange={(e) => {
                            handleInputChange(e)
                            setFormData(prev => ({ ...prev, kelasKemenag: '' }))
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        >
                          <option value="">Pilih</option>
                          <option value="MI">MI</option>
                          <option value="MTs">MTs</option>
                          <option value="MA">MA</option>
                          <option value="MAK">MAK</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Kelas <span className="text-red-500">*</span></label>
                        <select
                          name="kelasKemenag"
                          value={formData.kelasKemenag}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        >
                          <option value="">Pilih</option>
                          {(KELAS_KEMENAG[formData.jenjangKemenag || ''] || []).map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Common fields */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran <span className="text-red-500">*</span></label>
                  <select
                    name="mataPelajaran"
                    value={formData.mataPelajaran}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    {MAPEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  {formData.mataPelajaran === 'lainnya' && (
                    <div className="mt-2 relative">
                      <input
                        type="text"
                        name="mataPelajaranLainnya"
                        value={formData.mataPelajaranLainnya}
                        onChange={handleInputChange}
                        placeholder="Tulis nama mata pelajaran..."
                        className="w-full bg-purple-50 border border-purple-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500">✏️</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tahun Ajaran <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="tahunAjaran"
                      value={formData.tahunAjaran}
                      onChange={handleInputChange}
                      placeholder="Cth: 2025/2026"
                      maxLength={12}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Ketik bebas</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Semester <span className="text-red-500">*</span></label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Materi Pokok <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="materiPokok"
                      value={formData.materiPokok}
                      onChange={handleInputChange}
                      placeholder="Cth: Sistem Pencernaan..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    KD / CP / TP yang Dirujuk
                    <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <textarea
                    name="kdCpTp"
                    value={formData.kdCpTp}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Cth: 3.7 Menganalisis hubungan antara struktur jaringan..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* JENIS ASESMEN */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Jenis Asesmen <span className="text-red-500">*</span>
                </h3>

                <div className="grid grid-cols-4 gap-2">
                  {ASESMEN_TYPES.map((asesmen) => (
                    <button
                      key={asesmen.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, jenisAsesmen: asesmen.id as AsesmenType }))}
                      className={`p-2 rounded-lg text-center border transition-all ${
                        formData.jenisAsesmen === asesmen.id
                          ? 'border-[#E24B4A] bg-[#FEF2F2]'
                          : 'border-slate-200 hover:border-red-300'
                      }`}
                    >
                      <div className="text-base mb-1">{asesmen.icon}</div>
                      <div className={`text-xs font-medium ${formData.jenisAsesmen === asesmen.id ? 'text-[#A32D2D]' : 'text-slate-600'}`}>
                        {asesmen.name}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{asesmen.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PENGATURAN SOAL */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Pengaturan Soal
                </h3>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1 border-b border-slate-100">
                  Tipe Soal (pilih satu atau lebih)
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {TIPE_SOAL.map((tipe) => (
                    <button
                      key={tipe}
                      type="button"
                      onClick={() => toggleTipeSoal(tipe)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                        formData.tipeSoal.includes(tipe)
                          ? 'bg-[#FEF2F2] text-[#A32D2D] border-[#F09595]'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-red-300'
                      }`}
                    >
                      {tipe}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1 border-b border-slate-100">
                  Komposisi Soal per Tipe
                </div>
                <div className="space-y-2 mb-2">
                  {formData.komposisiSoal.map((komp, idx) => (
                    <div key={komp.tipe} className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 w-32">{komp.tipe}</span>
                      <input
                        type="number"
                        value={komp.jumlah}
                        onChange={(e) => updateKomposisi(komp.tipe, parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-14 bg-white border border-slate-200 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-red-500 outline-none"
                      />
                      <span className="text-xs text-slate-400 w-8">soal</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((komp.jumlah / 15) * 100, 100)}%`,
                            backgroundColor: ['#E24B4A', '#BA7517', '#185FA5', '#1D9E75'][idx % 4]
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500">
                  Total: <span className="font-medium text-slate-700">{getTotalSoal()}</span> soal
                </div>

                {/* Distribusi Kesulitan & Target Kognitif */}
                <div className="mt-4 bg-slate-50 rounded-lg p-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Distribusi Kesulitan & Target Kognitif
                  </div>

                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Distribusi Kesulitan</div>
                  {(['mudah', 'sedang', 'sulit'] as const).map((level) => (
                    <div key={level} className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => toggleDifficulty(level)}
                        className={`w-4 h-4 rounded text-[10px] flex items-center justify-center ${
                          formData.distribusiKesulitan.enabled[level] ? 'bg-[#E24B4A] text-white' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {formData.distribusiKesulitan.enabled[level] ? '✓' : ''}
                      </button>
                      <span className={`text-sm font-medium w-16 ${
                        level === 'mudah' ? 'text-[#166534]' : level === 'sedang' ? 'text-[#854D0E]' : 'text-[#991B1B]'
                      }`}>{level === 'mudah' ? 'Mudah' : level === 'sedang' ? 'Sedang' : 'Sulit'}</span>
                      <div className="flex items-center border border-slate-200 rounded bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => adjustDifficultyCount(level, -1)}
                          disabled={!formData.distribusiKesulitan.enabled[level]}
                          className="w-7 h-8 text-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                        >
                          −
                        </button>
                        <div className="w-9 h-8 text-center leading-8 text-sm font-medium text-slate-700 border-l border-r border-slate-200">
                          {formData.distribusiKesulitan[level]}
                        </div>
                        <button
                          type="button"
                          onClick={() => adjustDifficultyCount(level, 1)}
                          disabled={!formData.distribusiKesulitan.enabled[level]}
                          className="w-7 h-8 text-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-slate-500">
                    Total: <span className="font-medium text-slate-700">{getDifficultyTotal()}</span> soal terdistribusi
                  </div>

                  <div className="border-t border-slate-200 my-3"></div>

                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Target Kognitif (Taksonomi Bloom)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleKognitif(c)}
                        className={`w-11 h-9 rounded-md border text-sm font-medium transition-all ${
                          formData.targetKognitif.includes(c)
                            ? 'bg-[#378ADD] text-white border-[#185FA5]'
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FORMAT OUTPUT */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Format Dokumen Output <span className="text-red-500">*</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {OUTPUT_FORMATS.map((format) => (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, formatOutput: format.id as OutputFormat }))}
                      className={`p-3 rounded-lg text-left border transition-all flex items-start gap-2 ${
                        formData.formatOutput === format.id
                          ? 'border-[#E24B4A] bg-[#FEF2F2]'
                          : 'border-slate-200 hover:border-red-300'
                      }`}
                    >
                      <span className="text-base">{format.icon}</span>
                      <div>
                        <div className={`text-xs font-medium ${formData.formatOutput === format.id ? 'text-[#A32D2D]' : 'text-slate-700'}`}>
                          {format.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{format.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PENGATURAN TAMBAHAN */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Pengaturan Tambahan
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Konteks / Instruksi Khusus
                      <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      name="konteksKhusus"
                      value={formData.konteksKhusus}
                      onChange={handleInputChange}
                      placeholder="Cth: Gunakan konteks kehidupan sehari-hari, hindari soal abstrak..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Teks Referensi
                      <span className="text-slate-400 font-normal">(opsional — tempel materi sebagai dasar soal)</span>
                    </label>
                    <textarea
                      name="teksReferensi"
                      value={formData.teksReferensi}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Tempelkan teks materi di sini..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-sm text-slate-700">Sertakan Gambar / Ilustrasi Secara Otomatis</div>
                      <div className="text-xs text-slate-400">AI akan menyisipkan deskripsi gambar atau ilustrasi kontekstual pada soal yang relevan</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sertakanGambar: !prev.sertakanGambar }))}
                      className={`w-11 h-6 rounded-full transition-all ${
                        formData.sertakanGambar ? 'bg-[#378ADD]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${
                        formData.sertakanGambar ? 'translate-x-5' : 'translate-x-0.5'
                      }`}></div>
                    </button>
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
                className="w-full bg-[#A32D2D] text-[#FEF2F2] py-4 rounded-2xl font-bold hover:bg-[#8B231F] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-red-200"
              >
                {isLoading ? 'Sedang Memproses...' : 'Generate Soal'}
              </button>

              {attempts > 0 && (
                <p className="text-xs text-center text-slate-500">
                  Selesai dalam {attempts} percobaan {attempts > 1 && '(dengan auto-retry)'}
                </p>
              )}
            </form>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-24">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Brain className="text-slate-600 w-8 h-8" />
                  </div>
                  <div className="absolute inset-0 border-4 border-t-red-600 border-slate-200 rounded-full animate-spin"></div>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Sedang Merancang Soal...</h4>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
              </div>
            ) : generatedData ? (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                <ExamTabs activeTab={activeTab} onTabChange={setActiveTab} />
                <ExamRenderer data={generatedData} images={generatedImages} activeTab={activeTab} />
                <ExamActions
                  data={generatedData}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-24">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="text-slate-400 w-8 h-8" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900">Struktur paket soal yang dihasilkan</h4>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#FEF2F2] text-[#A32D2D] font-medium">
                    {getAsesmenInfo().name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-600">
                    Materi: {formData.materiPokok || '—'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-600">
                    {formData.kurikulum === 'merdeka' ? 'Merdeka' : formData.kurikulum === 'k13' ? 'K-13' : 'KBC'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-600">
                    {formData.tipeSoal.join(' + ')}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-600">
                    {getTotalSoal()} soal
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>Halaman Judul / Kop Soal</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>Petunjuk Pengerjaan</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <div>Soal Pilihan Ganda</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <div>Soal Uraian</div>
                  </div>
                  {formData.formatOutput === 'kunci' || formData.formatOutput === 'pembahasan' ? (
                    <div className="flex gap-2 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                      <div>Kunci Jawaban</div>
                    </div>
                  ) : null}
                  {formData.formatOutput === 'pembahasan' ? (
                    <div className="flex gap-2 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                      <div>Pembahasan Lengkap</div>
                    </div>
                  ) : null}
                  {formData.formatOutput === 'kartu' ? (
                    <div className="flex gap-2 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                      <div>Kartu Soal</div>
                    </div>
                  ) : null}
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {formData.formatOutput === 'pembahasan' ? '7' : formData.formatOutput === 'kunci' ? '6' : '5'}
                    </span>
                    <div>Pedoman Penskoran</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#A32D2D] text-[#FEF2F2] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {formData.formatOutput === 'pembahasan' ? '8' : formData.formatOutput === 'kunci' ? '7' : '6'}
                    </span>
                    <div>Pengesahan</div>
                  </div>
                </div>

                {/* Distribusi Visual */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">Distribusi kesulitan soal:</div>
                  <div className="flex h-4.5 rounded-md overflow-hidden gap-0.5">
                    {formData.distribusiKesulitan.enabled.mudah && formData.distribusiKesulitan.mudah > 0 && (
                      <div
                        className="flex items-center justify-center text-[10px] font-medium text-[#166534]"
                        style={{ width: `${(formData.distribusiKesulitan.mudah / getDifficultyTotal()) * 100}%` }}
                      >
                        Mudah {formData.distribusiKesulitan.mudah}
                      </div>
                    )}
                    {formData.distribusiKesulitan.enabled.sedang && formData.distribusiKesulitan.sedang > 0 && (
                      <div
                        className="flex items-center justify-center text-[10px] font-medium text-[#854D0E]"
                        style={{ width: `${(formData.distribusiKesulitan.sedang / getDifficultyTotal()) * 100}%` }}
                      >
                        Sedang {formData.distribusiKesulitan.sedang}
                      </div>
                    )}
                    {formData.distribusiKesulitan.enabled.sulit && formData.distribusiKesulitan.sulit > 0 && (
                      <div
                        className="flex items-center justify-center text-[10px] font-medium text-[#991B1B]"
                        style={{ width: `${(formData.distribusiKesulitan.sulit / getDifficultyTotal()) * 100}%` }}
                      >
                        Sulit {formData.distribusiKesulitan.sulit}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Target kognitif aktif:</div>
                  <div className="flex gap-1 flex-wrap">
                    {formData.targetKognitif.map(c => (
                      <span key={c} className="text-xs px-2 py-1 rounded-full bg-[#E6F1FB] text-[#185FA5]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg text-xs text-slate-600 bg-[#FEF2F2] mt-4">
                  Paket soal <strong>{getAsesmenInfo().name}</strong> {getAsesmenInfo().desc.toLowerCase()}.
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-[#A32D2D]">{getTotalSoal()}</div>
                    <div className="text-[10px] text-slate-400">total soal</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-[#A32D2D]">{getAsesmenInfo().hal}</div>
                    <div className="text-[10px] text-slate-400">halaman</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-[#A32D2D]">{getAsesmenInfo().wkt}</div>
                    <div className="text-[10px] text-slate-400">menit est.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
