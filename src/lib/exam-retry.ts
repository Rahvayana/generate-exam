// ============================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ============================================

import { ExamGenerationResponse, ExamGenerationRequest } from './exam-schema'
import { ValidationResult, validateExamResponse, createCorrectionPrompt } from './exam-validator'
import { buildRetryPrompt } from './exam-prompt-builder'

export interface RetryConfig {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

export interface GenerationResult {
  success: boolean
  data?: ExamGenerationResponse
  validation?: ValidationResult
  attempts: number
  errors: string[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1)
  return Math.min(delay, config.maxDelayMs)
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Normalize AI response to fix common mistakes
 */
function normalizeResponse(data: any): any {
  if (!data || typeof data !== 'object') return data

  // Deep clone to avoid mutating original
  const normalized = JSON.parse(JSON.stringify(data))

  // Fix question_type - map Indonesian to English
  const questionTypeMap: Record<string, string> = {
    'pilihan ganda': 'multiple_choice',
    'Pilihan Ganda': 'multiple_choice',
    'PILIHAN GANDA': 'multiple_choice',
    'esai': 'essay',
    'Esai': 'essay',
    'ESAI': 'essay',
    'esai/uraian': 'essay',
    'Esai/Uraian': 'essay',
    'isian singkat': 'short_answer',
    'Isian Singkat': 'short_answer',
    'ISIAN SINGKAT': 'short_answer',
    'benar/salah': 'true_false',
    'Benar/Salah': 'true_false',
    'BENAR/SALAH': 'true_false',
    'menjodohkan': 'matching',
    'Menjodohkan': 'matching',
    'MENJODOHKAN': 'matching',
    'campuran': 'mixed',
    'Campuran': 'mixed',
    'CAMPURAN': 'mixed',
  }

  if (normalized.metadata?.question_type) {
    const mapped = questionTypeMap[normalized.metadata.question_type]
    if (mapped) normalized.metadata.question_type = mapped
  }

  // Fix questions array
  if (Array.isArray(normalized.questions)) {
    normalized.questions.forEach((q: any) => {
      // Fix question_type at question level
      if (q.type) {
        const mapped = questionTypeMap[q.type]
        if (mapped) q.type = mapped
      }

      // Fix difficulty - normalize to lowercase
      if (q.difficulty) {
        const diffMap: Record<string, string> = {
          'Mudah': 'mudah',
          'MUDAH': 'mudah',
          'Sedang': 'sedang',
          'SEDANG': 'sedang',
          'Sulit': 'sulit',
          'SULIT': 'sulit',
          'Easy': 'mudah',
          'Medium': 'sedang',
          'Hard': 'sulit',
        }
        const mapped = diffMap[q.difficulty]
        if (mapped) q.difficulty = mapped
      }

      // Fix options - if they're strings, convert to objects
      if (Array.isArray(q.options)) {
        q.options = q.options.map((opt: any, idx: number) => {
          if (typeof opt === 'string') {
            // Try to parse if it looks like JSON
            if (opt.startsWith('{') && opt.endsWith('}')) {
              try {
                return JSON.parse(opt)
              } catch {
                // If parsing fails, create object from string
                const label = String.fromCharCode(65 + idx) // A, B, C, D...
                return { label, text: opt }
              }
            }
            // If it's a simple string like "A. Option text", try to extract
            const match = opt.match(/^([A-D])\.\s*(.+)$/)
            if (match) {
              return { label: match[1], text: match[2] }
            }
            // Default: create label from index
            const label = String.fromCharCode(65 + idx)
            return { label, text: opt }
          }
          // If already an object, ensure it has label and text
          if (typeof opt === 'object' && opt !== null) {
            if (!opt.label && opt.text) {
              // Missing label, generate from index
              const idxInArray = q.options.indexOf(opt)
              opt.label = String.fromCharCode(65 + idxInArray)
            }
            return opt
          }
          return opt
        })
      }
    })
  }

  return normalized
}

/**
 * Parse JSON safely
 */
function safeParseJSON(text: string): { success: boolean; data?: unknown; error?: string } {
  try {
    // Clean common issues
    let cleaned = text.trim()

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```json\s*/i, '')
    cleaned = cleaned.replace(/^```\s*/, '')
    cleaned = cleaned.replace(/```\s*$/, '')

    // Remove any leading/trailing non-JSON
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
    }

    const parsed = JSON.parse(cleaned)

    // Normalize the response to fix common AI mistakes
    const normalized = normalizeResponse(parsed)

    return { success: true, data: normalized }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    }
  }
}

/**
 * Extract JSON from AI response that might have extra text
 */
function extractJSON(text: string): string {
  let cleaned = text.trim()

  // Try to find JSON object boundaries
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1)
  }

  return cleaned
}

/**
 * Generate exam with retry logic
 */
export async function generateExamWithRetry(
  request: ExamGenerationRequest,
  generateFn: (prompt: string, systemInstruction: string) => Promise<string>,
  config: Partial<RetryConfig> = {}
): Promise<GenerationResult> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  const errors: string[] = []
  let lastValidation: ValidationResult | undefined

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      // Build prompt (use retry prompt if not first attempt)
      let prompt: string
      let systemInstruction = 'You are an expert educational assessment specialist. Return valid JSON only.'

      if (attempt === 1) {
        // First attempt - use the main prompt builder (imported)
        const { buildExamPrompt, buildSystemInstruction } = await import('./exam-prompt-builder')
        prompt = buildExamPrompt(request)
        systemInstruction = buildSystemInstruction()
      } else {
        // Retry attempt - use correction prompt
        const errorMessages = lastValidation?.errors.map(e => e.message) || errors
        prompt = buildRetryPrompt(request, errorMessages)
      }

      // Call generation function
      const rawResponse = await generateFn(prompt, systemInstruction)

      // Extract and parse JSON
      const jsonText = extractJSON(rawResponse)
      const parseResult = safeParseJSON(jsonText)

      if (!parseResult.success) {
        errors.push(`Parse failed: ${parseResult.error}`)
        if (attempt < finalConfig.maxAttempts) {
          await sleep(calculateDelay(attempt, finalConfig))
          continue
        }
        break
      }

      // Validate the response
      const validation = validateExamResponse(parseResult.data, request)
      lastValidation = validation

      if (validation.valid) {
        return {
          success: true,
          data: parseResult.data as ExamGenerationResponse,
          validation,
          attempts: attempt,
          errors: []
        }
      }

      // Collect validation errors
      validation.errors.forEach(e => errors.push(`${e.field}: ${e.message}`))

      // If not last attempt, retry
      if (attempt < finalConfig.maxAttempts) {
        await sleep(calculateDelay(attempt, finalConfig))
        continue
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Attempt ${attempt}: ${errorMsg}`)

      if (attempt < finalConfig.maxAttempts) {
        await sleep(calculateDelay(attempt, finalConfig))
      }
    }
  }

  // All attempts failed
  return {
    success: false,
    validation: lastValidation,
    attempts: finalConfig.maxAttempts,
    errors
  }
}

/**
 * Simple retry wrapper for any async function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<{ success: boolean; data?: T; error?: string; attempts: number }> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const data = await fn()
      return { success: true, data, attempts: attempt }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'

      if (attempt < finalConfig.maxAttempts) {
        await sleep(calculateDelay(attempt, finalConfig))
      } else {
        return { success: false, error: errorMsg, attempts: attempt }
      }
    }
  }

  return { success: false, error: 'Max retries exceeded', attempts: finalConfig.maxAttempts }
}
