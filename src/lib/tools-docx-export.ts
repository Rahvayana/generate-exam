// ============================================
// SHARED DOCX EXPORT FOR ALL TOOLS
// ============================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  PageBreak,
  ImageRun,
} from 'docx'
import type {
  RPPResponse,
  LKPDResponse,
  MateriResponse,
  PresentasiResponse,
  RubrikResponse,
  IcebreakResponse,
  RefleksiResponse,
} from './tools-schema'

// Border definition
const createBorder = (color = '000000', size = 6) => ({
  top: { style: BorderStyle.SINGLE, size, color },
  bottom: { style: BorderStyle.SINGLE, size, color },
  left: { style: BorderStyle.SINGLE, size, color },
  right: { style: BorderStyle.SINGLE, size, color },
})

const cellMargin = {
  top: 100,
  bottom: 100,
  left: 100,
  right: 100,
}

// ============================================
// RPP EXPORT
// ============================================

export function exportRPPToDocx(data: RPPResponse, filename?: string): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  // Header
  sections.push(
    new Paragraph({
      text: 'MODUL AJAR / RPP',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Identitas table - with all new fields
  const identityRows: TableRow[] = []

  // Helper function to add identity row
  const addIdentityRow = (label: string, value: string | undefined) => {
    if (!value) return
    identityRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(label)],
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(': ' + value)],
            columnSpan: 3,
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
        ],
      })
    )
  }

  addIdentityRow('Nama Guru', data.identitas.namaGuru)
  addIdentityRow('NIP', data.identitas.nipGuru)
  addIdentityRow('Nama Kepala Sekolah', data.identitas.namaKepsek)
  addIdentityRow('NIP Kepala Sekolah', data.identitas.nipKepsek)
  addIdentityRow('Nama Sekolah', data.identitas.sekolah)
  addIdentityRow('NPSN', data.identitas.npsn)
  addIdentityRow('Tahun Ajaran', data.identitas.tahunAjaran)
  addIdentityRow('Semester', data.identitas.semester)
  addIdentityRow('Kurikulum', data.identitas.kurikulum)
  addIdentityRow('Fase', data.identitas.fase)
  addIdentityRow('Mata Pelajaran', data.identitas.mataPelajaran)
  addIdentityRow('Kelas', data.identitas.kelas)
  addIdentityRow('Materi', data.identitas.materi)
  addIdentityRow('Elemen CP', data.identitas.elemenCP)
  addIdentityRow('Alokasi Waktu', data.identitas.alokasiWaktu)

  if (identityRows.length > 0) {
    sections.push(
      new Table({
        rows: identityRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        margins: { top: 200, bottom: 300 },
      })
    )
  }

  // Profil Pelajar Pancasila (if exists)
  if (data.profilPelajarPancasila && data.profilPelajarPancasila.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Profil Pelajar Pancasila',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    data.profilPelajarPancasila.forEach((profil, i) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. `, bold: true }),
            new TextRun(profil),
          ],
          spacing: { after: 150 },
        })
      )
    })
  }

  // Model Pembelajaran (if exists)
  if (data.modelPembelajaran) {
    sections.push(
      new Paragraph({
        text: 'Model Pembelajaran',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: data.modelPembelajaran,
        spacing: { after: 300 },
      })
    )
  }

  // Tujuan Pembelajaran
  sections.push(
    new Paragraph({
      text: 'A. Tujuan Pembelajaran',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  data.tujuanPembelajaran.forEach((tujuan, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(tujuan),
        ],
        spacing: { after: 150 },
      })
    )
  })

  // Langkah Pembelajaran
  sections.push(
    new Paragraph({
      text: 'B. Langkah Pembelajaran',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: '1. Pendahuluan', bold: true })],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: data.langkahPembelajaran.pendahuluan,
      spacing: { after: 200 },
    })
  )

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: '2. Kegiatan Inti', bold: true })],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: data.langkahPembelajaran.inti,
      spacing: { after: 200 },
    })
  )

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: '3. Penutup', bold: true })],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: data.langkahPembelajaran.penutup,
      spacing: { after: 200 },
    })
  )

  // Asesmen
  sections.push(
    new Paragraph({
      text: 'C. Asesmen',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  const asesmeRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true })] })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Jenis', bold: true })] })],
          width: { size: 30, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Teknik', bold: true })] })],
          width: { size: 60, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
      ],
    }),
  ]

  data.asesmen.forEach((asesmen, i) => {
    asesmeRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(String(i + 1))],
            width: { size: 10, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(asesmen.jenis)],
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(asesmen.teknik)],
            width: { size: 60, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
        ],
      })
    )
  })

  sections.push(
    new Table({
      rows: asesmeRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 200, bottom: 200 },
    })
  )

  // Media Pembelajaran
  sections.push(
    new Paragraph({
      text: 'D. Media Pembelajaran',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  data.mediaPembelajaran.forEach((media, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(media),
        ],
        spacing: { after: 150 },
      })
    )
  })

  return generateAndDownload(sections, filename || `RPP_${data.identitas.mataPelajaran}_${Date.now()}.docx`)
}

// ============================================
// LKPD EXPORT
// ============================================

export function exportLKPDToDocx(data: LKPDResponse, images?: Record<number, string>, filename?: string): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  // Helper functions for images
  const dataUrlToBase64 = (dataUrl: string): string => {
    return dataUrl.split(',')[1] || dataUrl
  }

  // Header
  sections.push(
    new Paragraph({
      text: data.judul.toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  // Identitas table (if exists)
  if (data.identitas) {
    const identityRows: TableRow[] = []

    const addIdentityRow = (label: string, value: string | undefined) => {
      if (!value) return
      identityRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(label)],
              width: { size: 30, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
            new TableCell({
              children: [new Paragraph(': ' + value)],
              columnSpan: 3,
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
          ],
        })
      )
    }

    addIdentityRow('Nama Guru', data.identitas.namaGuru)
    addIdentityRow('NIP', data.identitas.nipGuru)
    addIdentityRow('Nama Sekolah', data.identitas.sekolah)
    addIdentityRow('NPSN', data.identitas.npsn)
    addIdentityRow('Mata Pelajaran', data.identitas.mataPelajaran)
    addIdentityRow('Kelas', data.identitas.kelas)
    addIdentityRow('Materi', data.identitas.materi)
    addIdentityRow('Alokasi Waktu', data.identitas.alokasiWaktu ? String(data.identitas.alokasiWaktu) + ' menit' : undefined)

    if (identityRows.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Identitas',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 150 },
        })
      )
      sections.push(
        new Table({
          rows: identityRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 100, bottom: 200 },
        })
      )
    }
  }

  // Petunjuk
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Petunjuk:', bold: true })],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: data.petunjuk,
      spacing: { after: 300 },
    })
  )

  // Tujuan
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Tujuan Pembelajaran:', bold: true })],
      spacing: { before: 200, after: 100 },
    })
  )

  data.tujuan.forEach((tujuan, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(tujuan),
        ],
        spacing: { after: 150 },
      })
    )
  })

  sections.push(new Paragraph({ text: '' }))

  // Kegiatan
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Kegiatan:', bold: true })],
      spacing: { before: 200, after: 100 },
    })
  )

  data.kegiatan.forEach((kegiatan) => {
    // Check if this activity has an image
    if (images && images[kegiatan.nomor]) {
      const imageDataUrl = images[kegiatan.nomor]
      try {
        const base64Data = dataUrlToBase64(imageDataUrl)

        sections.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 150 },
            children: [
              new ImageRun({
                data: base64Data,
                transformation: {
                  width: 300,
                  height: 200,
                },
              } as any),
            ],
          })
        )
      } catch (e) {
        // Ignore image errors
      }
    }

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${kegiatan.nomor}. `, bold: true }),
          new TextRun(kegiatan.kegiatan),
        ],
        spacing: { after: 150 },
      })
    )
  })

  sections.push(new Paragraph({ text: '' }))

  // Pertanyaan
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Pertanyaan:', bold: true })],
      spacing: { before: 200, after: 100 },
    })
  )

  data.pertanyaan.forEach((pertanyaan) => {
    // Check if this question has an image (use offset from kegiatan count)
    if (images && images[data.kegiatan.length + pertanyaan.nomor]) {
      const imageDataUrl = images[data.kegiatan.length + pertanyaan.nomor]
      try {
        const base64Data = dataUrlToBase64(imageDataUrl)

        sections.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 150 },
            children: [
              new ImageRun({
                data: base64Data,
                transformation: {
                  width: 300,
                  height: 200,
                },
              } as any),
            ],
          })
        )
      } catch (e) {
        // Ignore image errors
      }
    }

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${pertanyaan.nomor}. `, bold: true }),
          new TextRun(pertanyaan.pertanyaan),
        ],
        spacing: { after: 200 },
      })
    )

    // Add column jawaban if exists
    if (pertanyaan.kolomJawaban) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Jawaban:',
              italics: true,
              size: 20,
              color: '6B7280',
            }),
          ],
          indent: { left: 720 },
          spacing: { after: 100 },
        })
      )
      sections.push(
        new Paragraph({
          text: pertanyaan.kolomJawaban,
          indent: { left: 720 },
          spacing: { after: 200 },
        })
      )
    }
  })

  return generateAndDownload(sections, filename || `LKPD_${data.judul}_${Date.now()}.docx`)
}

// ============================================
// MATERI EXPORT
// ============================================

export function exportMateriToDocx(data: MateriResponse, filename?: string): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  // Header
  sections.push(
    new Paragraph({
      text: data.judul,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Ringkasan
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Ringkasan', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 150 },
    }),
    new Paragraph({
      text: data.ringkasan,
      spacing: { after: 300 },
    })
  )

  // Poin Penting
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Poin-Poin Penting', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 150 },
    })
  )

  data.poinPenting.forEach((poin, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: '• ', bold: true, color: '2563EB' }),
          new TextRun(poin),
        ],
        spacing: { after: 150 },
        indent: { left: 360 },
      })
    )
  })

  // Contoh
  if (data.contoh && data.contoh.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Contoh', bold: true })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    )

    data.contoh.forEach((contoh) => {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: contoh.konsep + ':', bold: true })],
          spacing: { before: 150, after: 50 },
        }),
        new Paragraph({
          text: contoh.contoh,
          spacing: { after: 200 },
        })
      )
    })
  }

  // Kata Kunci
  if (data.kataKunci && data.kataKunci.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Kata Kunci', bold: true })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({
        text: data.kataKunci.join(', '),
        spacing: { after: 200 },
      })
    )
  }

  return generateAndDownload(sections, filename || `Materi_${data.judul}_${Date.now()}.docx`)
}

// ============================================
// PRESENTASI EXPORT
// ============================================

export function exportPresentasiToDocx(data: PresentasiResponse, filename?: string): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  // Header
  sections.push(
    new Paragraph({
      text: data.judul,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Audiens: ${data.audiens}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Slides
  data.slides.forEach((slide) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Slide ${slide.nomor}: `, bold: true }),
          new TextRun({ text: slide.judul, bold: true }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    )

    slide.poin.forEach((poin) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: '• ', bold: true }),
            new TextRun(poin),
          ],
          spacing: { after: 100 },
          indent: { left: 360 },
        })
      )
    })

    sections.push(new Paragraph({ text: '' }))
  })

  // Kesimpulan
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Kesimpulan', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
    }),
    new Paragraph({
      text: data.kesimpulan,
      spacing: { after: 200 },
    })
  )

  return generateAndDownload(sections, filename || `Presentasi_${data.judul}_${Date.now()}.docx`)
}

// ============================================
// RUBRIK EXPORT
// ============================================

export function exportRubrikToDocx(data: RubrikResponse, filename?: string): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  // Header
  sections.push(
    new Paragraph({
      text: data.judul,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Jenis Tugas: ${data.jenisTugas}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Rubrik Table
  const rubrikRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Aspek', bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Kriteria', bold: true })] })],
          width: { size: 30, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Skor 1', bold: true })] })],
          width: { size: 12.5, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Skor 2', bold: true })] })],
          width: { size: 12.5, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Skor 3', bold: true })] })],
          width: { size: 12.5, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Skor 4', bold: true })] })],
          width: { size: 12.5, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
      ],
    }),
  ]

  data.rubrik.forEach((r) => {
    rubrikRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(r.aspek)],
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(r.kriteria)],
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(r.skor1)],
            width: { size: 12.5, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(r.skor2)],
            width: { size: 12.5, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(r.skor3)],
            width: { size: 12.5, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(r.skor4)],
            width: { size: 12.5, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
        ],
      })
    )
  })

  sections.push(
    new Table({
      rows: rubrikRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 200, bottom: 300 },
    })
  )

  // Skala Penilaian
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Skala Penilaian', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
    }),
    new Paragraph({
      text: data.skalaPenilaian,
      spacing: { after: 200 },
    })
  )

  return generateAndDownload(sections, filename || `Rubrik_${data.jenisTugas}_${Date.now()}.docx`)
}

// ============================================
// ICEBREAK EXPORT
// ============================================

export function exportIcebreakToDocx(data: IcebreakResponse, filename?: string): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  // Header
  sections.push(
    new Paragraph({
      text: data.judul,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Aktivitas
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Aktivitas', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Nama: ', bold: true }),
        new TextRun(data.aktivitas.nama),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Deskripsi: ', bold: true }),
        new TextRun(data.aktivitas.deskripsi),
      ],
      spacing: { after: 200 },
    })
  )

  // Langkah
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Langkah Pelaksanaan', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  )

  data.langkah.forEach((langkah, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(langkah),
        ],
        spacing: { after: 150 },
      })
    )
  })

  // Tips
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Tips Pelaksanaan', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  )

  data.tips.forEach((tip, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(tip),
        ],
        spacing: { after: 150 },
      })
    )
  })

  // Peralatan
  if (data.peralatan && data.peralatan.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Peralatan yang Diperlukan', bold: true })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    )

    data.peralatan.forEach((alat, i) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. `, bold: true }),
            new TextRun(alat),
          ],
          spacing: { after: 100 },
        })
      )
    })
  }

  return generateAndDownload(sections, filename || `Icebreaking_${data.judul}_${Date.now()}.docx`)
}

// ============================================
// REFLEKSI EXPORT
// ============================================

export function exportRefleksiToDocx(data: RefleksiResponse, filename?: string): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  // Header
  sections.push(
    new Paragraph({
      text: 'REFLEKSI MENGAJAR',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Ringkasan
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Ringkasan', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: data.ringkasan,
      spacing: { after: 300 },
    })
  )

  // Apa yang Berjalan Baik
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Apa yang Berjalan Baik', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  )

  data.apaYangBerjalanBaik.forEach((poin, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(poin),
        ],
        spacing: { after: 150 },
      })
    )
  })

  // Tantangan
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Tantangan yang Dihadapi', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  )

  data.tantangan.forEach((poin, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(poin),
        ],
        spacing: { after: 150 },
      })
    )
  })

  // Rencana Perbaikan
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Rencana Perbaikan', bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  )

  data.rencanaPerbaikan.forEach((poin, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(poin),
        ],
        spacing: { after: 150 },
      })
    )
  })

  // Kata Motivasi
  sections.push(
    new Paragraph({
      text: '─'.repeat(50),
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: data.kataMotivasi,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  return generateAndDownload(sections, filename || `Refleksi_Mengajar_${Date.now()}.docx`)
}

// ============================================
// HELPER FUNCTION
// ============================================

async function generateAndDownload(sections: (Paragraph | Table)[], filename: string): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections as any,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)

  // Download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Copy data as JSON to clipboard
export function copyToolData(data: unknown): void {
  const text = JSON.stringify(data, null, 2)
  navigator.clipboard.writeText(text)
}
