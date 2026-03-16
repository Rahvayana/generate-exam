// ============================================
// LKPD GENERATOR PAGE
// Client Feedback Implementation
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
const CheckIcon = (props: any) => (
  <IconBase {...props}><polyline points="20 6 9 17 4 12" /></IconBase>
)

// Constants
const KELAS_OPTIONS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const JENJANG_OPTIONS = ["", "SD", "SMP", "SMA", "SMK"]
const SEMESTER_OPTIONS = ["Semester 1", "Semester 2"]
const FASE_OPTIONS = ["", "Fase A", "Fase B", "Fase C", "Fase D", "Fase E", "Fase F"]

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

const TIPE_LKPD = [
  { id: 'eksploratif', name: 'Eksploratif', icon: '🔍', desc: 'Penemuan konsep mandiri' },
  { id: 'latihan', name: 'Latihan / Drill', icon: '✏️', desc: 'Soal terstruktur & berulang' },
  { id: 'praktikum', name: 'Praktikum', icon: '🔬', desc: 'Panduan percobaan/eksperimen' },
  { id: 'proyek', name: 'Proyek (PjBL)', icon: '📐', desc: 'Panduan kerja proyek' },
  { id: 'remedi', name: 'Remedi', icon: '🔄', desc: 'Untuk peserta belum tuntas' },
  { id: 'pengayaan', name: 'Pengayaan', icon: '🚀', desc: 'Tantangan lebih tinggi' },
]

const TIPE_SOAL = [
  'Pilihan Ganda', 'Uraian', 'Isian Singkat', 'Benar / Salah',
  'Menjodohkan', 'Tabel Pengamatan', 'Essay Reflektif'
]

const KOMPOSISI_COLORS = ['#1D9E75', '#BA7517', '#185FA5', '#E24B4A', '#6C3483', '#0E4D4D', '#B06A00']

type CurriculumType = 'merdeka' | 'k13' | 'kemenag'
type TipeLKPD = 'eksploratif' | 'latihan' | 'praktikum' | 'proyek' | 'remedi' | 'pengayaan'
type KolomJawaban = 'ada' | 'tanpa' | 'kunci'

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
  alokasiWaktu: number
  materiPokok: string
  kdCpTp?: string

  // Kemenag
  jenjangKemenag?: string
  kelasKemenag?: string

  // Tipe LKPD
  tipeLKPD: TipeLKPD

  // Pengaturan Soal
  tipeSoal: string[]
  komposisiSoal: KomposisiSoal[]
  kolomJawaban: KolomJawaban

  // Tambahan
  konteksTema?: string
  catatanKhusus?: string
  sertakanGambar: boolean
}

const KELAS_KEMENAG: Record<string, number[]> = {
  MI: [1, 2, 3, 4, 5, 6],
  MTs: [7, 8, 9],
  MA: [10, 11, 12],
  MAK: [10, 11, 12],
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
    alokasiWaktu: 30,
    materiPokok: '',
    kdCpTp: '',
    jenjangKemenag: '',
    kelasKemenag: '',
    tipeLKPD: 'eksploratif',
    tipeSoal: ['Pilihan Ganda', 'Uraian'],
    komposisiSoal: [
      { tipe: 'Pilihan Ganda', jumlah: 5 },
      { tipe: 'Uraian', jumlah: 5 },
    ],
    kolomJawaban: 'ada',
    konteksTema: '',
    catatanKhusus: '',
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (!getKelasValue() || !formData.mataPelajaran || !formData.materiPokok) {
      setError('Harap lengkapi field yang wajib diisi.')
      return
    }

    setActiveTab('judul')
    setError(null)
    setWarnings([])
    setIsLoading(true)
    setGeneratedData(null)

    try {
      const mapel = getMapelValue()
      const kelas = getKelasValue()

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'lkpd',
          data: {
            namaGuru: formData.namaGuru || undefined,
            sekolah: formData.sekolah || undefined,
            nipGuru: formData.nipGuru || undefined,
            namaKepsek: formData.namaKepsek || undefined,
            nipKepsek: formData.nipKepsek || undefined,
            npsn: formData.npsn || undefined,
            mataPelajaran: mapel,
            kelas: kelas,
            materi: formData.materiPokok,
            jenjang: formData.jenjang,
            kurikulum: formData.kurikulum === 'merdeka' ? 'Kurikulum Merdeka' :
                      formData.kurikulum === 'k13' ? 'Kurikulum 2013' : 'KBC Kemenag',
            tahunAjaran: formData.tahunAjaran || undefined,
            semester: formData.semester || undefined,
            alokasiWaktu: `${formData.alokasiWaktu} menit`,
            kdCpTp: formData.kdCpTp || undefined,
            tipeLKPD: formData.tipeLKPD,
            tipeSoal: formData.tipeSoal,
            komposisiSoal: formData.komposisiSoal,
            kolomJawaban: formData.kolomJawaban,
            konteksTema: formData.konteksTema || undefined,
            catatanKhusus: formData.catatanKhusus || undefined,
            sertakanGambar: formData.sertakanGambar,
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

  const getTipeLKPDInfo = () => {
    const info = {
      eksploratif: { label: 'Eksploratif', hal: '2-3', akt: '4-6', notice: 'LKPD Eksploratif mendorong peserta didik menemukan konsep sendiri melalui kegiatan berpikir terstruktur — sesuai prinsip student-centered Kurikulum Merdeka.' },
      latihan: { label: 'Latihan / Drill', hal: '2-3', akt: '2-3', notice: 'LKPD Latihan/Drill cocok untuk memperkuat pemahaman melalui soal terstruktur berjenjang. Komposisi soal bisa dikustomisasi.' },
      praktikum: { label: 'Praktikum', hal: '3-4', akt: '5-7', notice: 'LKPD Praktikum memandu peserta didik melakukan percobaan ilmiah secara sistematis — lengkap dengan tabel data dan analisis.' },
      proyek: { label: 'Proyek (PjBL)', hal: '3-5', akt: '6-8', notice: 'LKPD Proyek memfasilitasi pembelajaran berbasis proyek nyata — lengkap jadwal, pembagian tugas, dan rubrik penilaian.' },
      remedi: { label: 'Remedi', hal: '2-3', akt: '3-4', notice: 'LKPD Remedi dirancang untuk peserta didik yang belum mencapai KKM/KKTP — dengan pendekatan scaffolding dan soal pembahasan terpandu.' },
      pengayaan: { label: 'Pengayaan', hal: '2-4', akt: '4-5', notice: 'LKPD Pengayaan memberikan tantangan lebih tinggi (HOTS) bagi peserta didik yang sudah melampaui capaian standar.' },
    }
    return info[formData.tipeLKPD]
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
                <p className="text-xs text-slate-500">Buat Lembar Kerja Peserta Didik terstruktur & siap pakai</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CheckIcon className="w-3.5 h-3.5 text-green-600" />
              Profil tersimpan
            </div>
            <Link href="/profile" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <SettingsIcon className="w-5 h-5" />
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
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
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
                      placeholder="Cth: Siti Rahayu, S.Pd."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">NIP / NUPTK</label>
                    <input
                      type="text"
                      name="nipGuru"
                      value={formData.nipGuru}
                      onChange={handleInputChange}
                      placeholder="Cth: 198703152010012005"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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
                        placeholder="Cth: Dr. Ahmad Yusuf, M.Pd."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">NIP {getKepsekLabel()}</label>
                      <input
                        type="text"
                        name="nipKepsek"
                        value={formData.nipKepsek}
                        onChange={handleInputChange}
                        placeholder="Cth: 196804121993031005"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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
                      placeholder="Cth: SMP Negeri 3 Surabaya"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{formData.kurikulum === 'kemenag' ? 'NSM' : 'NPSN'}</label>
                    <input
                      type="text"
                      name="npsn"
                      value={formData.npsn}
                      onChange={handleInputChange}
                      placeholder="Cth: 20532741"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* INFORMASI AKADEMIK */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {KELAS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Pilih'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Versi K-13</label>
                      <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
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
                          <input type="radio" checked className="w-4 h-4 text-emerald-600" />
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
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Ketik bebas</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Semester <span className="text-red-500">*</span></label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Alokasi Waktu <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="alokasiWaktu"
                        value={formData.alokasiWaktu}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-xs text-slate-500">menit</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Materi Pokok <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="materiPokok"
                    value={formData.materiPokok}
                    onChange={handleInputChange}
                    placeholder="Cth: Sistem Pencernaan Manusia, Operasi Bilangan Bulat..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    KD / CP / TP yang Dirujuk
                    <span className="text-slate-400 font-normal">(opsional — auto jika kosong)</span>
                  </label>
                  <textarea
                    name="kdCpTp"
                    value={formData.kdCpTp}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Cth: Peserta didik dapat menganalisis hubungan struktur organ pencernaan..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* TIPE LKPD */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Tipe LKPD <span className="text-red-500">*</span>
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {TIPE_LKPD.map((tipe) => (
                    <button
                      key={tipe.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tipeLKPD: tipe.id as TipeLKPD }))}
                      className={`p-3 rounded-lg text-center border transition-all ${
                        formData.tipeLKPD === tipe.id
                          ? 'border-[#1D9E75] bg-[#EAF3DE]'
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{tipe.icon}</div>
                      <div className={`text-xs font-medium ${formData.tipeLKPD === tipe.id ? 'text-[#0F6E56]' : 'text-slate-600'}`}>
                        {tipe.name}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{tipe.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PENGATURAN SOAL */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Pengaturan Soal & Kegiatan
                </h3>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1 border-b border-slate-100">
                  Tipe Soal / Kegiatan (pilih satu atau lebih)
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {TIPE_SOAL.map((tipe) => (
                    <button
                      key={tipe}
                      type="button"
                      onClick={() => toggleTipeSoal(tipe)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                        formData.tipeSoal.includes(tipe)
                          ? 'bg-[#EAF3DE] text-[#0F6E56] border-[#5DCAA5]'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {tipe}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1 border-b border-slate-100">
                  Komposisi per Tipe
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
                        className="w-14 bg-white border border-slate-200 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-xs text-slate-400 w-8">soal</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((komp.jumlah / 10) * 100, 100)}%`,
                            backgroundColor: KOMPOSISI_COLORS[idx % KOMPOSISI_COLORS.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500">
                  Total: <span className="font-medium text-slate-700">{getTotalSoal()}</span> soal
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 mt-3 pb-1 border-b border-slate-100">
                  Kolom Jawaban Peserta Didik
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: 'ada' as KolomJawaban, label: 'Ada kolom jawaban' },
                    { id: 'tanpa' as KolomJawaban, label: 'Tanpa kolom jawaban' },
                    { id: 'kunci' as KolomJawaban, label: 'Kolom + Kunci (versi guru)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, kolomJawaban: opt.id }))}
                      className={`flex-1 py-2 rounded-md text-xs border transition-all ${
                        formData.kolomJawaban === opt.id
                          ? 'bg-[#EAF3DE] text-[#0F6E56] border-[#5DCAA5]'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PENGATURAN TAMBAHAN */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Pengaturan Tambahan
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Konteks / Tema Soal
                      <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      name="konteksTema"
                      value={formData.konteksTema}
                      onChange={handleInputChange}
                      placeholder="Cth: Kehidupan sehari-hari, Lingkungan hidup, Keuangan sederhana..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Catatan Khusus untuk AI
                      <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      name="catatanKhusus"
                      value={formData.catatanKhusus}
                      onChange={handleInputChange}
                      placeholder="Cth: Hindari soal yang butuh gambar, gunakan bilangan di bawah 100..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-sm text-slate-700">Sertakan Gambar / Ilustrasi Secara Otomatis</div>
                      <div className="text-xs text-slate-400">AI akan menyisipkan deskripsi gambar atau ilustrasi kontekstual jika relevan</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sertakanGambar: !prev.sertakanGambar }))}
                      className={`w-11 h-6 rounded-full transition-all ${
                        formData.sertakanGambar ? 'bg-[#1D9E75]' : 'bg-slate-300'
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
                className="w-full bg-[#1A4731] text-[#EAF3DE] py-4 rounded-2xl font-bold hover:bg-[#0F2E1D] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
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

          {/* Preview Section */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-24">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <BrainIcon className="text-slate-600 w-8 h-8" />
                  </div>
                  <div className="absolute inset-0 border-4 border-t-emerald-600 border-slate-200 rounded-full animate-spin"></div>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Sedang Membuat LKPD...</h4>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
              </div>
            ) : generatedData ? (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                <ToolPreviewTabs tool="lkpd" activeTab={activeTab} onTabChange={setActiveTab} />
                {renderPreview()}
                <ToolActions onCopy={handleCopy} onDownload={handleDownload} />
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-24">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileEditIcon className="text-slate-400 w-8 h-8" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900">Struktur LKPD yang dihasilkan</h4>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#EAF3DE] text-[#3B6D11] font-medium">
                    {getTipeLKPDInfo().label}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 mb-3 leading-relaxed">
                  LKPD {getTipeLKPDInfo().label} · {formData.materiPokok || '—'} · Kelas {getKelasValue() || '—'} · {formData.semester || 'Sem 1'} · {formData.tahunAjaran || '2025/2026'}
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#1A4731] text-[#EAF3DE] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>Header & Identitas LKPD</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#1A4731] text-[#EAF3DE] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>KD / CP & Tujuan Pembelajaran</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#1A4731] text-[#EAF3DE] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <div>Petunjuk Pengerjaan</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#1A4731] text-[#EAF3DE] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <div>Apersepsi / Stimulus</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#1A4731] text-[#EAF3DE] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                    <div>Kegiatan Penemuan / Latihan</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#1A4731] text-[#EAF3DE] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                    <div>Pertanyaan / Soal</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#1A4731] text-[#EAF3DE] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">7</span>
                    <div>Refleksi & Kesimpulan</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#1A4731] text-[#EAF3DE] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">8</span>
                    <div>Rekap Nilai & Pengesahan</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg text-xs text-slate-600 bg-[#EAF3DE] mt-4">
                  {getTipeLKPDInfo().notice}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-[#1A4731]">{getTipeLKPDInfo().hal}</div>
                    <div className="text-[10px] text-slate-400">halaman</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-[#1A4731]">{getTipeLKPDInfo().akt}</div>
                    <div className="text-[10px] text-slate-400">aktivitas</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-[#1A4731]">{getTotalSoal()}</div>
                    <div className="text-[10px] text-slate-400">soal/item</div>
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
