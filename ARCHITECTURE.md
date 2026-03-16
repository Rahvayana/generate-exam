# ASISTEN GURU AI - Architecture Documentation

## Overview

ASISTEN GURU AI is a Next.js 15 application that provides AI-powered tools for Indonesian teachers to generate educational materials including RPP (lesson plans), LKPD (worksheets), exam questions, and more.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + MySQL
- **Authentication**: NextAuth.js
- **AI**: Google Gemini API
- **Document Export**: docx library for Word document generation

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/              # AI generation endpoints
│   │   │   ├── generate     # Generic AI generation
│   │   │   └── generate-exam # Exam/question generation
│   │   ├── auth/            # NextAuth configuration
│   │   ├── admin/           # Admin endpoints
│   │   └── user/            # User profile endpoints
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── tools/               # AI tool pages
│   │   ├── buat-soal/       # Exam generator
│   │   ├── rpp/             # RPP/Modul Ajar generator
│   │   ├── lkpd/            # LKPD generator
│   │   ├── materi/          # Material summarizer
│   │   ├── presentasi/      # Presentation outline generator
│   │   ├── rubrik/          # Rubric generator
│   │   ├── icebreak/        # Ice breaking activities
│   │   └── refleksi/        # Teaching reflection
│   └── layout.tsx           # Root layout
├── lib/
│   ├── exam-schema.ts       # Exam data types and schemas
│   ├── exam-docx-export.ts  # Exam DOCX export with image support
│   ├── tools-schema.ts      # Tools data types and schemas
│   ├── tools-prompt-builder.ts  # AI prompt builders
│   └── tools-docx-export.ts # Tools DOCX export with image support
├── components/
│   └── ui/                  # Reusable UI components
└── middleware.ts            # Auth middleware
```

## Core Features

### 1. AI Tools

Each tool follows a consistent pattern:
1. **Form Input** - User fills out structured form
2. **Prompt Building** - Form data converted to AI prompt
3. **AI Generation** - Gemini API generates content
4. **Preview** - Generated content displayed
5. **Export** - Download as DOCX with proper formatting

#### Supported Tools

| Tool | Path | Description |
|------|------|-------------|
| RPP/Modul Ajar | `/tools/rpp` | Generate lesson plans for Merdeka, K-13, Kemenag curriculums |
| LKPD | `/tools/lkpd` | Create structured student worksheets |
| Buat Soal | `/tools/buat-soal` | Generate exam questions with images |
| Ringkasan Materi | `/tools/materi` | Summarize teaching materials |
| Presentasi | `/tools/presentasi` | Create presentation outlines |
| Rubrik Penilaian | `/tools/rubrik` | Generate assessment rubrics |
| Ice Breaking | `/tools/icebreak` | Generate classroom activities |
| Refleksi | `/tools/refleksi` | Teaching reflection documentation |

### 2. Curriculum Support

The system supports three curriculum types with normalized handling:

```typescript
type CurriculumType = 'merdeka' | 'k13' | 'kemenag'
```

**Important**: The frontend sends full curriculum names (e.g., "Kurikulum Merdeka") which are normalized in the prompt builder.

### 3. Image Support in DOCX Export

Images are embedded in exported documents using base64 encoding:

```typescript
// Helper to convert data URL to base64
function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(',')[1] || dataUrl
}

// Image paragraph creation
new Paragraph({
  children: [
    new ImageRun({
      data: base64Data,
      transformation: { width: 300, height: 200 },
    } as any),
  ],
})
```

### 4. Form Layout Standard

All tool pages use a 12-column grid layout:
- **Form**: `col-span-12 lg:col-span-5` (40%)
- **Preview**: `col-span-12 lg:col-span-7` (60%)
- Preview is `sticky top-24` for better UX

## Recent Bug Fixes

### Fix #1: RPP Curriculum Always Shows "KBC Kemenag"

**Problem**: RPP documents always showed "KBC Kemenag" regardless of user selection.

**Root Cause**: Frontend sends full curriculum name ("Kurikulum Merdeka", "Kurikulum 2013") but prompt builder was checking for exact match ('merdeka', 'k13').

**Solution**: Added `normalizeKurikulum()` function in `tools-prompt-builder.ts`:

```typescript
const normalizeKurikulum = (k?: string) => {
  if (!k) return 'kemenag'
  const lower = k.toLowerCase()
  if (lower === 'merdeka' || lower.includes('merdeka')) return 'merdeka'
  if (lower === 'k13' || lower.includes('2013')) return 'k13'
  if (lower === 'kemenag' || lower.includes('kbc') || lower.includes('kemenag')) return 'kemenag'
  return 'kemenag'
}
```

**Files Modified**:
- `src/lib/tools-prompt-builder.ts` - Added normalization for RPP and LKPD

### Fix #2: Images Not Appearing in DOCX Export

**Problem**: Generated AI images didn't appear in downloaded DOCX files for LKPD and Buat Soal tools.

**Root Cause**: The `ImageRun` constructor was incorrectly using a `type` property that doesn't exist in the docx library API.

**Solution**:
1. Removed the incorrect `type` property from `ImageRun` initialization
2. Added proper image embedding using base64 data URLs
3. Used `as any` type assertion for TypeScript compatibility

**Files Modified**:
- `src/lib/exam-docx-export.ts` - Added image support for exam export
- `src/lib/tools-docx-export.ts` - Added image support for LKPD export

### Fix #3: Form Layout Issues

**Problem**: Preview cards in some tool pages weren't using proper grid layout.

**Solution**: Updated all tool pages to use consistent `col-span-12 lg:col-span-7` for preview sections.

**Files Modified**:
- `src/app/tools/materi/page.tsx`
- `src/app/tools/presentasi/page.tsx`
- `src/app/tools/rubrik/page.tsx`
- `src/app/tools/icebreak/page.tsx`
- `src/app/tools/refleksi/page.tsx`

## API Endpoints

### AI Generation

**POST** `/api/ai/generate`
- Generates content for RPP, LKPD, Materi, Presentasi, Rubrik, Icebreak, Refleksi
- Body: `{ tool: ToolType, data: Record<string, any> }`

**POST** `/api/ai/generate-exam`
- Generates exam questions with optional image generation
- Body: ExamGenerationRequest
- Returns: ExamGenerationResponse with questions and metadata

### Authentication

**GET** `/api/auth/[...nextauth]` - NextAuth handler
**POST** `/api/auth/test-setup` - Test auth configuration

### User Management

**GET** `/api/user/profile` - Get user profile
**POST** `/api/user/test-apikey` - Test API key

### Admin

**GET** `/api/admin/users/list` - List all users
**POST** `/api/admin/users/[id]/approve` - Approve user
**POST** `/api/admin/users/[id]/reject` - Reject user
**POST** `/api/admin/users/[id]/unapprove` - Unapprove user

## Environment Variables

```env
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Google Gemini
GEMINI_API_KEY=

# Optional: Image Generation
OPENAI_API_KEY=  # For DALL-E image generation
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run TypeScript check
npx tsc --noEmit
```

## Deployment

The application is deployed on Vercel. The production URL is configured in the Vercel dashboard.

## License

Proprietary - All rights reserved
