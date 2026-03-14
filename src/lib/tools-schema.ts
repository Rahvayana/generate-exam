// ============================================
// SHARED SCHEMA FOR ALL AI TOOLS
// ============================================

// Base types
export type ToolType = 'rpp' | 'lkpd' | 'materi' | 'presentasi' | 'rubrik' | 'icebreak' | 'refleksi'

// ============================================
// RPP / MODUL AJAR
// ============================================

export interface RPPRequest {
  namaGuru?: string
  sekolah?: string
  mataPelajaran: string
  kelas: string
  materi: string
  alokasiWaktu?: string
  tujuanPembelajaran?: string
  kurikulum?: string
  jenjang?: string
}

export interface RPPResponse {
  identitas: {
    namaGuru?: string
    sekolah?: string
    mataPelajaran: string
    kelas: string
    materi: string
    alokasiWaktu?: string
  }
  tujuanPembelajaran: string[]
  langkahPembelajaran: {
    pendahuluan: string
    inti: string
    penutup: string
  }
  asesmen: {
    jenis: string
    teknik: string
  }[]
  mediaPembelajaran: string[]
}

// ============================================
// LKPD
// ============================================

export interface LKPDRequest {
  mataPelajaran: string
  kelas: string
  materi: string
  tujuanPembelajaran?: string
  instruksi?: string
  jumlahSoal?: number
  jenjang?: string
}

export interface LKPDResponse {
  judul: string
  petunjuk: string
  tujuan: string[]
  kegiatan: {
    nomor: number
    kegiatan: string
  }[]
  pertanyaan: {
    nomor: number
    pertanyaan: string
  }[]
}

// ============================================
// RINGKASAN MATERI
// ============================================

export interface MateriRequest {
  mataPelajaran: string
  kelas: string
  materi: string
  teksReferensi?: string
  jenjang?: string
  kedalaman?: 'ringkas' | 'sedang' | 'lengkap'
}

export interface MateriResponse {
  judul: string
  ringkasan: string
  poinPenting: string[]
  contoh?: {
    konsep: string
    contoh: string
  }[]
  kataKunci?: string[]
}

// ============================================
// KERANGKA PRESENTASI
// ============================================

export interface PresentasiRequest {
  topik: string
  audiens: string
  durasi?: string
  jumlahSlide?: number
  tujuanPresentasi?: string
}

export interface PresentasiResponse {
  judul: string
  audiens: string
  slides: {
    nomor: number
    judul: string
    poin: string[]
  }[]
  kesimpulan: string
}

// ============================================
// RUBRIK PENILAIAN
// ============================================

export interface RubrikRequest {
  mataPelajaran?: string
  jenisTugas: string
  kriteria?: string
  aspekPenilaian?: string[]
  jenjang?: string
}

export interface RubrikResponse {
  judul: string
  jenisTugas: string
  rubrik: {
    aspek: string
    kriteria: string
    skor1: string // 1-25%
    skor2: string // 26-50%
    skor3: string // 51-75%
    skor4: string // 76-100%
  }[]
  skalaPenilaian: string
}

// ============================================
// ICE BREAKING
// ============================================

export interface IcebreakRequest {
  kelas?: string
  durasi?: string
  jumlahSiswa?: number
  tema?: string
  jenis?: 'dalam' | 'luar' | 'campuran'
}

export interface IcebreakResponse {
  judul: string
  aktivitas: {
    nama: string
    deskripsi: string
  }
  langkah: string[]
  tips: string[]
  peralatan?: string[]
}

// ============================================
// REFLEKSI MENGAJAR
// ============================================

export interface RefleksiRequest {
  mataPelajaran: string
  kelas: string
  materi: string
  pengalamanMengajar?: string
  apaYangBerjalanBaik?: string
  tantangan?: string
  rencanaPerbaikan?: string
}

export interface RefleksiResponse {
  ringkasan: string
  apaYangBerjalanBaik: string[]
  tantangan: string[]
  rencanaPerbaikan: string[]
  kataMotivasi: string
}

// ============================================
// GENERIC TOOL REQUEST
// ============================================

export interface ToolRequest {
  tool: ToolType
  data: Record<string, any>
}

export interface ToolResponse {
  tool: ToolType
  success: boolean
  data?: any
  error?: string
}

// ============================================
// JSON SCHEMA FOR VALIDATION
// ============================================

export const TOOL_JSON_SCHEMAS = {
  rpp: {
    type: 'object',
    required: ['identitas', 'tujuanPembelajaran', 'langkahPembelajaran', 'asesmen', 'mediaPembelajaran'],
    properties: {
      identitas: { type: 'object' },
      tujuanPembelajaran: { type: 'array', items: { type: 'string' } },
      langkahPembelajaran: { type: 'object' },
      asesmen: { type: 'array', items: { type: 'object' } },
      mediaPembelajaran: { type: 'array', items: { type: 'string' } },
    },
  },
  lkpd: {
    type: 'object',
    required: ['judul', 'petunjuk', 'tujuan', 'kegiatan', 'pertanyaan'],
    properties: {
      judul: { type: 'string' },
      petunjuk: { type: 'string' },
      tujuan: { type: 'array', items: { type: 'string' } },
      kegiatan: { type: 'array' },
      pertanyaan: { type: 'array' },
    },
  },
  materi: {
    type: 'object',
    required: ['judul', 'ringkasan', 'poinPenting'],
    properties: {
      judul: { type: 'string' },
      ringkasan: { type: 'string' },
      poinPenting: { type: 'array', items: { type: 'string' } },
      contoh: { type: 'array' },
      kataKunci: { type: 'array', items: { type: 'string' } },
    },
  },
  presentasi: {
    type: 'object',
    required: ['judul', 'audiens', 'slides'],
    properties: {
      judul: { type: 'string' },
      audiens: { type: 'string' },
      slides: { type: 'array' },
      kesimpulan: { type: 'string' },
    },
  },
  rubrik: {
    type: 'object',
    required: ['judul', 'jenisTugas', 'rubrik', 'skalaPenilaian'],
    properties: {
      judul: { type: 'string' },
      jenisTugas: { type: 'string' },
      rubrik: { type: 'array' },
      skalaPenilaian: { type: 'string' },
    },
  },
  icebreak: {
    type: 'object',
    required: ['judul', 'aktivitas', 'langkah'],
    properties: {
      judul: { type: 'string' },
      aktivitas: { type: 'object' },
      langkah: { type: 'array', items: { type: 'string' } },
      tips: { type: 'array', items: { type: 'string' } },
      peralatan: { type: 'array', items: { type: 'string' } },
    },
  },
  refleksi: {
    type: 'object',
    required: ['ringkasan', 'apaYangBerjalanBaik', 'tantangan', 'rencanaPerbaikan', 'kataMotivasi'],
    properties: {
      ringkasan: { type: 'string' },
      apaYangBerjalanBaik: { type: 'array', items: { type: 'string' } },
      tantangan: { type: 'array', items: { type: 'string' } },
      rencanaPerbaikan: { type: 'array', items: { type: 'string' } },
      kataMotivasi: { type: 'string' },
    },
  },
}

// Tool display info
export const TOOL_INFO = {
  rpp: {
    title: 'RPP/Modul Ajar Generator',
    description: 'Buat RPP/Modul Ajar dengan berbagai pilihan kurikulum secara instan.',
    icon: 'book-open',
    color: 'bg-blue-500',
    path: '/tools/rpp',
  },
  lkpd: {
    title: 'LKPD Generator',
    description: 'Buat Lembar Kerja Peserta Didik (LKPD) yang terstruktur dan profesional.',
    icon: 'file-signature',
    color: 'bg-emerald-500',
    path: '/tools/lkpd',
  },
  materi: {
    title: 'Ringkasan Materi Ajar',
    description: 'Generate ringkasan atau bahan ajar lengkap dari teks yang Anda miliki.',
    icon: 'book-marked',
    color: 'bg-purple-500',
    path: '/tools/materi',
  },
  presentasi: {
    title: 'Kerangka Presentasi',
    description: 'Buat outline materi slide presentasi mengajar yang sistematis.',
    icon: 'monitor-play',
    color: 'bg-blue-600',
    path: '/tools/presentasi',
  },
  rubrik: {
    title: 'Rubrik Penilaian',
    description: 'Buat rubrik penilaian tugas atau proyek akademik secara detail.',
    icon: 'list-checks',
    color: 'bg-orange-500',
    path: '/tools/rubrik',
  },
  icebreak: {
    title: 'Ice Breaking Generator',
    description: 'Ide permainan seru untuk mencairkan suasana kelas.',
    icon: 'dices',
    color: 'bg-pink-500',
    path: '/tools/icebreak',
  },
  refleksi: {
    title: 'Refleksi Mengajar',
    description: 'Dokumentasikan dinamika kelas dan dapatkan analisis reflektif.',
    icon: 'heart',
    color: 'bg-rose-500',
    path: '/tools/refleksi',
  },
} as const
