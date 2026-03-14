// ============================================
// DOCX EXPORT UTILITY
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
  TableOfContents,
} from 'docx'
import { ExamGenerationResponse, EducatorIdentity } from './exam-schema'

// Number to words in Indonesian
function numberToWords(num: number): string {
  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan']
  const teens = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas']
  const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh']

  if (num === 0) return 'Nol'
  if (num < 10) return units[num]
  if (num < 20) return teens[num - 10]
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '')
  return num.toString()
}

// Create border definition
const createBorder = (color = '000000', size = 6) => ({
  top: { style: BorderStyle.SINGLE, size, color },
  bottom: { style: BorderStyle.SINGLE, size, color },
  left: { style: BorderStyle.SINGLE, size, color },
  right: { style: BorderStyle.SINGLE, size, color },
})

// Cell margins
const cellMargin = {
  top: 100,
  bottom: 100,
  left: 100,
  right: 100,
}

/**
 * Create identity section
 */
function createIdentitySection(educator?: EducatorIdentity, metadata?: ExamGenerationResponse['metadata']): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = []

  // Header
  items.push(
    new Paragraph({
      text: 'NASKAH SOAL',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  // Identity table
  if (educator || metadata) {
    const identityRows: TableRow[] = []

    if (metadata?.subject) {
      identityRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Mata Pelajaran')],
              width: { size: 30, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
            new TableCell({
              children: [new Paragraph(': ' + metadata.subject)],
              columnSpan: 3,
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
          ],
        })
      )
    }

    if (metadata?.class_level) {
      identityRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Kelas')],
              width: { size: 30, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
            new TableCell({
              children: [new Paragraph(': ' + metadata.class_level)],
              columnSpan: 3,
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
          ],
        })
      )
    }

    if (metadata?.topic) {
      identityRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Materi')],
              width: { size: 30, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
            new TableCell({
              children: [new Paragraph(': ' + metadata.topic)],
              columnSpan: 3,
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
          ],
        })
      )
    }

    if (educator?.teacher_name) {
      identityRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Nama Guru')],
              width: { size: 30, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
            new TableCell({
              children: [new Paragraph(': ' + educator.teacher_name)],
              columnSpan: 3,
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
          ],
        })
      )
    }

    if (educator?.school_name) {
      identityRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Nama Sekolah')],
              width: { size: 30, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
            new TableCell({
              children: [new Paragraph(': ' + educator.school_name)],
              columnSpan: 3,
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: cellMargin,
              borders: createBorder(),
            }),
          ],
        })
      )
    }

    if (identityRows.length > 0) {
      items.push(
        new Table({
          rows: identityRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 200, bottom: 300 },
        })
      )
    }
  }

  return items
}

/**
 * Create questions section
 */
function createQuestionsSection(data: ExamGenerationResponse): Paragraph[] {
  const paragraphs: Paragraph[] = []

  // Section header
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'A. Pilihan Ganda',
          bold: true,
          size: 28,
        }),
      ],
      spacing: { before: 300, after: 200 },
    })
  )

  // Questions
  data.questions.forEach((q) => {
    // Question number and text
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${q.number}. `,
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: q.question_text,
            size: 24,
          }),
        ],
        spacing: { after: 150 },
      })
    )

    // Options for multiple choice
    if (q.type === 'multiple_choice' && q.options) {
      q.options.forEach((opt) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${opt.label}. `,
                bold: true,
                size: 24,
              }),
              new TextRun({
                text: opt.text,
                size: 24,
              }),
            ],
            indent: { left: 720 },
            spacing: { after: 100 },
          })
        )
      })
    }

    paragraphs.push(new Paragraph({ text: '' }))
  })

  return paragraphs
}

/**
 * Create answer key table
 */
function createAnswerKeyTable(data: ExamGenerationResponse): Table {
  const rows: TableRow[] = []

  // Header
  rows.push(
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
          children: [new Paragraph({ children: [new TextRun({ text: 'Kunci Jawaban', bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Pembahasan', bold: true })] })],
          width: { size: 70, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'E6F0FF' },
          borders: createBorder(),
        }),
      ],
    })
  )

  // Data rows
  data.questions.forEach((q) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(String(q.number))],
            width: { size: 10, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: q.correct_answer, bold: true })] })],
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(q.explanation)],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
        ],
      })
    )
  })

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 300, bottom: 300 },
  })
}

/**
 * Create kisi-kisi table
 */
function createKisiKisiTable(data: ExamGenerationResponse): Table {
  const rows: TableRow[] = []

  // Header
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true })] })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'F3E5F5' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Materi', bold: true })] })],
          width: { size: 25, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'F3E5F5' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Indikator Soal', bold: true })] })],
          width: { size: 35, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'F3E5F5' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Level', bold: true })] })],
          width: { size: 12, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'F3E5F5' },
          borders: createBorder(),
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Kesulitan', bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'F3E5F5' },
          borders: createBorder(),
        }),
      ],
    })
  )

  // Data rows
  data.questions.forEach((q) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(String(q.number))],
            width: { size: 8, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(q.material)],
            width: { size: 25, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(q.indicator)],
            width: { size: 35, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(q.cognitive_level)],
            width: { size: 12, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
          new TableCell({
            children: [new Paragraph(q.difficulty)],
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: cellMargin,
            borders: createBorder(),
          }),
        ],
      })
    )
  })

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 300, bottom: 300 },
  })
}

/**
 * Create kartu soal section
 */
function createKartuSoalSection(data: ExamGenerationResponse): Paragraph[] {
  const paragraphs: Paragraph[] = []

  data.questions.forEach((q) => {
    // Card header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `KARTU SOAL NO. ${q.number}`,
            bold: true,
            size: 26,
          }),
        ],
        spacing: { before: 400, after: 200 },
      })
    )

    // Info fields
    const infoFields: [string, string][] = [
      ['Materi', q.material],
      ['Indikator', q.indicator],
      ['Level Kognitif', q.cognitive_level],
      ['Tingkat Kesulitan', q.difficulty],
    ]

    infoFields.forEach(([label, value]) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: label + ': ', bold: true, size: 22 }),
            new TextRun({ text: value, size: 22 }),
          ],
          spacing: { after: 100 },
        })
      )
    })

    // Question text
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: 'Naskah Soal:', bold: true, size: 22 })],
        spacing: { before: 200, after: 100 },
      })
    )

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: q.question_text, size: 22 })],
        spacing: { after: 150 },
      })
    )

    // Options
    if (q.type === 'multiple_choice' && q.options) {
      q.options.forEach((opt) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${opt.label}. `, bold: true, size: 22 }),
              new TextRun({ text: opt.text, size: 22 }),
            ],
            indent: { left: 720 },
            spacing: { after: 100 },
          })
        )
      })
    }

    // Answer key
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Kunci Jawaban: ', bold: true, size: 22 }),
          new TextRun({ text: q.correct_answer, size: 22 }),
        ],
        spacing: { before: 150, after: 400 },
      })
    )

    // Separator
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '─'.repeat(80),
            size: 20,
          }),
        ],
        spacing: { after: 300 },
      })
    )
  })

  return paragraphs
}

/**
 * Main export function - creates and downloads DOCX
 */
export async function exportToDocx(
  data: ExamGenerationResponse,
  images?: Record<number, string>,
  filename?: string
): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  // Section 1: Identity + Questions
  sections.push(...createIdentitySection(data.educator, data.metadata))
  sections.push(...createQuestionsSection(data))

  // Page break
  sections.push(
    new Paragraph({
      pageBreakBefore: true,
    })
  )

  // Section 2: Answer Key
  sections.push(
    new Paragraph({
      text: 'KUNCI JAWABAN DAN PEMBAHASAN',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  )
  sections.push(createAnswerKeyTable(data))

  // Page break
  sections.push(
    new Paragraph({
      pageBreakBefore: true,
    })
  )

  // Section 3: Kisi-Kisi
  sections.push(
    new Paragraph({
      text: 'KISI-KISI SOAL',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  )
  sections.push(createKisiKisiTable(data))

  // Page break
  sections.push(
    new Paragraph({
      pageBreakBefore: true,
    })
  )

  // Section 4: Kartu Soal
  sections.push(
    new Paragraph({
      text: 'KARTU SOAL',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  )
  sections.push(...createKartuSoalSection(data))

  // Create document with proper structure
  const docChildren = sections.map((item) => {
    if ('table' in item) {
      // It's a Table, but we need to wrap it properly
      // For now, let's handle Paragraph and Table separately
      return item as any
    }
    return item
  })

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  })

  // Generate blob
  const blob = await Packer.toBlob(doc)

  // Download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `Soal_${data.metadata?.subject || 'Exam'}_${Date.now()}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Copy exam data as JSON to clipboard
 */
export function copyExamData(data: ExamGenerationResponse): void {
  const text = JSON.stringify(data, null, 2)
  navigator.clipboard.writeText(text)
}
