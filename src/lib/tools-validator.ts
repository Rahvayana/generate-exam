// ============================================
// SHARED VALIDATOR FOR ALL TOOLS
// ============================================

import type { ToolType } from './tools-schema'
import { TOOL_JSON_SCHEMAS } from './tools-schema'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// Validate response based on tool type
export function validateToolResponse(
  tool: ToolType,
  data: unknown
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Basic structure validation
  if (!data || typeof data !== 'object') {
    errors.push({ field: 'root', message: 'Response must be an object' })
    return { valid: false, errors, warnings }
  }

  const response = data as Record<string, any>

  // Tool-specific validation
  switch (tool) {
    case 'rpp':
      validateRPPResponse(response, errors, warnings)
      break
    case 'lkpd':
      validateLKPDResponse(response, errors, warnings)
      break
    case 'materi':
      validateMateriResponse(response, errors, warnings)
      break
    case 'presentasi':
      validatePresentasiResponse(response, errors, warnings)
      break
    case 'rubrik':
      validateRubrikResponse(response, errors, warnings)
      break
    case 'icebreak':
      validateIcebreakResponse(response, errors, warnings)
      break
    case 'refleksi':
      validateRefleksiResponse(response, errors, warnings)
      break
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================
// RPP VALIDATION
// ============================================

function validateRPPResponse(
  data: Record<string, any>,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  // Required fields
  if (!data.identitas || typeof data.identitas !== 'object') {
    errors.push({ field: 'identitas', message: 'identitas is required and must be an object' })
  } else {
    if (!data.identitas.mataPelajaran) {
      errors.push({ field: 'identitas.mataPelajaran', message: 'mataPelajaran is required' })
    }
    if (!data.identitas.kelas) {
      errors.push({ field: 'identitas.kelas', message: 'kelas is required' })
    }
    if (!data.identitas.materi) {
      errors.push({ field: 'identitas.materi', message: 'materi is required' })
    }
  }

  if (!Array.isArray(data.tujuanPembelajaran)) {
    errors.push({ field: 'tujuanPembelajaran', message: 'tujuanPembelajaran must be an array' })
  } else if (data.tujuanPembelajaran.length < 3) {
    warnings.push({ field: 'tujuanPembelajaran', message: 'Should have at least 3 learning objectives' })
  }

  if (!data.langkahPembelajaran || typeof data.langkahPembelajaran !== 'object') {
    errors.push({ field: 'langkahPembelajaran', message: 'langkahPembelajaran is required and must be an object' })
  } else {
    if (!data.langkahPembelajaran.pendahuluan) {
      errors.push({ field: 'langkahPembelajaran.pendahuluan', message: 'pendahuluan is required' })
    }
    if (!data.langkahPembelajaran.inti) {
      errors.push({ field: 'langkahPembelajaran.inti', message: 'inti is required' })
    }
    if (!data.langkahPembelajaran.penutup) {
      errors.push({ field: 'langkahPembelajaran.penutup', message: 'penutup is required' })
    }
  }

  if (!Array.isArray(data.asesmen)) {
    errors.push({ field: 'asesmen', message: 'asesmen must be an array' })
  }

  if (!Array.isArray(data.mediaPembelajaran)) {
    errors.push({ field: 'mediaPembelajaran', message: 'mediaPembelajaran must be an array' })
  }
}

// ============================================
// LKPD VALIDATION
// ============================================

function validateLKPDResponse(
  data: Record<string, any>,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!data.judul || typeof data.judul !== 'string') {
    errors.push({ field: 'judul', message: 'judul is required and must be a string' })
  }

  if (!data.petunjuk || typeof data.petunjuk !== 'string') {
    errors.push({ field: 'petunjuk', message: 'petunjuk is required and must be a string' })
  }

  if (!Array.isArray(data.tujuan)) {
    errors.push({ field: 'tujuan', message: 'tujuan must be an array' })
  }

  if (!Array.isArray(data.kegiatan)) {
    errors.push({ field: 'kegiatan', message: 'kegiatan must be an array' })
  }

  if (!Array.isArray(data.pertanyaan)) {
    errors.push({ field: 'pertanyaan', message: 'pertanyaan must be an array' })
  } else if (data.pertanyaan.length === 0) {
    warnings.push({ field: 'pertanyaan', message: 'No questions generated' })
  }
}

// ============================================
// MATERI VALIDATION
// ============================================

function validateMateriResponse(
  data: Record<string, any>,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!data.judul || typeof data.judul !== 'string') {
    errors.push({ field: 'judul', message: 'judul is required and must be a string' })
  }

  if (!data.ringkasan || typeof data.ringkasan !== 'string') {
    errors.push({ field: 'ringkasan', message: 'ringkasan is required and must be a string' })
  }

  if (!Array.isArray(data.poinPenting)) {
    errors.push({ field: 'poinPenting', message: 'poinPenting must be an array' })
  } else if (data.poinPenting.length < 3) {
    warnings.push({ field: 'poinPenting', message: 'Should have at least 3 key points' })
  }

  // contoh and kataKunci are optional
  if (data.contoh && !Array.isArray(data.contoh)) {
    errors.push({ field: 'contoh', message: 'contoh must be an array' })
  }

  if (data.kataKunci && !Array.isArray(data.kataKunci)) {
    errors.push({ field: 'kataKunci', message: 'kataKunci must be an array' })
  }
}

// ============================================
// PRESENTASI VALIDATION
// ============================================

function validatePresentasiResponse(
  data: Record<string, any>,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!data.judul || typeof data.judul !== 'string') {
    errors.push({ field: 'judul', message: 'judul is required and must be a string' })
  }

  if (!data.audiens || typeof data.audiens !== 'string') {
    errors.push({ field: 'audiens', message: 'audiens is required and must be a string' })
  }

  if (!Array.isArray(data.slides)) {
    errors.push({ field: 'slides', message: 'slides must be an array' })
  } else if (data.slides.length < 3) {
    warnings.push({ field: 'slides', message: 'Presentation should have at least 3 slides' })
  } else {
    // Validate slide structure
    data.slides.forEach((slide: any, i: number) => {
      if (!slide.nomor) {
        warnings.push({ field: `slides.${i}`, message: 'Slide missing nomor' })
      }
      if (!slide.judul) {
        warnings.push({ field: `slides.${i}`, message: 'Slide missing judul' })
      }
      if (!Array.isArray(slide.poin)) {
        warnings.push({ field: `slides.${i}`, message: 'Slide poin must be an array' })
      }
    })
  }

  if (!data.kesimpulan || typeof data.kesimpulan !== 'string') {
    errors.push({ field: 'kesimpulan', message: 'kesimpulan is required and must be a string' })
  }
}

// ============================================
// RUBRIK VALIDATION
// ============================================

function validateRubrikResponse(
  data: Record<string, any>,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!data.judul || typeof data.judul !== 'string') {
    errors.push({ field: 'judul', message: 'judul is required and must be a string' })
  }

  if (!data.jenisTugas || typeof data.jenisTugas !== 'string') {
    errors.push({ field: 'jenisTugas', message: 'jenisTugas is required and must be a string' })
  }

  if (!Array.isArray(data.rubrik)) {
    errors.push({ field: 'rubrik', message: 'rubrik must be an array' })
  } else if (data.rubrik.length < 3) {
    warnings.push({ field: 'rubrik', message: 'Rubric should have at least 3 aspects' })
  } else {
    // Validate rubric items
    data.rubrik.forEach((item: any, i: number) => {
      if (!item.aspek) {
        warnings.push({ field: `rubrik.${i}`, message: 'Rubric item missing aspek' })
      }
      if (!item.kriteria) {
        warnings.push({ field: `rubrik.${i}`, message: 'Rubric item missing kriteria' })
      }
      if (!item.skor1 || !item.skor2 || !item.skor3 || !item.skor4) {
        warnings.push({ field: `rubrik.${i}`, message: 'Rubric item missing one or more score levels' })
      }
    })
  }

  if (!data.skalaPenilaian || typeof data.skalaPenilaian !== 'string') {
    errors.push({ field: 'skalaPenilaian', message: 'skalaPenilaian is required and must be a string' })
  }
}

// ============================================
// ICEBREAK VALIDATION
// ============================================

function validateIcebreakResponse(
  data: Record<string, any>,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!data.judul || typeof data.judul !== 'string') {
    errors.push({ field: 'judul', message: 'judul is required and must be a string' })
  }

  if (!data.aktivitas || typeof data.aktivitas !== 'object') {
    errors.push({ field: 'aktivitas', message: 'aktivitas is required and must be an object' })
  } else {
    if (!data.aktivitas.nama) {
      errors.push({ field: 'aktivitas.nama', message: 'aktivitas.nama is required' })
    }
    if (!data.aktivitas.deskripsi) {
      errors.push({ field: 'aktivitas.deskripsi', message: 'aktivitas.deskripsi is required' })
    }
  }

  if (!Array.isArray(data.langkah)) {
    errors.push({ field: 'langkah', message: 'langkah must be an array' })
  } else if (data.langkah.length < 3) {
    warnings.push({ field: 'langkah', message: 'Activity should have at least 3 steps' })
  }

  if (!Array.isArray(data.tips)) {
    errors.push({ field: 'tips', message: 'tips must be an array' })
  }

  // peralatan is optional
  if (data.peralatan && !Array.isArray(data.peralatan)) {
    errors.push({ field: 'peralatan', message: 'peralatan must be an array' })
  }
}

// ============================================
// REFLEKSI VALIDATION
// ============================================

function validateRefleksiResponse(
  data: Record<string, any>,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (!data.ringkasan || typeof data.ringkasan !== 'string') {
    errors.push({ field: 'ringkasan', message: 'ringkasan is required and must be a string' })
  }

  if (!Array.isArray(data.apaYangBerjalanBaik)) {
    errors.push({ field: 'apaYangBerjalanBaik', message: 'apaYangBerjalanBaik must be an array' })
  } else if (data.apaYangBerjalanBaik.length < 2) {
    warnings.push({ field: 'apaYangBerjalanBaik', message: 'Should identify at least 2 positive aspects' })
  }

  if (!Array.isArray(data.tantangan)) {
    errors.push({ field: 'tantangan', message: 'tantangan must be an array' })
  } else if (data.tantangan.length < 2) {
    warnings.push({ field: 'tantangan', message: 'Should identify at least 2 challenges' })
  }

  if (!Array.isArray(data.rencanaPerbaikan)) {
    errors.push({ field: 'rencanaPerbaikan', message: 'rencanaPerbaikan must be an array' })
  } else if (data.rencanaPerbaikan.length < 2) {
    warnings.push({ field: 'rencanaPerbaikan', message: 'Should have at least 2 improvement plans' })
  }

  if (!data.kataMotivasi || typeof data.kataMotivasi !== 'string') {
    errors.push({ field: 'kataMotivasi', message: 'kataMotivasi is required and must be a string' })
  }
}

// ============================================
// RETRY PROMPT BUILDER
// ============================================

export function buildToolRetryPrompt(
  tool: ToolType,
  errors: ValidationError[]
): string {
  const errorList = errors.map((e, i) => `${i + 1}. ${e.field}: ${e.message}`).join('\n')

  return `Your previous output was INVALID. Please regenerate with these corrections:

===========================================
ERRORS TO FIX:
===========================================

${errorList}

===========================================
CORRECTION INSTRUCTIONS:
===========================================

1. Ensure the response is VALID JSON only
2. All required fields must be present
3. No markdown formatting, no comments, no extra text
4. Follow the exact schema structure provided in the original prompt

Generate valid JSON for tool type: ${tool}`
}
