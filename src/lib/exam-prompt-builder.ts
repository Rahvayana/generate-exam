// ============================================
// STRUCTURED PROMPT BUILDER
// ============================================

import {
  ExamGenerationRequest,
  DifficultyDistribution,
  CognitiveDistribution,
  EducatorIdentity
} from './exam-schema'

/**
 * Map Indonesian question type to English (for schema)
 */
function mapQuestionTypeToEnglish(type: string): string {
  const typeMap: Record<string, string> = {
    'pilihan ganda': 'multiple_choice',
    'Pilihan Ganda': 'multiple_choice',
    'esai': 'essay',
    'Esai': 'essay',
    'esai/uraian': 'essay',
    'Esai/Uraian': 'essay',
    'isian singkat': 'short_answer',
    'Isian Singkat': 'short_answer',
    'benar/salah': 'true_false',
    'Benar/Salah': 'true_false',
    'menjodohkan': 'matching',
    'Menjodohkan': 'matching',
    'campuran': 'mixed',
    'Campuran': 'mixed',
  }
  return typeMap[type] || type.toLowerCase().replace(/ /g, '_').replace('/', '_')
}

/**
 * Get display question type for prompt
 */
function getQuestionTypeForDisplay(type: string): string {
  const mapped = mapQuestionTypeToEnglish(type)
  const validTypes = ['multiple_choice', 'essay', 'short_answer', 'true_false', 'matching', 'mixed']
  return validTypes.includes(mapped) ? mapped : 'multiple_choice'
}

/**
 * Build the system instruction for JSON generation
 */
export function buildSystemInstruction(): string {
  return `You are an expert educational assessment specialist. Your task is to generate high-quality exam questions in STRICT JSON format.

CRITICAL OUTPUT RULES:
1. Output MUST be valid JSON only
2. NO markdown formatting (no **, no #, no __)
3. NO explanation text outside the JSON
4. NO comments in the JSON
5. Ensure all string fields are properly escaped
6. Return ONLY the JSON object, nothing else

CRITICAL FIELD VALUES:
- question_type MUST be one of: "multiple_choice", "essay", "short_answer", "true_false", "matching", "mixed"
- difficulty MUST be one of: "mudah", "sedang", "sulit" (lowercase, Indonesian)
- cognitive_level MUST be one of: "C1", "C2", "C3", "C4", "C5", "C6"
- options MUST be an array of objects with "label" and "text" properties, e.g., [{"label": "A", "text": "Option text"}, ...]

The JSON structure MUST follow the exact schema provided in the user prompt.`
}

/**
 * Build the main prompt for exam generation
 */
export function buildExamPrompt(request: ExamGenerationRequest): string {
  const {
    metadata,
    educator,
    difficulty_distribution,
    cognitive_distribution,
    include_images,
    special_instructions,
    reference_text
  } = request

  let prompt = `Generate a complete exam question set based on the following specifications.

===========================================
EXAM METADATA
===========================================

Subject: ${metadata.subject}
Topic: ${metadata.topic}
Education Level: ${metadata.education_level}
Class: ${metadata.class_level}
Academic Year: ${metadata.year}
Total Questions: ${metadata.total_questions}
Question Type: ${metadata.question_type}
${metadata.curriculum ? `Curriculum: ${metadata.curriculum}` : ''}

===========================================
EDUCATOR IDENTITY
===========================================

${educator ? formatEducatorIdentity(educator) : '(No educator information provided)'}

===========================================
DIFFICULTY DISTRIBUTION
===========================================

${formatDistribution(difficulty_distribution as unknown as Record<string, number>, 'difficulty')}

${
  cognitive_distribution && Object.keys(cognitive_distribution).length > 0
    ? `===========================================
COGNITIVE LEVEL DISTRIBUTION (Bloom's Taxonomy)
===========================================

${formatDistribution(cognitive_distribution as unknown as Record<string, number>, 'cognitive')}

`
    : ''
}===========================================
OUTPUT REQUIREMENTS
===========================================

1. Generate EXACTLY ${metadata.total_questions} questions
2. Follow the difficulty distribution specified above
${cognitive_distribution && Object.keys(cognitive_distribution).length > 0
  ? `3. Follow the cognitive level distribution specified above`
  : `3. Vary cognitive levels appropriately`
}
4. Each question must include:
   - Unique sequential number (1-${metadata.total_questions})
   - Type: ${metadata.question_type}
   - Difficulty level (mudah/sedang/sulit)
   - Cognitive level (C1-C6)
   - Question text (clear and age-appropriate)
   - Options for multiple choice (A, B, C, D)
   - Correct answer (letter for MC, text for others)
   - Explanation (why the answer is correct)
   - Indicator (specific learning outcome being assessed)
   - Material (sub-topic within the main topic)

5. CRITICAL: Questions MUST be arranged by difficulty:
   - Questions 1-${Math.floor(metadata.total_questions * 0.3)}: MUDAH (easy)
   - Questions ${Math.floor(metadata.total_questions * 0.3) + 1}-${Math.floor(metadata.total_questions * 0.8)}: SEDANG (medium)
   - Questions ${Math.floor(metadata.total_questions * 0.8) + 1}-${metadata.total_questions}: SULIT (hard)

   DO NOT shuffle the difficulty. Arrange from easiest to hardest!

${include_images ? `===========================================
IMAGE REQUIREMENTS
===========================================

Include images for ${Math.max(2, Math.floor(metadata.total_questions * 0.2))} questions.
When an image is needed:
- Set image_prompt to a detailed English description
- Make questions that require visual observation
- Example: "A detailed illustration of photosynthesis process showing sunlight, chloroplasts, and glucose production"

When NO image is needed:
- Set image_prompt to null
- Do not include empty strings` : `===========================================
IMAGE REQUIREMENTS
===========================================

NO IMAGES NEEDED.
- Set all image_prompt fields to null
- Do not include any visual references in questions`}

${
  reference_text ? `===========================================
REFERENCE TEXT
===========================================

${reference_text}

Use this reference text as the basis for generating questions.

` : ''
}
===========================================
${special_instructions ? 'SPECIAL INSTRUCTIONS' : 'ADDITIONAL GUIDELINES'}
===========================================

${special_instructions || '- Use formal academic Indonesian language\\n- Questions should be clear and unambiguous\\n- Avoid trick questions\\n- Ensure options are plausible but clearly distinguishable for multiple choice'}

===========================================
REQUIRED JSON STRUCTURE
===========================================

IMPORTANT - Use these EXACT values for fields:
- question_type: "${getQuestionTypeForDisplay(metadata.question_type)}"
- difficulty: "mudah" or "sedang" or "sulit" (lowercase)
- type (in questions): "${getQuestionTypeForDisplay(metadata.question_type)}"
- options: MUST be array of objects like [{"label":"A","text":"..."},{"label":"B","text":"..."},...]

Return a JSON object with this exact structure:

{
  "metadata": {
    "subject": "${metadata.subject}",
    "topic": "${metadata.topic}",
    "class_level": "${metadata.class_level}",
    "education_level": "${metadata.education_level}",
    "year": "${metadata.year}",
    "total_questions": ${metadata.total_questions},
    "question_type": "${getQuestionTypeForDisplay(metadata.question_type)}",
    "curriculum": ${metadata.curriculum ? `"${metadata.curriculum}"` : 'null'}
  },
  "educator": {
    "teacher_name": ${educator?.teacher_name ? `"${educator.teacher_name}"` : 'null'},
    "teacher_nip": ${educator?.teacher_nip ? `"${educator.teacher_nip}"` : 'null'},
    "school_name": ${educator?.school_name ? `"${educator.school_name}"` : 'null'},
    "principal_name": ${educator?.principal_name ? `"${educator.principal_name}"` : 'null'},
    "principal_nip": ${educator?.principal_nip ? `"${educator.principal_nip}"` : 'null'}
  },
  "questions": [
    {
      "number": 1,
      "type": "${getQuestionTypeForDisplay(metadata.question_type)}",
      "difficulty": "mudah",
      "cognitive_level": "C2",
      "question_text": "Your clear question text here",
      "image_prompt": ${include_images ? '"Detailed description in English"' : 'null'},
      ${getQuestionTypeForDisplay(metadata.question_type) === 'multiple_choice' ? `"options": [
        {"label": "A", "text": "First option"},
        {"label": "B", "text": "Second option"},
        {"label": "C", "text": "Third option"},
        {"label": "D", "text": "Fourth option"}
      ],` : ''}
      "correct_answer": ${getQuestionTypeForDisplay(metadata.question_type) === 'multiple_choice' ? '"B"' : '"Answer text"'},
      "explanation": "Detailed explanation of why this is the correct answer",
      "indicator": "Specific learning outcome being assessed",
      "material": "Sub-topic within ${metadata.topic}"
    }
    // ... repeat for ${metadata.total_questions} questions
  ]
}

REMEMBER:
1. Return ONLY the JSON. No markdown, no explanations, no extra text.
2. question_type MUST be: "multiple_choice", "essay", "short_answer", "true_false", "matching", or "mixed"
3. options MUST be array of objects with "label" and "text" properties
4. difficulty MUST be lowercase: "mudah", "sedang", or "sulit"`

  return prompt
}

/**
 * Format educator identity for prompt
 */
function formatEducatorIdentity(educator: EducatorIdentity): string {
  const parts: string[] = []

  if (educator.teacher_name) parts.push(`Teacher Name: ${educator.teacher_name}`)
  if (educator.teacher_nip) parts.push(`Teacher NIP: ${educator.teacher_nip}`)
  if (educator.school_name) parts.push(`School Name: ${educator.school_name}`)
  if (educator.principal_name) parts.push(`Principal Name: ${educator.principal_name}`)
  if (educator.principal_nip) parts.push(`Principal NIP: ${educator.principal_nip}`)

  return parts.length > 0 ? parts.join('\n') : 'No educator information provided'
}

/**
 * Format distribution for prompt
 */
function formatDistribution(
  distribution: Record<string, number>,
  type: 'difficulty' | 'cognitive'
): string {
  const entries = Object.entries(distribution).filter(([_, count]) => count > 0)

  if (entries.length === 0) return 'No specific distribution required'

  const labels = entries.map(([key, count]) => `${key.toUpperCase()}: ${count} questions`)
  return labels.join(' | ')
}

/**
 * Build a retry prompt with error correction
 */
export function buildRetryPrompt(
  originalRequest: ExamGenerationRequest,
  errors: string[]
): string {
  const errorList = errors.map((e, i) => `${i + 1}. ${e}`).join('\n')

  return `Your previous output was INVALID. Please regenerate with these corrections:

===========================================
ERRORS TO FIX:
===========================================

${errorList}

===========================================
CORRECTION INSTRUCTIONS:
===========================================

CRITICAL - Use these EXACT values:
- question_type MUST be: "multiple_choice", "essay", "short_answer", "true_false", "matching", or "mixed"
- difficulty MUST be lowercase: "mudah", "sedang", or "sulit"
- options MUST be array of objects like [{"label":"A","text":"..."},{"label":"B","text":"..."},...]

1. Ensure the response is VALID JSON only
2. questions array must contain EXACTLY ${originalRequest.metadata.total_questions} items
3. Each question must have ALL required fields
4. image_prompt must be either a string (English description) or null
5. Options array is required for multiple_choice questions
6. No markdown formatting, no comments, no extra text

Follow the original prompt instructions exactly to generate valid JSON.`
}

/**
 * Build prompt for image generation
 */
export function buildImagePrompt(
  questionNumber: number,
  questionText: string,
  imageDescription: string,
  subject: string
): string {
  return `Educational worksheet illustration for ${subject} class.

Question context: ${questionText.substring(0, 200)}...

Image description: ${imageDescription}

Style: Flat vector illustration, simple, clean, white background, child-friendly, educational.`
}
