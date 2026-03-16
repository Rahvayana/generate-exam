// ============================================
// DOCX EXPORT UTILITY - Enhanced Version
// Clean, professional document export for exam questions
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
import { ExamGenerationResponse, EducatorIdentity } from './exam-schema'

// ============================================
// CONSTANTS & STYLING
// ============================================

// Professional cell margins for better spacing
const cellMargin = {
  top: 120,
  bottom: 120,
  left: 120,
  right: 120,
}

// Compact cell margins for tight tables
const cellMarginCompact = {
  top: 80,
  bottom: 80,
  left: 100,
  right: 100,
}

// Border styles
const createBorder = (color = 'D1D5DB', size = 8) => ({
  top: { style: BorderStyle.SINGLE, size, color },
  bottom: { style: BorderStyle.SINGLE, size, color },
  left: { style: BorderStyle.SINGLE, size, color },
  right: { style: BorderStyle.SINGLE, size, color },
})

const createHeaderBorder = () => ({
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.SINGLE, size: 12, color: '1E40AF' },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
})

// ============================================
// COVER PAGE (HALAMAN JUDUL)
// ============================================

/**
 * Create a professional cover page
 */
function createCoverPage(
  educator?: EducatorIdentity,
  metadata?: ExamGenerationResponse['metadata']
): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = []

  const schoolName = educator?.school_name || '[NAMA SEKOLAH]'
  const subject = metadata?.subject || '[MATA PELAJARAN]'
  const classLevel = metadata?.class_level || '[KELAS]'
  const topic = metadata?.topic || '[MATERI]'
  const year = metadata?.year || new Date().getFullYear().toString()

  // Title section - centered
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'NASKAH SOAL',
          bold: true,
          size: 36,
          color: '1E40AF',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 200 },
    })
  )

  // School name
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: schoolName.toUpperCase(),
          bold: true,
          size: 28,
          color: '374151',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  )

  // Subject line with border
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '─'.repeat(60),
          size: 20,
          color: '9CA3AF',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
    })
  )

  // Identity table
  const identityRows: TableRow[] = [
    createTableRow('Mata Pelajaran', `: ${subject}`),
    createTableRow('Kelas', `: ${classLevel}`),
    createTableRow('Materi / Tema', `: ${topic}`),
    createTableRow('Tahun Ajaran', `: ${year}`),
  ]

  if (educator?.teacher_name) {
    identityRows.push(createTableRow('Nama Guru', `: ${educator.teacher_name}`))
  }

  paragraphs.push(
    new Table({
      rows: identityRows,
      width: { size: 70, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      margins: { top: 400, bottom: 800 },
    })
  )

  // Document info at bottom
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Dokumen ini diperoleh dari hasil generate AI',
          italics: true,
          size: 20,
          color: '9CA3AF',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200 },
    })
  )

  // Page break
  paragraphs.push(
    new Paragraph({
      pageBreakBefore: true,
    })
  )

  return paragraphs
}

/**
 * Helper to create a simple table row
 */
function createTableRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label,
                bold: true,
                size: 22,
              }),
            ],
          }),
        ],
        width: { size: 40, type: WidthType.PERCENTAGE },
        margins: cellMarginCompact,
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: value,
                size: 22,
              }),
            ],
          }),
        ],
        width: { size: 60, type: WidthType.PERCENTAGE },
        margins: cellMarginCompact,
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      }),
    ],
  })
}

// ============================================
// INSTRUCTIONS (PETUNJUK PENGERJAAN)
// ============================================

/**
 * Create work instructions section
 */
function createInstructionsSection(): Paragraph[] {
  const paragraphs: Paragraph[] = []

  // Section header
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PETUNJUK PENGERJAAN',
          bold: true,
          size: 28,
          color: '1E40AF',
        }),
      ],
      spacing: { before: 400, after: 300 },
    })
  )

  // Instructions
  const instructions = [
    '1. Berdoalah sebelum mengerjakan soal.',
    '2. Perhatikan petunjuk pada setiap bagian soal.',
    '3. Kerjakan soal dengan teliti dan jujur.',
    '4. Waktu pengerjaan sesuai dengan jadwal yang ditentukan.',
    '5. Dilarang menggunakan alat bantu hitung yang tidak diperbolehkan.',
    '6. Periksa kembali jawaban sebelum menyerahkan kepada pengawas.',
  ]

  instructions.forEach((instruction) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: instruction,
            size: 22,
          }),
        ],
        spacing: { after: 150 },
        indent: { left: 720 },
      })
    )
  })

  // Divider
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '',
        }),
      ],
      spacing: { after: 300 },
    })
  )

  return paragraphs
}

// ============================================
// QUESTIONS SECTION
// ============================================

/**
 * Helper function to convert data URL to base64 without prefix
 */
function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(',')[1] || dataUrl
}

/**
 * Create questions section with proper formatting
 */
async function createQuestionsSection(
  data: ExamGenerationResponse,
  images?: Record<number, string>
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = []

  // Separate multiple choice and essay questions
  const multipleChoiceQuestions = data.questions.filter(
    (q) => q.type === 'multiple_choice'
  )
  const essayQuestions = data.questions.filter(
    (q) => q.type === 'essay'
  )

  // === Multiple Choice Section ===
  if (multipleChoiceQuestions.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'A. PILIHAN GANDA',
            bold: true,
            size: 28,
            color: '1E40AF',
          }),
        ],
        spacing: { before: 400, after: 300 },
      })
    )

    for (const q of multipleChoiceQuestions) {
      // Check if this question has an image
      if (images && images[q.number]) {
        const imageDataUrl = images[q.number]
        const base64Data = dataUrlToBase64(imageDataUrl)

        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
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
      }

      // Question number and text
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${q.number}. `,
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: q.question_text,
              size: 22,
            }),
          ],
          spacing: { after: 180 },
        })
      )

      // Options
      if (q.options) {
        q.options.forEach((opt) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${opt.label}. `,
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: opt.text,
                  size: 22,
                }),
              ],
              indent: { left: 720 },
              spacing: { after: 120 },
            })
          )
        })
      }

      paragraphs.push(
        new Paragraph({
          text: '',
          spacing: { after: 200 },
        })
      )
    }
  }

  // === Essay Section ===
  if (essayQuestions.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'B. URAIAN',
            bold: true,
            size: 28,
            color: '1E40AF',
          }),
        ],
        spacing: { before: 400, after: 300 },
      })
    )

    for (const q of essayQuestions) {
      // Check if this question has an image
      if (images && images[q.number]) {
        const imageDataUrl = images[q.number]
        try {
          const base64Data = dataUrlToBase64(imageDataUrl)

          // Add image paragraph
          paragraphs.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
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
        } catch (error) {
          // If image fails to load, add a placeholder note
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '[Gambar tidak dapat dimuat]',
                  italics: true,
                  color: '9CA3AF',
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          )
        }
      }

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${q.number}. `,
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: q.question_text,
              size: 22,
            }),
          ],
          spacing: { after: 300 },
        })
      )

      // Space for answer
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '─'.repeat(50),
              size: 18,
              color: 'D1D5DB',
            }),
          ],
          spacing: { after: 100 },
        })
      )
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '─'.repeat(50),
              size: 18,
              color: 'D1D5DB',
            }),
          ],
          spacing: { after: 300 },
        })
      )
    }
  }

  return paragraphs
}

// ============================================
// ANSWER KEY SECTION
// ============================================

/**
 * Create answer key table with clean formatting
 */
function createAnswerKeyTable(data: ExamGenerationResponse): Table {
  const rows: TableRow[] = []

  // Header
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'No',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'DBEAFE' },
          borders: createBorder('3B82F6'),
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Kunci',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 12, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'DBEAFE' },
          borders: createBorder('3B82F6'),
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Pembahasan Singkat',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 80, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          shading: { fill: 'DBEAFE' },
          borders: createBorder('3B82F6'),
        }),
      ],
    })
  )

  // Data rows
  data.questions.forEach((q, index) => {
    const rowColor = index % 2 === 0 ? 'FFFFFF' : 'F9FAFB'
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: String(q.number),
                    size: 22,
                  }),
                ],
              }),
            ],
            width: { size: 8, type: WidthType.PERCENTAGE },
            margins: cellMarginCompact,
            shading: { fill: rowColor },
            borders: createBorder(),
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: q.correct_answer,
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
            ],
            width: { size: 12, type: WidthType.PERCENTAGE },
            margins: cellMarginCompact,
            shading: { fill: rowColor },
            borders: createBorder(),
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: q.explanation || '-',
                    size: 22,
                  }),
                ],
              }),
            ],
            width: { size: 80, type: WidthType.PERCENTAGE },
            margins: cellMarginCompact,
            shading: { fill: rowColor },
            borders: createBorder(),
          }),
        ],
      })
    )
  })

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 200, bottom: 200 },
  })
}

// ============================================
// SCORING GUIDELINES (PEDOMAN PENSKORAN)
// ============================================

/**
 * Create scoring guidelines section
 */
function createScoringGuidelines(data: ExamGenerationResponse): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = []

  // Section header
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PEDOMAN PENSKORAN',
          bold: true,
          size: 28,
          color: '1E40AF',
        }),
      ],
      spacing: { before: 400, after: 300 },
    })
  )

  // Scoring rubric
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '1. Pilihan Ganda',
          bold: true,
          size: 24,
        }),
      ],
      spacing: { before: 200, after: 150 },
    })
  )

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Skor: 1 point untuk setiap jawaban benar, 0 point untuk jawaban salah.',
          size: 22,
        }),
      ],
      indent: { left: 720 },
      spacing: { after: 200 },
    })
  )

  // Scoring table
  const scoringRows: TableRow[] = []

  // Header
  scoringRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        createScoringCell('Rentang Nilai', true, '10'),
        createScoringCell('Predikat', true, '20'),
        createScoringCell('Keterangan', true, '70'),
      ],
    })
  )

  // Data
  const scoringData = [
    ['90 - 100', 'A', 'Sangat Baik'],
    ['80 - 89', 'B', 'Baik'],
    ['70 - 79', 'C', 'Cukup'],
    ['60 - 69', 'D', 'Kurang'],
    ['0 - 59', 'E', 'Sangat Kurang'],
  ]

  scoringData.forEach(([range, predikat, keterangan]) => {
    scoringRows.push(
      new TableRow({
        children: [
          createScoringCell(range, false, '10'),
          createScoringCell(predikat, false, '20'),
          createScoringCell(keterangan, false, '70'),
        ],
      })
    )
  })

  paragraphs.push(
    new Table({
      rows: scoringRows,
      width: { size: 80, type: WidthType.PERCENTAGE },
      margins: { top: 300, bottom: 300 },
    })
  )

  // Essay scoring notes
  const essayCount = data.questions.filter((q) => q.type === 'essay').length
  if (essayCount > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '2. Soal Uraian',
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: 300, after: 150 },
      })
    )

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Penilaian soal uraian berdasarkan:`,
            size: 22,
          }),
        ],
        indent: { left: 720 },
        spacing: { after: 100 },
      })
    )

    const essayCriteria = [
      'Ketepatan jawaban sesuai dengan pertanyaan',
      'Kedalaman dan keluasan jawaban',
      'Sistematika dan kerapian penyajian',
      'Penggunaan bahasa yang baik dan benar',
    ]

    essayCriteria.forEach((criteria, idx) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${String.fromCharCode(97 + idx)}. ${criteria}`,
              size: 22,
            }),
          ],
          indent: { left: 1080 },
          spacing: { after: 80 },
        })
      )
    })
  }

  return paragraphs
}

/**
 * Helper to create a scoring cell
 */
function createScoringCell(text: string, bold: boolean, width: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold,
            size: 22,
          }),
        ],
      }),
    ],
    width: { size: parseFloat(width), type: WidthType.PERCENTAGE },
    margins: cellMargin,
    borders: createBorder(),
    shading: bold ? { fill: 'DBEAFE' } : undefined,
  })
}

// ============================================
// SIGNATURE SECTION (PENGESAHAN)
// ============================================

/**
 * Create signature/approval section
 */
function createSignatureSection(
  educator?: EducatorIdentity,
  metadata?: ExamGenerationResponse['metadata']
): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = []

  // Section header
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PENGESAHAN',
          bold: true,
          size: 28,
          color: '1E40AF',
        }),
      ],
      spacing: { before: 400, after: 400 },
    })
  )

  const place = educator?.school_name || '[KOTA]'
  const date = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Approval statement
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Naskah soal ini disusun untuk digunakan sebagai bahan evaluasi pembelajaran.`,
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    })
  )

  // Date and place
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${place}, ${date}`,
          size: 22,
        }),
      ],
      spacing: { before: 400, after: 800 },
    })
  )

  // Signature table
  const signatureRows: TableRow[] = []

  // Header
  signatureRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Mengetahui,',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Menyusun,',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        }),
      ],
    })
  )

  // Kepala Sekolah
  const kepsekLabel = educator?.principal_name
    ? `Kepala ${educator.school_name?.toLowerCase().includes('madrasah') ||
        educator.school_name?.toLowerCase().includes('mi') ||
        educator.school_name?.toLowerCase().includes('mts') ||
        educator.school_name?.toLowerCase().includes('ma')
        ? 'Madrasah'
        : 'Sekolah'}`
    : 'Kepala Sekolah'

  signatureRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: kepsekLabel,
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Guru Mata Pelajaran',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        }),
      ],
    })
  )

  // Name spaces
  signatureRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: educator?.principal_name || '(.......................................................)',
                  size: 22,
                  underline: !educator?.principal_name ? {} : undefined,
                }),
              ],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          margins: { top: 1600, bottom: 200, left: 100, right: 100 },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: educator?.teacher_name || '(.......................................................)',
                  size: 22,
                  underline: !educator?.teacher_name ? {} : undefined,
                }),
              ],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          margins: { top: 1600, bottom: 200, left: 100, right: 100 },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        }),
      ],
    })
  )

  // NIP
  signatureRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: educator?.principal_nip ? `NIP. ${educator.principal_nip}` : 'NIP. ....................................',
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: educator?.teacher_nip ? `NIP. ${educator.teacher_nip}` : 'NIP. ....................................',
                  size: 22,
                }),
              ],
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          margins: cellMargin,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        }),
      ],
    })
  )

  paragraphs.push(
    new Table({
      rows: signatureRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 200, bottom: 400 },
    })
  )

  return paragraphs
}

// ============================================
// KISI-KISI TABLE
// ============================================

/**
 * Create kisi-kisi (question grid) table
 */
function createKisiKisiTable(data: ExamGenerationResponse): Table {
  const rows: TableRow[] = []

  // Header
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        createKisiKisiCell('No', 8, 'F3E8FF'),
        createKisiKisiCell('Materi', 22, 'F3E8FF'),
        createKisiKisiCell('Indikator Soal', 30, 'F3E8FF'),
        createKisiKisiCell('Level', 12, 'F3E8FF'),
        createKisiKisiCell('Kesulitan', 14, 'F3E8FF'),
        createKisiKisiCell('Kunci', 14, 'F3E8FF'),
      ],
    })
  )

  // Data rows
  data.questions.forEach((q, index) => {
    const rowColor = index % 2 === 0 ? 'FFFFFF' : 'FAFAFA'
    rows.push(
      new TableRow({
        children: [
          createKisiKisiCell(String(q.number), 8, rowColor, true),
          createKisiKisiCell(q.material, 22, rowColor),
          createKisiKisiCell(q.indicator, 30, rowColor),
          createKisiKisiCell(q.cognitive_level, 12, rowColor, true),
          createKisiKisiCell(q.difficulty, 14, rowColor, true),
          createKisiKisiCell(q.correct_answer, 14, rowColor, true),
        ],
      })
    )
  })

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 200, bottom: 200 },
  })
}

/**
 * Helper to create a kisi-kisi cell
 */
function createKisiKisiCell(
  text: string,
  width: number,
  bgColor: string,
  center = false
): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: bgColor === 'F3E8FF',
            size: 20,
          }),
        ],
      }),
    ],
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: cellMarginCompact,
    borders: createBorder(),
    shading: { fill: bgColor },
  })
}

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

/**
 * Main export function - creates and downloads DOCX
 * Structure:
 * 1. Cover Page (Halaman Judul)
 * 2. Instructions (Petunjuk Pengerjaan)
 * 3. Questions (Soal - Pilihan Ganda & Uraian)
 * 4. Answer Key (Kunci Jawaban)
 * 5. Scoring Guidelines (Pedoman Penskoran)
 * 6. Question Grid (Kisi-Kisi Soal)
 * 7. Signature (Pengesahan)
 */
export async function exportToDocx(
  data: ExamGenerationResponse,
  images?: Record<number, string>,
  filename?: string
): Promise<void> {
  const sections: (Paragraph | Table)[] = []

  const educator = data.educator
  const metadata = data.metadata

  // === SECTION 1: Cover Page ===
  sections.push(...createCoverPage(educator, metadata))

  // === SECTION 2: Instructions ===
  sections.push(...createInstructionsSection())

  // === SECTION 3: Questions ===
  const questionsSection = await createQuestionsSection(data, images)
  sections.push(...questionsSection)

  // Page break before answer key
  sections.push(
    new Paragraph({
      pageBreakBefore: true,
    })
  )

  // === SECTION 4: Answer Key ===
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'KUNCI JAWABAN DAN PEMBAHASAN',
          bold: true,
          size: 28,
          color: '1E40AF',
        }),
      ],
      spacing: { before: 400, after: 200 },
    })
  )
  sections.push(createAnswerKeyTable(data))

  // Page break
  sections.push(
    new Paragraph({
      pageBreakBefore: true,
    })
  )

  // === SECTION 5: Scoring Guidelines ===
  sections.push(...createScoringGuidelines(data))

  // Page break
  sections.push(
    new Paragraph({
      pageBreakBefore: true,
    })
  )

  // === SECTION 6: Kisi-Kisi ===
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'KISI-KISI SOAL',
          bold: true,
          size: 28,
          color: '1E40AF',
        }),
      ],
      spacing: { before: 400, after: 200 },
    })
  )
  sections.push(createKisiKisiTable(data))

  // Page break
  sections.push(
    new Paragraph({
      pageBreakBefore: true,
    })
  )

  // === SECTION 7: Signature ===
  sections.push(...createSignatureSection(educator, metadata))

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: sections as any[],
      },
    ],
  })

  // Generate blob
  const blob = await Packer.toBlob(doc)

  // Download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download =
    filename ||
    `Naskah_Soal_${data.metadata?.subject || 'Exam'}_${Date.now()}.docx`
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
