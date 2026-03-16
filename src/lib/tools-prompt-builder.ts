// ============================================
// SHARED PROMPT BUILDER FOR ALL TOOLS
// Updated for Client Feedback Implementation
// ============================================

import type { ToolType, CurriculumType, TipeLKPD, KolomJawaban, KomposisiSoal } from './tools-schema'

// System instruction for JSON generation
export function buildSystemInstruction(): string {
  return `You are an expert educational content specialist. Your task is to generate high-quality educational content in STRICT JSON format.

CRITICAL OUTPUT RULES:
1. Output MUST be valid JSON only
2. NO markdown formatting (no **, no #, no __)
3. NO explanation text outside the JSON
4. NO comments in the JSON
5. Ensure all string fields are properly escaped
6. Return ONLY the JSON object, nothing else

The JSON structure MUST follow the exact schema provided in the user prompt.`
}

// Build prompt for each tool type
export function buildToolPrompt(tool: ToolType, data: Record<string, any>): string {
  switch (tool) {
    case 'rpp':
      return buildRPPPrompt(data)
    case 'lkpd':
      return buildLKPDPrompt(data)
    case 'materi':
      return buildMateriPrompt(data)
    case 'presentasi':
      return buildPresentasiPrompt(data)
    case 'rubrik':
      return buildRubrikPrompt(data)
    case 'icebreak':
      return buildIcebreakPrompt(data)
    case 'refleksi':
      return buildRefleksiPrompt(data)
    default:
      return buildGenericPrompt(tool, data)
  }
}

// ============================================
// RPP / MODUL AJAR
// ============================================

function buildRPPPrompt(data: Record<string, any>): string {
  const {
    namaGuru,
    nipGuru,
    namaKepsek,
    nipKepsek,
    sekolah,
    npsn,
    tahunAjaran,
    semester,
    kurikulum,
    // Merdeka
    fase,
    kelasMerdeka,
    jalurIKM,
    mapelMerdeka,
    mapelMerdekaLainnya,
    elemenCP,
    profilPelajarPancasila = [],
    // K-13
    jenjangK13,
    kelasK13,
    versiK13,
    mapelK13,
    mapelK13Lainnya,
    // Kemenag
    naungan,
    jenjangKemenag,
    kelasKemenag,
    mapelKemenag,
    mapelKemenagLainnya,
    jenisPendidikan,
    tingkatanPesantren,
    mataKitab,
    // Detail Pembelajaran
    materiPokok,
    alokasiJP,
    alokasiPertemuan,
    modelPembelajaran,
    metodePembelajaran,
    mediaSarana,
    tujuanPembelajaran,
  } = data

  // Normalize kurikulum to handle both short and full names
  const normalizeKurikulum = (k?: string) => {
    if (!k) return 'kemenag'
    const lower = k.toLowerCase()
    if (lower === 'merdeka' || lower.includes('merdeka')) return 'merdeka'
    if (lower === 'k13' || lower.includes('2013')) return 'k13'
    if (lower === 'kemenag' || lower.includes('kbc') || lower.includes('kemenag')) return 'kemenag'
    return 'kemenag' // default fallback
  }

  const normalizedKurikulum = normalizeKurikulum(kurikulum)

  // Determine mataPelajaran and kelas based on kurikulum
  let mataPelajaran = ''
  let kelas = ''

  if (normalizedKurikulum === 'merdeka') {
    mataPelajaran = mapelMerdekaLainnya || mapelMerdeka || ''
    kelas = kelasMerdeka || ''
  } else if (normalizedKurikulum === 'k13') {
    mataPelajaran = mapelK13Lainnya || mapelK13 || ''
    kelas = kelasK13 || ''
  } else if (normalizedKurikulum === 'kemenag') {
    mataPelajaran = mapelKemenagLainnya || mapelKemenag || ''
    kelas = kelasKemenag || ''
  }

  // Build curriculum-specific info
  let curriculumInfo = ''
  if (normalizedKurikulum === 'merdeka') {
    curriculumInfo = `Kurikulum: Kurikulum Merdeka
${fase ? `Fase: ${fase}` : ''}
${kelas ? `Kelas: ${kelas}` : ''}
${elemenCP ? `Elemen CP: ${elemenCP}` : ''}
${jalurIKM ? `Jalur IKM: ${jalurIKM}` : ''}`
  } else if (normalizedKurikulum === 'k13') {
    curriculumInfo = `Kurikulum: Kurikulum 2013
${jenjangK13 ? `Jenjang: ${jenjangK13}` : ''}
${kelas ? `Kelas: ${kelas}` : ''}
${versiK13 ? `Versi: ${versiK13}` : ''}`
  } else if (normalizedKurikulum === 'kemenag') {
    curriculumInfo = `Kurikulum: KBC Kemenag
${naungan ? `Naungan: ${naungan}` : ''}
${jenjangKemenag ? `Jenjang: ${jenjangKemenag}` : ''}
${kelas ? `Kelas: ${kelas}` : ''}
${jenisPendidikan ? `Jenis Pendidikan: ${jenisPendidikan}` : ''}
${tingkatanPesantren ? `Tingkatan Pesantren: ${tingkatanPesantren}` : ''}
${mataKitab ? `Mata Kitab: ${mataKitab}` : ''}`
  }

  return `Generate a complete RPP/Modul Ajar (lesson plan) based on the following specifications.

===========================================
INFORMASI DASAR
===========================================

${curriculumInfo}

Mata Pelajaran: ${mataPelajaran}
Materi Pokok: ${materiPokok}
${alokasiJP ? `Alokasi Waktu: ${alokasiJP} JP` : ''}
${alokasiPertemuan ? `Pertemuan ke: ${alokasiPertemuan}` : ''}

===========================================
IDENTITAS GURU & SEKOLAH
===========================================

${namaGuru ? `Nama Guru: ${namaGuru}` : ''}
${nipGuru ? `NIP Guru: ${nipGuru}` : ''}
${sekolah ? `Nama Sekolah: ${sekolah}` : ''}
${npsn ? `NPSN: ${npsn}` : ''}
${namaKepsek ? `Nama Kepala Sekolah: ${namaKepsek}` : ''}
${nipKepsek ? `NIP Kepala Sekolah: ${nipKepsek}` : ''}
${tahunAjaran ? `Tahun Ajaran: ${tahunAjaran}` : ''}
${semester ? `Semester: ${semester}` : ''}

${profilPelajarPancasila.length > 0 ? `===========================================
PROFIL PELAJAR PANCASILA
===========================================

${profilPelajarPancasila.map((p: string) => `- ${p}`).join('\n')}

` : ''}${modelPembelajaran ? `===========================================
MODEL PEMBELAJARAN
===========================================

${modelPembelajaran}

` : ''}${metodePembelajaran ? `===========================================
METODE PEMBELAJARAN
===========================================

${metodePembelajaran}

` : ''}${mediaSarana ? `===========================================
MEDIA & SARANA
===========================================

${mediaSarana}

` : ''}${tujuanPembelajaran ? `===========================================
TUJUAN PEMBELAJARAN (USER INPUT)
===========================================

${tujuanPembelajaran}

` : ''}===========================================
OUTPUT REQUIREMENTS
===========================================

Generate a comprehensive lesson plan with:

1. Identitas section (nama guru, NIP, kepala sekolah, NIP kepsek, sekolah, NPSN, tahun ajaran, semester, mata pelajaran, kelas, materi${alokasiJP ? ', alokasi waktu' : ''})
2. ${profilPelajarPancasila.length > 0 ? 'Integrasi Profil Pelajar Pancasila sesuai pilihan' : 'Profil Pelajar Pancasila (jika relevan)'}
3. Tujuan Pembelajaran (3-5 specific, measurable learning objectives${tujuanPembelajaran ? ', pertimbangkan input user' : ''})
4. Langkah Pembelajaran with:
   - Pendahuluan (opening activities, apersepsi, motivasi, 10-15 minutes)
   - Inti (main learning activities sesuai model pembelajaran${modelPembelajaran ? `: ${modelPembelajaran}` : ''}, exploration, elaboration)
   - Penutup (closing activities, reflection, 5-10 minutes)
5. Asesmen (3-5 assessment types with techniques)
6. Media Pembelajaran (3-5 recommended learning media${mediaSarana ? ', pertimbangkan input user' : ''})

===========================================
REQUIRED JSON STRUCTURE
===========================================

Return a JSON object with this exact structure:

{
  "identitas": {
    "namaGuru": ${namaGuru ? `"${namaGuru}"` : 'null'},
    "nipGuru": ${nipGuru ? `"${nipGuru}"` : 'null'},
    "namaKepsek": ${namaKepsek ? `"${namaKepsek}"` : 'null'},
    "nipKepsek": ${nipKepsek ? `"${nipKepsek}"` : 'null'},
    "sekolah": ${sekolah ? `"${sekolah}"` : 'null'},
    "npsn": ${npsn ? `"${npsn}"` : 'null'},
    "tahunAjaran": ${tahunAjaran ? `"${tahunAjaran}"` : 'null'},
    "semester": ${semester ? `"${semester}"` : 'null'},
    "mataPelajaran": "${mataPelajaran}",
    "kelas": "${kelas}",
    "materi": "${materiPokok}",
    "kurikulum": "${normalizedKurikulum === 'merdeka' ? 'Kurikulum Merdeka' : normalizedKurikulum === 'k13' ? 'Kurikulum 2013' : 'KBC Kemenag'}",
    ${fase ? `"fase": "${fase}",` : ''}
    ${elemenCP ? `"elemenCP": "${elemenCP}",` : ''}
    "alokasiWaktu": ${alokasiJP ? `"${alokasiJP} JP"` : 'null'}
  },
  ${profilPelajarPancasila.length > 0 ? `"profilPelajarPancasila": ${JSON.stringify(profilPelajarPancasila)},` : ''}
  ${modelPembelajaran ? `"modelPembelajaran": "${modelPembelajaran}",` : ''}
  "tujuanPembelajaran": [
    "Specific learning objective 1",
    "Specific learning objective 2",
    "Specific learning objective 3"
  ],
  "langkahPembelajaran": {
    "pendahuluan": "Detailed opening activities including apersepsi, motivation, and goal explanation",
    "inti": "Detailed main activities including observation, questioning, exploration, association, and communication",
    "penutup": "Detailed closing activities including reflection and follow-up"
  },
  "asesmen": [
    {"jenis": "Formatif", "teknik": "Specific technique"},
    {"jenis": "Sumatif", "teknik": "Specific technique"}
  ],
  "mediaPembelajaran": [
    "Learning medium 1",
    "Learning medium 2",
    "Learning medium 3"
  ]
}

REMEMBER:
1. Return ONLY the JSON. No markdown, no explanations.
2. Use formal Indonesian educational language.
3. Align with ${normalizedKurikulum === 'merdeka' ? 'Kurikulum Merdeka' : normalizedKurikulum === 'k13' ? 'Kurikulum 2013' : 'KBC Kemenag'} principles.
4. ${profilPelajarPancasila.length > 0 ? 'Integrasi Profil Pelajar Pancasila dalam kegiatan pembelajaran.' : ''}
5. ${modelPembelajaran ? `Gunakan model pembelajaran: ${modelPembelajaran}.` : ''}`
}

// ============================================
// LKPD
// ============================================

function buildLKPDPrompt(data: Record<string, any>): string {
  const {
    namaGuru,
    nipGuru,
    namaKepsek,
    nipKepsek,
    sekolah,
    npsn,
    kurikulum,
    jenjang,
    kelas,
    fase,
    mataPelajaran,
    mataPelajaranLainnya,
    tahunAjaran,
    semester,
    alokasiWaktu,
    materiPokok,
    kdCpTp,
    jenjangKemenag,
    kelasKemenag,
    tipeLKPD,
    tipeSoal = [],
    komposisiSoal = [],
    kolomJawaban,
    konteksTema,
    catatanKhusus,
    sertakanGambar,
  } = data

  // Normalize kurikulum to handle both short and full names
  const normalizeKurikulum = (k?: string) => {
    if (!k) return 'kemenag'
    const lower = k.toLowerCase()
    if (lower === 'merdeka' || lower.includes('merdeka')) return 'merdeka'
    if (lower === 'k13' || lower.includes('2013')) return 'k13'
    if (lower === 'kemenag' || lower.includes('kbc') || lower.includes('kemenag')) return 'kemenag'
    return 'kemenag'
  }

  const normalizedKurikulum = normalizeKurikulum(kurikulum)

  const mapel = mataPelajaranLainnya || mataPelajaran || ''
  const kelasValue = normalizedKurikulum === 'kemenag' ? kelasKemenag : kelas

  // Build question composition info
  const soalInfo = komposisiSoal.length > 0
    ? komposisiSoal.map((k: KomposisiSoal) => `${k.tipe}: ${k.jumlah}`).join(', ')
    : '10 soal campuran'

  // Build tipe LKPD description
  const tipeLKPDDescriptions: Record<TipeLKPD, string> = {
    eksploratif: 'penemuan konsep mandiri melalui guided inquiry',
    latihan: 'latihan soal terstruktur dan berulang untuk penguatan pemahaman',
    praktikum: 'panduan percobaan atau eksperimen',
    proyek: 'panduan kerja proyek (Project Based Learning)',
    remedi: 'pemulihan untuk peserta didik yang belum tuntas',
    pengayaan: 'pengayaan untuk tantangan lebih tinggi',
  }

  return `Generate a complete Lembar Kerja Peserta Didik (LKPD) based on the following specifications.

===========================================
INFORMASI DASAR
===========================================

Mata Pelajaran: ${mapel}
Kelas: ${kelasValue}
${jenjang ? `Jenjang: ${jenjang}` : ''}
${fase ? `Fase: ${fase}` : ''}
Materi Pokok: ${materiPokok}
${kdCpTp ? `KD/CP/TP: ${kdCpTp}` : ''}
${alokasiWaktu ? `Alokasi Waktu: ${alokasiWaktu} menit` : ''}

===========================================
IDENTITAS
===========================================

${namaGuru ? `Nama Guru: ${namaGuru}` : ''}
${nipGuru ? `NIP: ${nipGuru}` : ''}
${sekolah ? `Nama Sekolah: ${sekolah}` : ''}
${npsn ? `NPSN: ${npsn}` : ''}
${namaKepsek ? `Nama Kepala Sekolah: ${namaKepsek}` : ''}
${nipKepsek ? `NIP Kepala Sekolah: ${nipKepsek}` : ''}
${tahunAjaran ? `Tahun Ajaran: ${tahunAjaran}` : ''}
${semester ? `Semester: ${semester}` : ''}

===========================================
TIPE LKPD
===========================================

Tipe: ${tipeLKPD} (${tipeLKPDDescriptions[tipeLKPD as TipeLKPD] || tipeLKPD})

===========================================
PENGATURAN SOAL
===========================================

Komposisi Soal: ${soalInfo}
${tipeSoal.length > 0 ? `Tipe Soal: ${tipeSoal.join(', ')}` : ''}
Kolom Jawaban: ${kolomJawaban === 'ada' ? 'Disediakan kolom jawaban' : kolomJawaban === 'tanpa' ? 'Tanpa kolom jawaban' : 'Disediakan kolom jawaban + kunci jawaban'}

${konteksTema ? `===========================================
KONTEKS/TEMA
===========================================

${konteksTema}

` : ''}${catatanKhusus ? `===========================================
CATATAN KHUSUS
===========================================

${catatanKhusus}

` : ''}===========================================
OUTPUT REQUIREMENTS
===========================================

Generate an LKPD with:
1. Engaging title related to ${materiPokok}
2. Clear instructions for students
3. 3-5 learning objectives
4. 3-5 guided learning activities (sesuai tipe ${tipeLKPD})
5. Questions following composition: ${soalInfo}

${sertakanGambar ? `===========================================
GAMBAR/ILUSTRASI
===========================================

Include ${Math.max(2, Math.floor((komposisiSoal.reduce((acc: number, k: KomposisiSoal) => acc + k.jumlah, 0) || 10) * 0.2))} questions with image prompts.
For image questions: set image_prompt to a detailed description in English.

` : ''}===========================================
REQUIRED JSON STRUCTURE
===========================================

Return a JSON object with this exact structure:

{
  "identitas": {
    "namaGuru": ${namaGuru ? `"${namaGuru}"` : 'null'},
    "sekolah": ${sekolah ? `"${sekolah}"` : 'null'},
    "mataPelajaran": "${mapel}",
    "kelas": "${kelasValue}",
    "materi": "${materiPokok}",
    "alokasiWaktu": ${alokasiWaktu ? alokasiWaktu : 'null'},
    "tipeLKPD": "${tipeLKPD}"
  },
  "judul": "Creative LKPD title related to ${materiPokok}",
  "petunjuk": "Clear step-by-step instructions for students",
  "tujuan": [
    "Learning objective 1",
    "Learning objective 2",
    "Learning objective 3"
  ],
  "kegiatan": [
    {"nomor": 1, "kegiatan": "First guided activity description"},
    {"nomor": 2, "kegiatan": "Second guided activity description"},
    {"nomor": 3, "kegiatan": "Third guided activity description"}
  ],
  "pertanyaan": [
    {"nomor": 1, "tipe": "${tipeSoal[0] || 'Pilihan Ganda'}", "pertanyaan": "First question text", ${kolomJawaban !== 'tanpa' ? `"kolomJawaban": "Space for answer",` : ''} ${sertakanGambar ? `"imagePrompt": "Detailed description in English",` : ''}},
    {"nomor": 2, "tipe": "${tipeSoal[0] || 'Pilihan Ganda'}", "pertanyaan": "Second question text", ${kolomJawaban !== 'tanpa' ? `"kolomJawaban": "Space for answer",` : ''}}
  ]
}

REMEMBER:
1. Return ONLY the JSON. No markdown, no explanations.
2. Include exactly ${komposisiSoal.reduce((acc: number, k: KomposisiSoal) => acc + k.jumlah, 0) || 10} questions.
3. Use student-friendly Indonesian language.
4. Questions should be inquiry-based and critical thinking.
5. ${kolomJawaban === 'kunci' ? 'Include answer keys in the kolomJawaban field.' : ''}
6. Activities should match the ${tipeLKPD} type (${tipeLKPDDescriptions[tipeLKPD as TipeLKPD] || tipeLKPD}).`
}

// ============================================
// MATERI
// ============================================

function buildMateriPrompt(data: Record<string, any>): string {
  const {
    mataPelajaran,
    kelas,
    materi,
    teksReferensi,
    jenjang,
    kedalaman = 'sedang',
  } = data

  const kedalamanValue = kedalaman as 'ringkas' | 'sedang' | 'lengkap'
  const detailLevel = {
    ringkas: 'brief summary with 3-5 key points',
    sedang: 'moderate detail with 5-8 key points',
    lengkap: 'comprehensive explanation with 8-12 key points',
  }[kedalamanValue] || 'moderate detail'

  return `Generate a comprehensive learning material summary based on the following specifications.

===========================================
INFORMASI DASAR
===========================================

Mata Pelajaran: ${mataPelajaran}
Kelas: ${kelas}
Materi: ${materi}
${jenjang ? `Jenjang: ${jenjang}` : ''}
Kedalaman: ${kedalaman}

${teksReferensi ? `===========================================
TEKS REFERENSI
===========================================

${teksReferensi}

Use this reference text as the basis for generating the summary.

` : ''}===========================================
OUTPUT REQUIREMENTS
===========================================

Generate ${detailLevel} with:
1. Clear title related to ${materi}
2. Comprehensive summary of the topic
3. Key learning points
4. 2-3 practical examples (if applicable)
5. Key terms/keywords for easy reference

===========================================
REQUIRED JSON STRUCTURE
===========================================

Return a JSON object with this exact structure:

{
  "judul": "Title for ${materi} material",
  "ringkasan": "Comprehensive summary paragraph (200-300 words)",
  "poinPenting": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "contoh": [
    {"konsep": "Concept name", "contoh": "Practical example explanation"},
    {"konsep": "Another concept", "contoh": "Another example"}
  ],
  "kataKunci": [
    "keyword1",
    "keyword2",
    "keyword3"
  ]
}

REMEMBER:
1. Return ONLY the JSON. No markdown, no explanations.
2. Use clear, academic Indonesian language.
3. Include practical, relatable examples.`
}

// ============================================
// PRESENTASI
// ============================================

function buildPresentasiPrompt(data: Record<string, any>): string {
  const {
    topik,
    audiens,
    durasi,
    jumlahSlide = 10,
    tujuanPresentasi,
  } = data

  return `Generate a complete presentation outline based on the following specifications.

===========================================
INFORMASI DASAR
===========================================

Topik: ${topik}
Audiens: ${audiens}
${durasi ? `Durasi: ${durasi}` : ''}

===========================================
OUTPUT REQUIREMENTS
===========================================

Generate a presentation with ${jumlahSlide} slides:
1. Title slide
2. Overview/Agenda
3. Main content slides (7-9 slides)
4. Summary/Conclusion

===========================================
REQUIRED JSON STRUCTURE
===========================================

Return a JSON object with this exact structure:

{
  "judul": "Engaging presentation title about ${topik}",
  "audiens": "${audiens}",
  "slides": [
    {
      "nomor": 1,
      "judul": "Slide Title",
      "poin": [
        "Key point 1",
        "Key point 2",
        "Key point 3"
      ]
    }
    // ... repeat for ${jumlahSlide} slides
  ],
  "kesimpulan": "Strong conclusion with key takeaways"
}

REMEMBER:
1. Return ONLY the JSON. No markdown, no explanations.
2. Include exactly ${jumlahSlide} slides.
3. Each slide should have 3-5 bullet points.
4. Content should be engaging for ${audiens}.
5. Use professional Indonesian language.`
}

// ============================================
// RUBRIK
// ============================================

function buildRubrikPrompt(data: Record<string, any>): string {
  const {
    mataPelajaran,
    jenisTugas,
    kriteria,
    aspekPenilaian,
    jenjang,
  } = data

  return `Generate a detailed assessment rubric based on the following specifications.

===========================================
INFORMASI DASAR
===========================================

${mataPelajaran ? `Mata Pelajaran: ${mataPelajaran}` : ''}
Jenis Tugas: ${jenisTugas}
${kriteria ? `Kriteria: ${kriteria}` : ''}
${jenjang ? `Jenjang: ${jenjang}` : ''}

===========================================
OUTPUT REQUIREMENTS
===========================================

Generate a 4-level rubric:
1. 4-6 assessment aspects
2. Clear criteria for each aspect
3. 4 performance levels (1-4 scale)
4. Descriptive performance indicators for each level

===========================================
REQUIRED JSON STRUCTURE
===========================================

Return a JSON object with this exact structure:

{
  "judul": "Assessment Rubric for ${jenisTugas}",
  "jenisTugas": "${jenisTugas}",
  "rubrik": [
    {
      "aspek": "Aspect name (e.g., Content, Organization, etc.)",
      "kriteria": "Description of what is being assessed",
      "skor1": "Description of poor performance (1-25%)",
      "skor2": "Description of fair performance (26-50%)",
      "skor3": "Description of good performance (51-75%)",
      "skor4": "Description of excellent performance (76-100%)"
    }
    // ... repeat for 4-6 aspects
  ],
  "skalaPenilaian": "Description of the scoring scale (e.g., 1-4 with 4 being excellent)"
}

REMEMBER:
1. Return ONLY the JSON. No markdown, no explanations.
2. Include 4-6 assessment aspects relevant to ${jenisTugas}.
3. Use clear, measurable performance descriptors.
4. Language should be in formal Indonesian.`
}

// ============================================
// ICEBREAKING
// ============================================

function buildIcebreakPrompt(data: Record<string, any>): string {
  const {
    kelas,
    durasi = '10-15 menit',
    jumlahSiswa = 30,
    tema,
    jenis = 'campuran',
  } = data

  return `Generate an ice breaking activity based on the following specifications.

===========================================
INFORMASI DASAR
===========================================

${kelas ? `Kelas: ${kelas}` : ''}
Durasi: ${durasi}
${jumlahSiswa ? `Jumlah Siswa: ${jumlahSiswa}` : ''}
${tema ? `Tema: ${tema}` : 'Tema: General/Neutral'}
Jenis: ${jenis === 'dalam' ? 'Indoor' : jenis === 'luar' ? 'Outdoor' : 'Mixed/Any'}

===========================================
OUTPUT REQUIREMENTS
===========================================

Generate a fun, engaging ice breaker with:
1. Creative activity name
2. Clear activity description
3. Step-by-step instructions (5-8 steps)
4. Practical tips for success
5. List of required materials (if any)

===========================================
REQUIRED JSON STRUCTURE
===========================================

Return a JSON object with this exact structure:

{
  "judul": "Creative activity name",
  "aktivitas": {
    "nama": "Activity name",
    "deskripsi": "Brief description of what students will do"
  },
  "langkah": [
    "Step 1: Detailed instruction",
    "Step 2: Detailed instruction",
    "Step 3: Detailed instruction"
  ],
  "tips": [
    "Practical tip 1",
    "Practical tip 2",
    "Practical tip 3"
  ],
  "peralatan": [
    "Material 1 (if needed)",
    "Material 2 (if needed)"
  ]
}

REMEMBER:
1. Return ONLY the JSON. No markdown, no explanations.
2. Activity should be age-appropriate and safe.
3. Include clear, easy-to-follow instructions.
4. Tips should help teachers facilitate successfully.
5. Use friendly Indonesian language.`
}

// ============================================
// REFLEKSI
// ============================================

function buildRefleksiPrompt(data: Record<string, any>): string {
  const {
    mataPelajaran,
    kelas,
    materi,
    pengalamanMengajar,
    apaYangBerjalanBaik,
    tantangan,
    rencanaPerbaikan,
  } = data

  return `Generate a teaching reflection document based on the following specifications.

===========================================
INFORMASI DASAR
===========================================

Mata Pelajaran: ${mataPelajaran}
Kelas: ${kelas}
Materi: ${materi}

${pengalamanMengajar ? `===========================================
PENGALAMAN MENGAJAR
===========================================

${pengalamanMengajar}

` : ''}===========================================
OUTPUT REQUIREMENTS
===========================================

Generate a reflective analysis with:
1. Summary of the teaching experience
2. Analysis of what went well (3-5 points)
3. Identification of challenges (3-5 points)
4. Actionable improvement plans (3-5 points)
5. Motivational closing quote

===========================================
REQUIRED JSON STRUCTURE
===========================================

Return a JSON object with this exact structure:

{
  "ringkasan": "Brief summary of the teaching session (2-3 sentences)",
  "apaYangBerjalanBaik": [
    "Positive aspect 1 with explanation",
    "Positive aspect 2 with explanation",
    "Positive aspect 3 with explanation"
  ],
  "tantangan": [
    "Challenge 1 with context",
    "Challenge 2 with context",
    "Challenge 3 with context"
  ],
  "rencanaPerbaikan": [
    "Improvement plan 1 (specific and actionable)",
    "Improvement plan 2 (specific and actionable)",
    "Improvement plan 3 (specific and actionable)"
  ],
  "kataMotivasi": "Inspirational quote or message for continued growth"
}

REMEMBER:
1. Return ONLY the JSON. No markdown, no explanations.
2. Be constructive and growth-oriented.
3. Improvement plans should be specific and actionable.
4. Use reflective, professional Indonesian language.
5. Include an encouraging motivational message.`
}

// ============================================
// GENERIC PROMPT (fallback)
// ============================================

function buildGenericPrompt(tool: ToolType, data: Record<string, any>): string {
  return `Generate educational content for tool type: ${tool}

Input data: ${JSON.stringify(data, null, 2)}

Return valid JSON response following the schema for this tool type.`
}
