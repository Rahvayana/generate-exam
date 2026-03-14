// ============================================
// EXAM VALIDATION SYSTEM
// ============================================

import {
  ExamGenerationResponse,
  Question,
  ExamGenerationRequest,
  DifficultyLevel,
  CognitiveLevel,
  QuestionType
} from './exam-schema'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  question_number?: number
}

export interface ValidationWarning {
  field: string
  message: string
  question_number?: number
}

// Difficulty level mapping for validation
const VALID_DIFFICULTIES: DifficultyLevel[] = ['mudah', 'sedang', 'sulit']
const VALID_COGNITIVE: CognitiveLevel[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
const VALID_QUESTION_TYPES: QuestionType[] = ['multiple_choice', 'essay', 'short_answer', 'true_false', 'matching', 'mixed']

/**
 * Main validation function
 */
export function validateExamResponse(
  response: unknown,
  request: ExamGenerationRequest
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Type check: must be object
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Response must be a valid JSON object' }],
      warnings: []
    }
  }

  const data = response as Record<string, unknown>

  // Validate metadata
  if (!data.metadata || typeof data.metadata !== 'object') {
    errors.push({ field: 'metadata', message: 'Metadata is required and must be an object' })
  } else {
    validateMetadata(data.metadata as Record<string, unknown>, errors)
  }

  // Validate questions array
  if (!Array.isArray(data.questions)) {
    errors.push({ field: 'questions', message: 'Questions must be an array' })
  } else {
    validateQuestionsArray(
      data.questions as unknown[],
      request.metadata.total_questions,
      request.metadata.question_type,
      errors,
      warnings
    )
  }

  // Validate educator if present
  if (data.educator && typeof data.educator === 'object') {
    validateEducator(data.educator as Record<string, unknown>, warnings)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate metadata object
 */
function validateMetadata(
  metadata: Record<string, unknown>,
  errors: ValidationError[]
): void {
  const requiredFields = ['subject', 'topic', 'class_level', 'total_questions', 'question_type']

  requiredFields.forEach(field => {
    if (!metadata[field]) {
      errors.push({ field: `metadata.${field}`, message: `${field} is required` })
    }
  })

  // Validate total_questions is a number
  if (metadata.total_questions && typeof metadata.total_questions !== 'number') {
    errors.push({ field: 'metadata.total_questions', message: 'total_questions must be a number' })
  }

  // Validate question_type
  if (metadata.question_type && typeof metadata.question_type === 'string') {
    if (!VALID_QUESTION_TYPES.includes(metadata.question_type as QuestionType)) {
      errors.push({
        field: 'metadata.question_type',
        message: `Invalid question_type. Must be one of: ${VALID_QUESTION_TYPES.join(', ')}`
      })
    }
  }
}

/**
 * Validate questions array
 */
function validateQuestionsArray(
  questions: unknown[],
  expectedCount: number,
  expectedType: QuestionType,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Check question count
  if (questions.length !== expectedCount) {
    errors.push({
      field: 'questions.length',
      message: `Expected ${expectedCount} questions, got ${questions.length}`
    })
  }

  // Validate each question
  questions.forEach((q, index) => {
    validateQuestion(q, index + 1, expectedType, errors, warnings)
  })

  // Check for duplicate question numbers
  const numbers = questions
    .map(q => (q as Record<string, unknown>).number)
    .filter(n => typeof n === 'number') as number[]

  const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i)
  if (duplicates.length > 0) {
    errors.push({
      field: 'questions.number',
      message: `Duplicate question numbers found: ${[...new Set(duplicates)].join(', ')}`
    })
  }
}

/**
 * Validate difficulty distribution by question number
 */
export function validateDifficultyByNumber(
  questions: Question[],
  totalQuestions: number
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  const easyEnd = Math.floor(totalQuestions * 0.3)
  const mediumEnd = Math.floor(totalQuestions * 0.8)

  // Expected ranges (inclusive)
  const ranges = [
    { start: 1, end: easyEnd, expected: 'mudah' },
    { start: easyEnd + 1, end: mediumEnd, expected: 'sedang' },
    { start: mediumEnd + 1, end: totalQuestions, expected: 'sulit' },
  ]

  questions.forEach((q) => {
    const range = ranges.find(r => q.number >= r.start && q.number <= r.end)
    if (!range) {
      errors.push({
        field: 'questions.number',
        message: `Question ${q.number} is outside valid range (1-${totalQuestions})`,
        question_number: q.number,
      })
      return
    }

    if (q.difficulty !== range.expected) {
      warnings.push({
        field: 'questions.difficulty',
        message: `Question ${q.number} should be ${range.expected.toUpperCase()} (position ${q.number} is in ${range.expected.toUpperCase()} range), but got ${q.difficulty.toUpperCase()}`,
        question_number: q.number,
      })
    }
  })

  // Count actual distribution
  const actual: Record<string, number> = { mudah: 0, sedang: 0, sulit: 0 }
  questions.forEach(q => {
    if (q.difficulty && actual[q.difficulty] !== undefined) {
      actual[q.difficulty]++
    }
  })

  const expected = {
    mudah: easyEnd,
    sedang: mediumEnd - easyEnd,
    sulit: totalQuestions - mediumEnd,
  }

  Object.entries(expected).forEach(([level, count]) => {
    if (actual[level] !== count) {
      warnings.push({
        field: 'questions.difficulty',
        message: `Difficulty ${level}: expected ${count}, got ${actual[level]}`,
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate individual question
 */
function validateQuestion(
  question: unknown,
  questionNumber: number,
  expectedType: QuestionType,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!question || typeof question !== 'object' || Array.isArray(question)) {
    errors.push({
      field: 'questions',
      message: `Question at position ${questionNumber} must be an object`,
      question_number: questionNumber
    })
    return
  }

  const q = question as Record<string, unknown>

  // Required fields
  const requiredFields = [
    'number', 'type', 'difficulty', 'cognitive_level',
    'question_text', 'correct_answer', 'explanation', 'indicator', 'material'
  ]

  requiredFields.forEach(field => {
    if (q[field] === undefined || q[field] === null) {
      errors.push({
        field: `questions.${field}`,
        message: `Question ${questionNumber}: Missing required field '${field}'`,
        question_number: questionNumber
      })
    }
  })

  // Validate difficulty
  if (q.difficulty && typeof q.difficulty === 'string') {
    if (!VALID_DIFFICULTIES.includes(q.difficulty as DifficultyLevel)) {
      errors.push({
        field: 'questions.difficulty',
        message: `Question ${questionNumber}: Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        question_number: questionNumber
      })
    }
  }

  // Validate cognitive_level
  if (q.cognitive_level && typeof q.cognitive_level === 'string') {
    if (!VALID_COGNITIVE.includes(q.cognitive_level as CognitiveLevel)) {
      errors.push({
        field: 'questions.cognitive_level',
        message: `Question ${questionNumber}: Invalid cognitive_level. Must be one of: ${VALID_COGNITIVE.join(', ')}`,
        question_number: questionNumber
      })
    }
  }

  // Validate type-specific fields
  if (q.type === 'multiple_choice') {
    if (!Array.isArray(q.options)) {
      errors.push({
        field: 'questions.options',
        message: `Question ${questionNumber}: Multiple choice questions must have options array`,
        question_number: questionNumber
      })
    } else if (q.options.length < 2) {
      errors.push({
        field: 'questions.options',
        message: `Question ${questionNumber}: Multiple choice questions must have at least 2 options`,
        question_number: questionNumber
      })
    } else {
      // Validate options structure
      q.options.forEach((opt: unknown, i: number) => {
        if (!opt || typeof opt !== 'object' || Array.isArray(opt)) {
          errors.push({
            field: 'questions.options',
            message: `Question ${questionNumber}: Option ${i + 1} must be an object`,
            question_number: questionNumber
          })
        } else {
          const option = opt as Record<string, unknown>
          if (!option.label || !option.text) {
            errors.push({
              field: 'questions.options',
              message: `Question ${questionNumber}: Option ${i + 1} must have 'label' and 'text'`,
              question_number: questionNumber
            })
          }
        }
      })
    }

    // Validate correct_answer matches an option label
    if (q.correct_answer && Array.isArray(q.options)) {
      const validLabels = q.options.map((o: unknown) => (o as Record<string, unknown>).label)
      if (!validLabels.includes(q.correct_answer)) {
        warnings.push({
          field: 'questions.correct_answer',
          message: `Question ${questionNumber}: correct_answer '${q.correct_answer}' doesn't match any option label`,
          question_number: questionNumber
        })
      }
    }
  }

  // Validate image_prompt is string or null
  if (q.image_prompt !== null && q.image_prompt !== undefined && typeof q.image_prompt !== 'string') {
    errors.push({
      field: 'questions.image_prompt',
      message: `Question ${questionNumber}: image_prompt must be a string or null`,
      question_number: questionNumber
    })
  }

  // Warnings for empty content
  if (q.question_text === '') {
    warnings.push({
      field: 'questions.question_text',
      message: `Question ${questionNumber}: question_text is empty`,
      question_number: questionNumber
    })
  }

  if (q.explanation === '') {
    warnings.push({
      field: 'questions.explanation',
      message: `Question ${questionNumber}: explanation is empty`,
      question_number: questionNumber
    })
  }
}

/**
 * Validate educator object (warnings only, not critical)
 */
function validateEducator(
  educator: Record<string, unknown>,
  warnings: ValidationWarning[]
): void {
  if (educator.teacher_name && typeof educator.teacher_name !== 'string') {
    warnings.push({ field: 'educator.teacher_name', message: 'teacher_name should be a string' })
  }
  if (educator.school_name && typeof educator.school_name !== 'string') {
    warnings.push({ field: 'educator.school_name', message: 'school_name should be a string' })
  }
}

/**
 * Create correction prompt based on validation errors
 */
export function createCorrectionPrompt(errors: ValidationError[]): string {
  const errorSummary = errors.map(e => {
    const prefix = e.question_number ? `Question ${e.question_number}` : e.field
    return `- ${prefix}: ${e.message}`
  }).join('\n')

  return `Your previous output was invalid. Please fix these issues:

${errorSummary}

IMPORTANT:
1. Return ONLY valid JSON
2. No markdown formatting
3. No explanation text outside the JSON
4. Ensure all required fields are present
5. questions array length must exactly match total_questions in metadata`
}

/**
 * Validate distribution matches requirements
 */
export function validateDistribution(
  questions: Question[],
  expectedDistribution: Record<string, number>,
  distributionField: 'difficulty' | 'cognitive_level'
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Count actual distribution
  const actual: Record<string, number> = {}
  questions.forEach(q => {
    const value = q[distributionField]
    actual[value] = (actual[value] || 0) + 1
  })

  // Compare with expected
  Object.entries(expectedDistribution).forEach(([key, expected]) => {
    const actualCount = actual[key] || 0
    if (actualCount !== expected) {
      warnings.push({
        field: `questions.${distributionField}`,
        message: `${distributionField} '${key}': expected ${expected}, got ${actualCount}`
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
