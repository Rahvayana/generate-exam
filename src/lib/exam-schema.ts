// ============================================
// EXAM GENERATION SYSTEM - JSON SCHEMA
// ============================================

// Type Definitions
export interface ExamMetadata {
  subject: string
  topic: string
  class_level: string
  education_level: string
  year: string
  total_questions: number
  question_type: QuestionType
  curriculum?: string
}

export type QuestionType = 'multiple_choice' | 'essay' | 'short_answer' | 'true_false' | 'matching' | 'mixed'
export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit'
export type CognitiveLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6'

export interface QuestionOption {
  label: string
  text: string
}

export interface Question {
  number: number
  type: QuestionType
  difficulty: DifficultyLevel
  cognitive_level: CognitiveLevel
  question_text: string
  image_prompt: string | null
  options?: QuestionOption[]
  correct_answer: string
  explanation: string
  indicator: string
  material: string
}

export interface DifficultyDistribution {
  mudah: number
  sedang: number
  sulit: number
}

export interface CognitiveDistribution {
  C1?: number
  C2?: number
  C3?: number
  C4?: number
  C5?: number
  C6?: number
}

export interface EducatorIdentity {
  teacher_name?: string
  teacher_nip?: string
  school_name?: string
  principal_name?: string
  principal_nip?: string
}

export interface ExamGenerationRequest {
  metadata: ExamMetadata
  educator?: EducatorIdentity
  difficulty_distribution: DifficultyDistribution
  cognitive_distribution?: CognitiveDistribution
  include_images: boolean
  special_instructions?: string
  reference_text?: string
}

export interface ExamGenerationResponse {
  metadata: ExamMetadata
  educator?: EducatorIdentity
  questions: Question[]
}

// JSON Schema for validation
export const EXAM_JSON_SCHEMA = {
  type: 'object',
  required: ['metadata', 'questions'],
  properties: {
    metadata: {
      type: 'object',
      required: ['subject', 'topic', 'class_level', 'total_questions', 'question_type'],
      properties: {
        subject: { type: 'string' },
        topic: { type: 'string' },
        class_level: { type: 'string' },
        education_level: { type: 'string' },
        year: { type: 'string' },
        total_questions: { type: 'number', minimum: 1, maximum: 100 },
        question_type: {
          type: 'string',
          enum: ['multiple_choice', 'essay', 'short_answer', 'true_false', 'matching', 'mixed']
        },
        curriculum: { type: 'string' }
      }
    },
    educator: {
      type: 'object',
      properties: {
        teacher_name: { type: 'string' },
        teacher_nip: { type: 'string' },
        school_name: { type: 'string' },
        principal_name: { type: 'string' },
        principal_nip: { type: 'string' }
      }
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['number', 'type', 'difficulty', 'cognitive_level', 'question_text', 'correct_answer', 'explanation', 'indicator', 'material'],
        properties: {
          number: { type: 'number', minimum: 1 },
          type: {
            type: 'string',
            enum: ['multiple_choice', 'essay', 'short_answer', 'true_false', 'matching', 'mixed']
          },
          difficulty: {
            type: 'string',
            enum: ['mudah', 'sedang', 'sulit']
          },
          cognitive_level: {
            type: 'string',
            enum: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
          },
          question_text: { type: 'string', minLength: 1 },
          image_prompt: { type: ['string', 'null'] },
          options: {
            type: 'array',
            items: {
              type: 'object',
              required: ['label', 'text'],
              properties: {
                label: { type: 'string' },
                text: { type: 'string' }
              }
            }
          },
          correct_answer: { type: 'string' },
          explanation: { type: 'string' },
          indicator: { type: 'string' },
          material: { type: 'string' }
        }
      }
    }
  }
}

// Helper to calculate distribution
export function calculateDistribution(
  total: number,
  selected: DifficultyLevel[]
): DifficultyDistribution {
  const result: DifficultyDistribution = { mudah: 0, sedang: 0, sulit: 0 }

  if (selected.length === 0) {
    // Default distribution
    result.mudah = Math.floor(total * 0.3)
    result.sedang = Math.floor(total * 0.5)
    result.sulit = total - result.mudah - result.sedang
    return result
  }

  const weights: Record<DifficultyLevel, number> = {
    mudah: 0.3,
    sedang: 0.5,
    sulit: 0.2
  }

  // Calculate based on selected
  let remaining = total
  const selectedCount = selected.length

  selected.forEach((level, index) => {
    if (index === selectedCount - 1) {
      result[level] = remaining
    } else {
      const count = Math.floor(total * weights[level] / selectedCount * 2)
      result[level] = count
      remaining -= count
    }
  })

  return result
}

export function calculateCognitiveDistribution(
  total: number,
  selected: CognitiveLevel[]
): CognitiveDistribution {
  const result: CognitiveDistribution = {}

  if (selected.length === 0) return result

  const perLevel = Math.floor(total / selected.length)
  let remaining = total

  selected.forEach((level, index) => {
    if (index === selected.length - 1) {
      result[level] = remaining
    } else {
      result[level] = perLevel
      remaining -= perLevel
    }
  })

  return result
}

/**
 * Reorder questions by difficulty to ensure correct distribution
 * Questions 1-30%: mudah, 30%-80%: sedang, 80%-100%: sulit
 */
export function reorderQuestionsByDifficulty(
  questions: Question[],
  targetDistribution: DifficultyDistribution
): Question[] {
  const result: Question[] = []

  // Separate by difficulty
  const byDifficulty: Record<DifficultyLevel, Question[]> = {
    mudah: [],
    sedang: [],
    sulit: []
  }

  questions.forEach(q => {
    if (byDifficulty[q.difficulty]) {
      byDifficulty[q.difficulty].push(q)
    }
  })

  // Assign numbers based on distribution
  let currentNumber = 1

  // Add mudah questions
  const mudahCount = targetDistribution.mudah
  byDifficulty.mudah.forEach(q => {
    if (currentNumber <= mudahCount) {
      result.push({ ...q, number: currentNumber })
      currentNumber++
    }
  })

  // Add sedang questions
  const sedangEnd = mudahCount + targetDistribution.sedang
  byDifficulty.sedang.forEach(q => {
    if (currentNumber <= sedangEnd) {
      result.push({ ...q, number: currentNumber })
      currentNumber++
    }
  })

  // Add sulit questions
  byDifficulty.sulit.forEach(q => {
    if (currentNumber <= questions.length) {
      result.push({ ...q, number: currentNumber })
      currentNumber++
    }
  })

  // If we still don't have enough questions, add remaining (shouldn't happen)
  const remaining = questions.filter(q => !result.includes(q))
  remaining.forEach(q => {
    if (!result.find(r => r.number === q.number)) {
      result.push(q)
    }
  })

  // Sort by number
  result.sort((a, b) => a.number - b.number)

  return result
}
