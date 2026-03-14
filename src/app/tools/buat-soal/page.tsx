"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ExamRenderer, ExamTabs, ExamActions, type ExamTab } from '@/components/exam-renderer';
import { exportToDocx, copyExamData } from '@/lib/exam-docx-export';
import type { ExamGenerationResponse } from '@/lib/exam-schema';

// --- ICONS ---
const IconBase = ({ children, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

const GraduationCap = (props: any) => (
  <IconBase {...props}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></IconBase>
);
const User = (props: any) => (
  <IconBase {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></IconBase>
);
const ArrowLeft = (props: any) => (
  <IconBase {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></IconBase>
);
const Brain = (props: any) => (
  <IconBase {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></IconBase>
);
const Settings = (props: any) => (
  <IconBase {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></IconBase>
);

// --- CONSTANTS ---
const MAPEL_OPTIONS = [
  "Pendidikan Agama", "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Bahasa Inggris", "Seni Budaya",
  "PJOK", "Informatika", "Prakarya", "Sejarah", "Fisika", "Kimia", "Biologi", "Geografi", "Ekonomi",
  "Sosiologi", "Lainnya"
];

const JENJANG_OPTIONS = ["PAUD/TK", "SD", "SMP", "SMA", "SMK"];
const TAHUN_OPTIONS = ["2024/2025", "2025/2026", "2026/2027"];

const TINGKAT_KESULITAN = ["Mudah", "Sedang", "Sulit"];
const TARIKA_BLOOM = ["C1", "C2", "C3", "C4", "C5", "C6"];

interface FormState {
  // Identitas Pendidik
  namaGuru: string;
  nipGuru: string;
  namaSekolah: string;
  namaKepsek: string;
  nipKepsek: string;

  // Informasi Akademik
  jenjang: string;
  kelas: string;
  mataPelajaran: string;
  mataPelajaranKustom: string;
  materiPokok: string;
  tahunPenyusunan: string;

  // Pengaturan Soal
  jumlahSoal: number;
  tipeSoal: string;
  tingkatKesulitan: string[];
  targetKognitif: string[];
  instruksiKhusus: string;
  kurikulum: string;
  teksReferensi: string;

  // Visualisasi
  visualisasiSoal: boolean;
}

export default function BuatSoalPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<ExamGenerationResponse | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<ExamTab>('naskah');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormState>({
    // Identitas Pendidik
    namaGuru: '',
    nipGuru: '',
    namaSekolah: '',
    namaKepsek: '',
    nipKepsek: '',

    // Informasi Akademik
    jenjang: '',
    kelas: '',
    mataPelajaran: '',
    mataPelajaranKustom: '',
    materiPokok: '',
    tahunPenyusunan: '2024/2025',

    // Pengaturan Soal
    jumlahSoal: 10,
    tipeSoal: 'Pilihan Ganda',
    tingkatKesulitan: ['Mudah', 'Sedang', 'Sulit'],
    targetKognitif: ['C1', 'C2', 'C3'],
    instruksiKhusus: '',
    kurikulum: '',
    teksReferensi: '',

    // Visualisasi
    visualisasiSoal: false,
  });

  // Load saved identity from sessionStorage
  useEffect(() => {
    const savedIdentitas = sessionStorage.getItem('globalIdentitasPendidik');
    if (savedIdentitas) {
      const parsedData = JSON.parse(savedIdentitas);
      setFormData((prev) => ({
        ...prev,
        namaGuru: parsedData.namaGuru || '',
        nipGuru: parsedData.nipGuru || '',
        namaSekolah: parsedData.namaSekolah || '',
        namaKepsek: parsedData.namaKepsek || '',
        nipKepsek: parsedData.nipKepsek || '',
      }));
    }
  }, []);

  // Save identity to sessionStorage when changed
  useEffect(() => {
    const identitasData = {
      namaGuru: formData.namaGuru,
      nipGuru: formData.nipGuru,
      namaSekolah: formData.namaSekolah,
      namaKepsek: formData.namaKepsek,
      nipKepsek: formData.nipKepsek
    };
    sessionStorage.setItem('globalIdentitasPendidik', JSON.stringify(identitasData));
  }, [formData.namaGuru, formData.nipGuru, formData.namaSekolah, formData.namaKepsek, formData.nipKepsek]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleKesulitan = (value: string) => {
    setFormData((prev) => {
      const isSelected = prev.tingkatKesulitan.includes(value);
      return {
        ...prev,
        tingkatKesulitan: isSelected
          ? prev.tingkatKesulitan.filter((v) => v !== value)
          : [...prev.tingkatKesulitan, value],
      };
    });
  };

  const toggleKognitif = (value: string) => {
    setFormData((prev) => {
      const isSelected = prev.targetKognitif.includes(value);
      return {
        ...prev,
        targetKognitif: isSelected
          ? prev.targetKognitif.filter((v) => v !== value)
          : [...prev.targetKognitif, value],
      };
    });
  };

  // NEW: Use JSON-based API
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Validation
    if (!formData.jenjang || !formData.kelas || !formData.mataPelajaran || !formData.materiPokok) {
      setError('Harap lengkapi semua field yang wajib diisi.');
      return;
    }

    if (formData.jumlahSoal < 1) {
      setError('Jumlah soal minimal adalah 1.');
      return;
    }

    if (formData.tingkatKesulitan.length === 0) {
      setError('Pilih minimal 1 tingkat kesulitan.');
      return;
    }

    setActiveTab('naskah');
    setError(null);
    setWarnings([]);
    setIsLoading(true);
    setGeneratedData(null);
    setGeneratedImages({});

    try {
      // Call the new structured API
      const response = await fetch('/api/ai/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Educator identity
          teacherName: formData.namaGuru,
          teacherNip: formData.nipGuru,
          schoolName: formData.namaSekolah,
          principalName: formData.namaKepsek,
          principalNip: formData.nipKepsek,

          // Academic info
          educationLevel: formData.jenjang,
          classLevel: formData.kelas,
          subject: formData.mataPelajaran === 'Lainnya' ? formData.mataPelajaranKustom : formData.mataPelajaran,
          topic: formData.materiPokok,
          year: formData.tahunPenyusunan,

          // Question settings
          totalQuestions: formData.jumlahSoal,
          questionType: formData.tipeSoal,
          difficultyLevels: formData.tingkatKesulitan,
          cognitiveLevels: formData.targetKognitif,
          curriculum: formData.kurikulum,
          specialInstructions: formData.instruksiKhusus,
          referenceText: formData.teksReferensi,

          // Visualization
          includeImages: formData.visualisasiSoal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (errorData.needsApiKey || errorData.invalidApiKey) {
          throw new Error(errorData.error || 'API Key tidak valid. Silakan periksa API Key Anda di halaman Profile.');
        }
        throw new Error(errorData.error || 'Gagal generate soal');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal generate soal');
      }

      setGeneratedData(result.data);
      setGeneratedImages(result.images || {});
      setAttempts(result.attempts || 1);
      setWarnings(result.warnings?.map((w: any) => w.message) || []);

    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memproses permintaan Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedData) return;
    await exportToDocx(generatedData, generatedImages);
  };

  const handleCopy = () => {
    if (!generatedData) return;
    copyExamData(generatedData);
    alert('Data soal berhasil disalin ke clipboard!');
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/"
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">Buat Soal Otomatis</h1>
                <p className="text-xs text-slate-500">Generate soal terstruktur dengan validasi otomatis</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Pengaturan Profil"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">Sistem Aktif</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Data Identitas Pendidik */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <User className="w-4 h-4" />
                  DATA IDENTITAS PENDIDIK
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">NIP GURU</label>
                      <input
                        type="text"
                        name="nipGuru"
                        value={formData.nipGuru}
                        onChange={handleInputChange}
                        placeholder="Cth: 19800101 200501 1 001"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">NAMA SEKOLAH / INSTANSI</label>
                      <input
                        type="text"
                        name="namaSekolah"
                        value={formData.namaSekolah}
                        onChange={handleInputChange}
                        placeholder="Cth: SD Negeri 1 Jakarta"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">NAMA KEPALA SEKOLAH</label>
                      <input
                        type="text"
                        name="namaKepsek"
                        value={formData.namaKepsek}
                        onChange={handleInputChange}
                        placeholder="Cth: Dra. Siti Aminah, M.Pd."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">NIP KEPALA SEKOLAH</label>
                      <input
                        type="text"
                        name="nipKepsek"
                        value={formData.nipKepsek}
                        onChange={handleInputChange}
                        placeholder="Cth: 19750202 200003 2 002"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Akademik */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <GraduationCap className="w-4 h-4" />
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
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">TAHUN PENYUSUNAN</label>
                      <select
                        name="tahunPenyusunan"
                        value={formData.tahunPenyusunan}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {TAHUN_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MATERI POKOK <span className="text-red-500">*</span></label>
                    <textarea
                      name="materiPokok"
                      value={formData.materiPokok}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Contoh: Bilangan Pecahan, Sistem Pencernaan Manusia, dll"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pengaturan Soal */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <Brain className="w-4 h-4" />
                  PENGATURAN SOAL
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">JUMLAH SOAL <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        name="jumlahSoal"
                        value={formData.jumlahSoal}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">TIPE SOAL</label>
                      <select
                        name="tipeSoal"
                        value={formData.tipeSoal}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Pilihan Ganda">Pilihan Ganda</option>
                        <option value="Esai/Uraian">Esai/Uraian</option>
                        <option value="Isian Singkat">Isian Singkat</option>
                        <option value="Benar/Salah">Benar/Salah</option>
                        <option value="Menjodohkan">Menjodohkan</option>
                        <option value="Campuran">Campuran</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-2">TINGKAT KESULITAN</label>
                    <div className="flex flex-wrap gap-2">
                      {TINGKAT_KESULITAN.map((tingkat) => {
                        const isSelected = formData.tingkatKesulitan.includes(tingkat);
                        return (
                          <button
                            key={tingkat}
                            type="button"
                            onClick={() => toggleKesulitan(tingkat)}
                            className={`px-4 py-2 font-bold rounded-lg border-2 transition-all text-sm ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {tingkat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-2">TARGET KOGNITIF (TAKSONOMI BLOOM)</label>
                    <div className="flex flex-wrap gap-2">
                      {TARIKA_BLOOM.map((level) => {
                        const isSelected = formData.targetKognitif.includes(level);
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => toggleKognitif(level)}
                            className={`px-3 py-1.5 font-bold rounded-lg border-2 transition-all text-xs ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">KURIKULUM (Opsional)</label>
                    <input
                      type="text"
                      name="kurikulum"
                      value={formData.kurikulum}
                      onChange={handleInputChange}
                      placeholder="Cth: Kurikulum Merdeka, KBC Kemenag"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">INSTRUKSI KHUSUS (Opsional)</label>
                    <textarea
                      name="instruksiKhusus"
                      value={formData.instruksiKhusus}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Cth: Buatlah soal berbentuk studi kasus"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TEKS REFERENSI (Opsional)</label>
                    <textarea
                      name="teksReferensi"
                      value={formData.teksReferensi}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Tempelkan teks materi di sini jika ada"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Visualisasi Soal */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                  <span className="text-lg">🖼️</span>
                  VISUALISASI SOAL
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="visualisasiSoal"
                      checked={formData.visualisasiSoal}
                      onChange={handleInputChange}
                      className="w-5 h-5 accent-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Sertakan gambar/ilustrasi secara otomatis pada soal
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-500 mt-2 ml-8">
                    Sistem akan membuat 2-3 soal yang mengharuskan siswa mengamati gambar.
                  </p>
                </div>
              </div>

              {/* Error Message */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                {isLoading ? 'Sedang Memproses...' : 'Generate Soal'}
              </button>

              {/* Attempts info */}
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
                    <Brain className="text-slate-600 w-10 h-10" />
                  </div>
                  <div className="absolute inset-0 border-4 border-t-blue-600 border-slate-200 rounded-full animate-spin"></div>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Sedang Merancang Soal...</h4>
                <p className="text-sm text-slate-500">Mohon tunggu sebentar, asisten AI sedang bekerja.</p>
                <p className="text-xs text-slate-400 mt-2">Menggunakan JSON terstruktur dengan validasi otomatis</p>
              </div>
            ) : generatedData ? (
              <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200">
                <ExamTabs activeTab={activeTab} onTabChange={setActiveTab} />
                <ExamRenderer data={generatedData} images={generatedImages} activeTab={activeTab} />
                <ExamActions
                  data={generatedData}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="text-slate-400 w-10 h-10" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Belum Ada Soal</h4>
                <p className="text-sm text-slate-500">Isi form di sebelah kiri dan klik "Generate Soal" untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
