// ============================================
// RPP / MODUL AJAR GENERATOR PAGE
// Client Feedback Implementation
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
const CheckIcon = (props: any) => (
  <IconBase {...props}><polyline points="20 6 9 17 4 12" /></IconBase>
)

// Constants
const MAPEL_MERDEKA = [
  { value: "", label: "Pilih Mata Pelajaran" },
  { value: "Matematika", label: "Matematika" },
  { value: "Bahasa Indonesia", label: "Bahasa Indonesia" },
  { value: "IPA", label: "IPA" },
  { value: "IPS", label: "IPS" },
  { value: "IPAS", label: "IPAS" },
  { value: "Bahasa Inggris", label: "Bahasa Inggris" },
  { value: "PJOK", label: "PJOK" },
  { value: "Seni Budaya", label: "Seni Budaya" },
  { value: "Pendidikan Agama & Budi Pekerti", label: "Pendidikan Agama & Budi Pekerti" },
  { value: "PPKn", label: "PPKn / PKn" },
  { value: "Prakarya", label: "Prakarya" },
  { value: "Informatika", label: "Informatika" },
  { value: "lainnya", label: "✏️  Lainnya — tulis sendiri" },
]

const MAPEL_K13 = [
  { value: "", label: "Pilih Mata Pelajaran" },
  { value: "Matematika", label: "Matematika" },
  { value: "Bahasa Indonesia", label: "Bahasa Indonesia" },
  { value: "IPA", label: "IPA" },
  { value: "IPS", label: "IPS" },
  { value: "Bahasa Inggris", label: "Bahasa Inggris" },
  { value: "PJOK", label: "PJOK" },
  { value: "Seni Budaya", label: "Seni Budaya" },
  { value: "Pendidikan Agama & Budi Pekerti", label: "Pendidikan Agama & Budi Pekerti" },
  { value: "PPKn", label: "PPKn" },
  { value: "Prakarya", label: "Prakarya" },
  { value: "Informatika", label: "Informatika" },
  { value: "lainnya", label: "✏️  Lainnya — tulis sendiri" },
]

const FASE_OPTIONS = [
  { value: "", label: "Pilih Fase" },
  { value: "A", label: "Fase A (Kls 1-2)" },
  { value: "B", label: "Fase B (Kls 3-4)" },
  { value: "C", label: "Fase C (Kls 5-6)" },
  { value: "D", label: "Fase D (Kls 7-9)" },
  { value: "E", label: "Fase E (Kls 10)" },
  { value: "F", label: "Fase F (Kls 11-12)" },
]

const PROFIL_PELAJAR_PANCASILA = [
  "Beriman & Bertakwa",
  "Berkebhinekaan Global",
  "Bergotong Royong",
  "Mandiri",
  "Bernalar Kritis",
  "Kreatif",
]

const MODEL_PEMBELAJARAN = [
  { value: "", label: "Pilih Model" },
  { value: "Problem Based Learning (PBL)", label: "Problem Based Learning (PBL)" },
  { value: "Project Based Learning (PjBL)", label: "Project Based Learning (PjBL)" },
  { value: "Discovery Learning", label: "Discovery Learning" },
  { value: "Inquiry Learning", label: "Inquiry Learning" },
  { value: "Cooperative Learning", label: "Cooperative Learning" },
  { value: "Direct Instruction", label: "Direct Instruction" },
  { value: "Contextual Teaching & Learning (CTL)", label: "Contextual Teaching & Learning (CTL)" },
]

const JENJANG_K13 = [
  { value: "", label: "Pilih" },
  { value: "SD", label: "SD" },
  { value: "SMP", label: "SMP" },
  { value: "SMA", label: "SMA" },
  { value: "SMK", label: "SMK" },
]

const JENIS_PENDIDIKAN_PESANTREN = [
  "Madrasah Diniyah Takmiliyah",
  "Madrasah Diniyah Formal",
  "Pendidikan Al-Quran (TPQ/TPA)",
  "Pendidikan Muadalah",
  "Pendidikan Pesantren (PP)",
]

const TINGKATAN_PESANTREN = [
  "Ula (Tingkat Dasar)",
  "Wustha (Tingkat Menengah)",
  "Ulya (Tingkat Atas)",
]

type CurriculumType = 'merdeka' | 'k13' | 'kemenag'
type NaunganType = 'madrasah' | 'pesantren'

interface FormState {
  // Identitas Guru
  namaGuru: string
  nipGuru: string

  // Kepala Sekolah
  namaKepsek: string
  nipKepsek: string

  // Data Institusi
  sekolah: string
  npsn: string
  tahunAjaran: string
  semester: string

  // Kurikulum
  kurikulum: CurriculumType

  // Merdeka
  fase?: string
  kelasMerdeka?: string
  jalurIKM?: string
  mapelMerdeka?: string
  mapelMerdekaLainnya?: string
  elemenCP?: string
  profilPelajarPancasila: string[]

  // K-13
  jenjangK13?: string
  kelasK13?: string
  versiK13?: string
  mapelK13?: string
  mapelK13Lainnya?: string

  // Kemenag
  naungan?: NaunganType
  jenjangKemenag?: string
  kelasKemenag?: string
  mapelKemenag?: string
  mapelKemenagLainnya?: string
  jenisPendidikan?: string
  tingkatanPesantren?: string
  mataKitab?: string

  // Detail Pembelajaran
  materiPokok: string
  alokasiJP: number
  alokasiPertemuan: number
  modelPembelajaran?: string
  metodePembelajaran?: string
  mediaSarana?: string
  tujuanPembelajaran?: string
}

const KELAS_OPTIONS = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

const MAPEL_KEMENAG: Record<string, string[]> = {
  MI: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'PJOK', 'Seni Budaya', 'PPKn', 'Bahasa Inggris', 'Quran Hadits', 'Akidah Akhlak', 'Fiqih', 'SKI', 'Bahasa Arab', 'Lainnya'],
  MTs: ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'PJOK', 'Seni Budaya', 'PPKn', 'Bahasa Inggris', 'Prakarya', 'Informatika', 'Quran Hadits', 'Akidah Akhlak', 'Fiqih', 'SKI', 'Bahasa Arab', 'Lainnya'],
  MA: ['Matematika', 'Bahasa Indonesia', 'Fisika', 'Kimia', 'Biologi', 'Ekonomi', 'Geografi', 'Sosiologi', 'PJOK', 'Seni Budaya', 'PPKn', 'Bahasa Inggris', 'Quran Hadits', 'Akidah Akhlak', 'Fiqih', 'SKI', 'Bahasa Arab', 'Ilmu Tafsir', 'Ilmu Hadits', 'Ilmu Kalam', 'Ilmu Ushul Fiqh', 'Lainnya'],
  MAK: ['Dasar Program Keahlian', 'Konsentrasi Keahlian', 'Quran Hadits', 'Akidah Akhlak', 'Fiqih', 'SKI', 'Bahasa Arab', 'Lainnya'],
}

const KELAS_KEMENAG: Record<string, number[]> = {
  MI: [1, 2, 3, 4, 5, 6],
  MTs: [7, 8, 9],
  MA: [10, 11, 12],
  MAK: [10, 11, 12],
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
    nipGuru: '',
    namaKepsek: '',
    nipKepsek: '',
    sekolah: '',
    npsn: '',
    tahunAjaran: '',
    semester: 'Semester 1 (Ganjil)',
    kurikulum: 'merdeka',
    fase: '',
    kelasMerdeka: '',
    jalurIKM: 'Mandiri Belajar',
    mapelMerdeka: '',
    mapelMerdekaLainnya: '',
    elemenCP: '',
    profilPelajarPancasila: [],
    jenjangK13: '',
    kelasK13: '',
    versiK13: 'K-13 Revisi (2017)',
    mapelK13: '',
    mapelK13Lainnya: '',
    naungan: 'madrasah',
    jenjangKemenag: '',
    kelasKemenag: '',
    mapelKemenag: '',
    mapelKemenagLainnya: '',
    jenisPendidikan: 'Madrasah Diniyah Takmiliyah',
    tingkatanPesantren: 'Ula (Tingkat Dasar)',
    mataKitab: '',
    materiPokok: '',
    alokasiJP: 2,
    alokasiPertemuan: 3,
    modelPembelajaran: '',
    metodePembelajaran: '',
    mediaSarana: '',
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
        nipGuru: parsed.nipGuru || '',
        namaKepsek: parsed.namaKepsek || '',
        nipKepsek: parsed.nipKepsek || '',
        npsn: parsed.npsn || '',
        tahunAjaran: parsed.tahunAjaran || '',
        semester: parsed.semester || 'Semester 1 (Ganjil)',
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

  const toggleProfilPancasila = (profil: string) => {
    setFormData((prev) => {
      const current = prev.profilPelajarPancasila || []
      if (current.includes(profil)) {
        return { ...prev, profilPelajarPancasila: current.filter(p => p !== profil) }
      }
      if (current.length >= 3) return prev
      return { ...prev, profilPelajarPancasila: [...current, profil] }
    })
  }

  const getKepsekLabel = () => {
    if (formData.kurikulum === 'kemenag') {
      return formData.naungan === 'pesantren' ? 'Pimpinan Pondok' : 'Kepala Madrasah'
    }
    return 'Kepala Sekolah'
  }

  const getSekolahLabel = () => {
    if (formData.kurikulum === 'kemenag') {
      return formData.naungan === 'pesantren' ? 'Nama Pondok' : 'Nama Madrasah'
    }
    return 'Nama Sekolah'
  }

  const getNPSNLabel = () => {
    if (formData.kurikulum === 'kemenag') {
      return 'NSM (Nomor Statistik Madrasah)'
    }
    return 'NPSN'
  }

  const getMapelValue = () => {
    switch (formData.kurikulum) {
      case 'merdeka':
        return formData.mapelMerdeka === 'lainnya' ? formData.mapelMerdekaLainnya : formData.mapelMerdeka
      case 'k13':
        return formData.mapelK13 === 'lainnya' ? formData.mapelK13Lainnya : formData.mapelK13
      case 'kemenag':
        if (formData.naungan === 'pesantren') {
          return formData.mataKitab
        }
        return formData.mapelKemenag === 'Lainnya' ? formData.mapelKemenagLainnya : formData.mapelKemenag
      default:
        return ''
    }
  }

  const getKelasValue = () => {
    switch (formData.kurikulum) {
      case 'merdeka':
        return formData.kelasMerdeka
      case 'k13':
        return formData.kelasK13
      case 'kemenag':
        return formData.kelasKemenag
      default:
        return ''
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const mapel = getMapelValue()
    const kelas = getKelasValue()

    if (!kelas || !mapel || !formData.materiPokok) {
      setError('Harap lengkapi field yang wajib diisi.')
      return
    }

    setActiveTab('identitas')
    setError(null)
    setWarnings([])
    setIsLoading(true)
    setGeneratedData(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'rpp',
          data: {
            namaGuru: formData.namaGuru || undefined,
            sekolah: formData.sekolah || undefined,
            nipGuru: formData.nipGuru || undefined,
            namaKepsek: formData.namaKepsek || undefined,
            nipKepsek: formData.nipKepsek || undefined,
            npsn: formData.npsn || undefined,
            tahunAjaran: formData.tahunAjaran || undefined,
            semester: formData.semester || undefined,
            mataPelajaran: mapel,
            kelas: kelas,
            materi: formData.materiPokok,
            kurikulum: formData.kurikulum === 'merdeka' ? 'Kurikulum Merdeka' :
                      formData.kurikulum === 'k13' ? 'Kurikulum 2013' : 'KBC Kemenag',
            fase: formData.fase || undefined,
            elemenCP: formData.elemenCP || undefined,
            profilPelajarPancasila: formData.profilPelajarPancasila || undefined,
            modelPembelajaran: formData.modelPembelajaran || undefined,
            metodePembelajaran: formData.metodePembelajaran || undefined,
            mediaSarana: formData.mediaSarana || undefined,
            alokasiWaktu: `${formData.alokasiJP} JP × ${formData.alokasiPertemuan} pertemuan`,
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

  const getGenerateButtonClass = () => {
    const baseClass = "w-full py-4 rounded-2xl font-bold transition-all shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
    switch (formData.kurikulum) {
      case 'merdeka':
        return `${baseClass} bg-[#042C53] text-[#B5D4F4] hover:bg-[#063875] shadow-blue-200`
      case 'k13':
        return `${baseClass} bg-[#185FA5] text-[#E6F1FB] hover:bg-[#1A73BD] shadow-blue-300`
      case 'kemenag':
        return `${baseClass} bg-[#3B6D11] text-[#EAF3DE] hover:bg-[#4A8B15] shadow-green-200`
      default:
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200`
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
                <p className="text-xs text-slate-500">Kurikulum Merdeka · K-13 · KBC Kemenag</p>
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
                  <UserIcon className="w-4 h-4" />
                  Identitas
                  <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-normal">Tersimpan otomatis</span>
                </h3>

                {/* Data Guru */}
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1 border-b border-slate-100">Data Guru</div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama Guru <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-medium text-slate-600 mb-1">NIP / NUPTK</label>
                    <input
                      type="text"
                      name="nipGuru"
                      value={formData.nipGuru}
                      onChange={handleInputChange}
                      placeholder="Cth: 198504012009012003"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Data Kepala Sekolah */}
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Institusi */}
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1 border-b border-slate-100">Data Institusi</div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{getSekolahLabel()} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="sekolah"
                      value={formData.sekolah}
                      onChange={handleInputChange}
                      placeholder={formData.kurikulum === 'kemenag' ? "Cth: MTs Negeri 2 Makassar" : "Cth: SMP Negeri 3 Surabaya"}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{getNPSNLabel()}</label>
                    <input
                      type="text"
                      name="npsn"
                      value={formData.npsn}
                      onChange={handleInputChange}
                      placeholder={formData.kurikulum === 'kemenag' ? "Cth: 121173710002" : "Cth: 20532741"}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tahun Ajaran <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="tahunAjaran"
                      value={formData.tahunAjaran}
                      onChange={handleInputChange}
                      placeholder="Cth: 2025 / 2026"
                      maxLength={12}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Ketik bebas, misal: 2025/2026 atau 2026/2027</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Semester <span className="text-red-500">*</span></label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option>Semester 1 (Ganjil)</option>
                      <option>Semester 2 (Genap)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* KURIKULUM */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <BookOpenIcon className="w-4 h-4" />
                  Pilih Kurikulum
                </h3>

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
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Fase <span className="text-red-500">*</span></label>
                        <select
                          name="fase"
                          value={formData.fase}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {FASE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Kelas <span className="text-red-500">*</span></label>
                        <select
                          name="kelasMerdeka"
                          value={formData.kelasMerdeka}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {KELAS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Pilih'}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Jalur IKM</label>
                        <select
                          name="jalurIKM"
                          value={formData.jalurIKM}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option>Mandiri Belajar</option>
                          <option>Mandiri Berubah</option>
                          <option>Mandiri Berbagi</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran <span className="text-red-500">*</span></label>
                      <select
                        name="mapelMerdeka"
                        value={formData.mapelMerdeka}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {MAPEL_MERDEKA.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      {formData.mapelMerdeka === 'lainnya' && (
                        <div className="mt-2 relative">
                          <input
                            type="text"
                            name="mapelMerdekaLainnya"
                            value={formData.mapelMerdekaLainnya}
                            onChange={handleInputChange}
                            placeholder="Tulis nama mata pelajaran..."
                            className="w-full bg-purple-50 border border-purple-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500">✏️</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-50 border-l-2 border-blue-500 rounded-lg p-3">
                      <div className="text-xs font-semibold text-blue-700 mb-2">Khusus Kurikulum Merdeka</div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Elemen / Domain CP <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="elemenCP"
                          value={formData.elemenCP}
                          onChange={handleInputChange}
                          placeholder="Cth: Bilangan, Aljabar, Geometri..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Profil Pelajar Pancasila <span className="text-red-500">*</span>
                          <span className="font-normal text-slate-400">(pilih maks. 3)</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {PROFIL_PELAJAR_PANCASILA.map(profil => (
                            <button
                              key={profil}
                              type="button"
                              onClick={() => toggleProfilPancasila(profil)}
                              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                                formData.profilPelajarPancasila.includes(profil)
                                  ? 'bg-green-100 text-green-700 border-green-400'
                                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {profil}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* K-13 Panel */}
                {formData.kurikulum === 'k13' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Jenjang <span className="text-red-500">*</span></label>
                        <select
                          name="jenjangK13"
                          value={formData.jenjangK13}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {JENJANG_K13.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Kelas <span className="text-red-500">*</span></label>
                        <select
                          name="kelasK13"
                          value={formData.kelasK13}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {KELAS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Pilih'}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Versi K-13</label>
                        <select
                          name="versiK13"
                          value={formData.versiK13}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option>K-13 Revisi (2017)</option>
                          <option>K-13 Original (2013)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran <span className="text-red-500">*</span></label>
                      <select
                        name="mapelK13"
                        value={formData.mapelK13}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {MAPEL_K13.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      {formData.mapelK13 === 'lainnya' && (
                        <div className="mt-2 relative">
                          <input
                            type="text"
                            name="mapelK13Lainnya"
                            value={formData.mapelK13Lainnya}
                            onChange={handleInputChange}
                            placeholder="Tulis nama mata pelajaran..."
                            className="w-full bg-purple-50 border border-purple-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500">✏️</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Kemenag Panel */}
                {formData.kurikulum === 'kemenag' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Naungan Institusi <span className="text-red-500">*</span></label>
                      <div className="flex gap-4 flex-wrap">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="naungan"
                            checked={formData.naungan === 'madrasah'}
                            onChange={() => setFormData(prev => ({ ...prev, naungan: 'madrasah' }))}
                            className="w-4 h-4 text-green-600"
                          />
                          Madrasah (MI / MTs / MA / MAK)
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="naungan"
                            checked={formData.naungan === 'pesantren'}
                            onChange={() => setFormData(prev => ({ ...prev, naungan: 'pesantren' }))}
                            className="w-4 h-4 text-green-600"
                          />
                          Pesantren / Madrasah Diniyah
                        </label>
                      </div>
                    </div>

                    {formData.naungan === 'madrasah' && (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Jenjang <span className="text-red-500">*</span></label>
                            <select
                              name="jenjangKemenag"
                              value={formData.jenjangKemenag}
                              onChange={(e) => {
                                handleInputChange(e)
                                setFormData(prev => ({ ...prev, kelasKemenag: '', mapelKemenag: '' }))
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="">Pilih</option>
                              {(KELAS_KEMENAG[formData.jenjangKemenag || ''] || []).map(k => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Semester <span className="text-red-500">*</span></label>
                            <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                              <option>Semester 1</option>
                              <option>Semester 2</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran <span className="text-red-500">*</span></label>
                          <select
                            name="mapelKemenag"
                            value={formData.mapelKemenag}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={!formData.jenjangKemenag}
                          >
                            <option value="">
                              {formData.jenjangKemenag ? 'Pilih Mata Pelajaran' : '— Pilih jenjang dulu —'}
                            </option>
                            {(MAPEL_KEMENAG[formData.jenjangKemenag || ''] || []).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          {formData.mapelKemenag === 'Lainnya' && (
                            <div className="mt-2 relative">
                              <input
                                type="text"
                                name="mapelKemenagLainnya"
                                value={formData.mapelKemenagLainnya}
                                onChange={handleInputChange}
                                placeholder="Tulis nama mata pelajaran..."
                                className="w-full bg-purple-50 border border-purple-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500">✏️</span>
                            </div>
                          )}
                        </div>
                        {formData.jenjangKemenag && (
                          <div className="bg-green-50 border-l-2 border-green-500 rounded-lg p-2 text-xs text-slate-600">
                            <div className="font-semibold text-green-700 mb-1">Mapel PAI & Bahasa Arab — tersedia otomatis sesuai jenjang</div>
                            <div className="leading-relaxed">
                              <strong>MI:</strong> Quran Hadits · Akidah Akhlak · Fiqih · SKI · Bahasa Arab<br />
                              <strong>MTs / MA:</strong> + Ilmu Tafsir · Ilmu Hadits · Ilmu Kalam
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {formData.naungan === 'pesantren' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Pendidikan <span className="text-red-500">*</span></label>
                            <select
                              name="jenisPendidikan"
                              value={formData.jenisPendidikan}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              {JENIS_PENDIDIKAN_PESANTREN.map(j => (
                                <option key={j} value={j}>{j}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Tingkatan <span className="text-red-500">*</span></label>
                            <select
                              name="tingkatanPesantren"
                              value={formData.tingkatanPesantren}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              {TINGKATAN_PESANTREN.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Mata Kitab / Pelajaran <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="mataKitab"
                            value={formData.mataKitab}
                            onChange={handleInputChange}
                            placeholder="Cth: Fathul Qarib, Safinatun Najah, Jurumiyah..."
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* DETAIL PEMBELAJARAN */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <BookOpenIcon className="w-4 h-4" />
                  Detail Pembelajaran
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Materi Pokok <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="materiPokok"
                      value={formData.materiPokok}
                      onChange={handleInputChange}
                      placeholder="Cth: Bilangan Pecahan, Thaharah..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Alokasi Waktu <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="alokasiJP"
                        value={formData.alokasiJP}
                        onChange={handleInputChange}
                        min="1"
                        className="w-14 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xs text-slate-500">JP ×</span>
                      <input
                        type="number"
                        name="alokasiPertemuan"
                        value={formData.alokasiPertemuan}
                        onChange={handleInputChange}
                        min="1"
                        className="w-14 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xs text-slate-500">pertemuan</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Model Pembelajaran <span className="text-red-500">*</span></label>
                    <select
                      name="modelPembelajaran"
                      value={formData.modelPembelajaran}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {MODEL_PEMBELAJARAN.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Metode Pembelajaran</label>
                    <input
                      type="text"
                      name="metodePembelajaran"
                      value={formData.metodePembelajaran}
                      onChange={handleInputChange}
                      placeholder="Cth: Diskusi, Demonstrasi, Sorogan..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Media & Sarana <span className="text-slate-400 font-normal">(opsional)</span></label>
                  <input
                    type="text"
                    name="mediaSarana"
                    value={formData.mediaSarana}
                    onChange={handleInputChange}
                    placeholder="Cth: LCD, LKPD, Video, Kitab Kuning..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Tujuan Pembelajaran
                    <span className="text-slate-400 font-normal">(opsional — AI generate otomatis jika kosong)</span>
                  </label>
                  <textarea
                    name="tujuanPembelajaran"
                    value={formData.tujuanPembelajaran}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Jika ada tujuan spesifik, tuliskan di sini..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
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
                className={getGenerateButtonClass()}
              >
                {isLoading ? 'Sedang Memproses...' : 'Generate RPP / Modul Ajar'}
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
                  <div className="absolute inset-0 border-4 border-t-blue-600 border-slate-200 rounded-full animate-spin"></div>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Sedang Menyusun RPP...</h4>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
              </div>
            ) : generatedData ? (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                <ToolPreviewTabs tool="rpp" activeTab={activeTab} onTabChange={setActiveTab} />
                {renderPreview()}
                <ToolActions
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  downloadLabel="Download DOCX"
                />
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-24">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="text-slate-400 w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Struktur dokumen yang dihasilkan</h4>
                <div className="text-left text-sm text-slate-600 space-y-2">
                  {formData.kurikulum === 'merdeka' && (
                    <>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#042C53] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>Identitas & Informasi Umum</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#042C53] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>Capaian & Tujuan Pembelajaran</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#042C53] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>Profil Pelajar Pancasila</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#042C53] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>Kegiatan Pembelajaran</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#042C53] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>Asesmen</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#042C53] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">6</span>Pengesahan</div>
                    </>
                  )}
                  {formData.kurikulum === 'k13' && (
                    <>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#185FA5] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>Identitas RPP</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#185FA5] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>Kompetensi Inti (KI 1–4)</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#185FA5] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>KD, IPK & Tujuan</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#185FA5] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>Kegiatan Pembelajaran</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#185FA5] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>Penilaian</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#185FA5] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">6</span>Pengesahan</div>
                    </>
                  )}
                  {formData.kurikulum === 'kemenag' && (
                    <>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#3B6D11] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>Identitas Madrasah & Guru</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#3B6D11] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>CP / KD sesuai KBC</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#3B6D11] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>Nilai Islam & Moderasi</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#3B6D11] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>Kegiatan Pembelajaran</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#3B6D11] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>Penilaian</div>
                      <div className="flex gap-2 items-start"><span className="w-5 h-5 rounded-full bg-[#3B6D11] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">6</span>Pengesahan</div>
                    </>
                  )}
                </div>
                <div className="mt-4 p-3 rounded-lg text-xs text-slate-600 bg-slate-50">
                  Sesuai format <strong>{formData.kurikulum === 'merdeka' ? 'Modul Ajar' : formData.kurikulum === 'k13' ? 'RPP K-13' : 'KBC Kemenag'}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
