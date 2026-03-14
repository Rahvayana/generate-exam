# AI Module Generator - Architecture Documentation

---

## 1. PROJECT STACK

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Prisma ORM** | 6.19.2 | Database ORM |
| **Database** | MySQL | Data persistence |
| **Authentication** | NextAuth.js 4.24.13 | Session management |
| **Password Hashing** | bcryptjs 3.0.3 | Security |
| **Styling** | Tailwind CSS 4.2.1 | Utility-first CSS |
| **AI Service** | Google Generative AI | Gemini 2.5 Flash, Imagen 4.0 |
| **Document Export** | docx 9.6.1 | DOCX file generation |
| **Testing** | Cypress 15.12.0 | E2E testing |
| **Testing Library** | @testing-library/cypress 10.1.0 | DOM testing utilities |
| **Icons** | @heroicons/react 2.2.0 | UI icons |

---

## 2. PROJECT STRUCTURE

```
generate-exam/
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   └── seed.ts                    # Initial admin seed script
│
├── public/                         # Static assets
│
├── src/
│   ├── app/
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts   # NextAuth configuration
│   │   │   │   └── test-setup/
│   │   │   │       └── route.ts   # Test helper endpoint
│   │   │   ├── ai/
│   │   │   │   ├── generate/
│   │   │   │   │   └── route.ts   # Main AI generation endpoint
│   │   │   │   └── generate-exam/
│   │   │   │       └── route.ts   # Exam generation endpoint
│   │   │   ├── admin/
│   │   │   │   ├── users/
│   │   │   │   │   ├── list/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── update/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── approve/
│   │   │   │   │       │   └── route.ts
│   │   │   │   │       ├── reject/
│   │   │   │   │       │   └── route.ts
│   │   │   │   │       └── unapprove/
│   │   │   │   │           └── route.ts
│   │   │   │   └── engagement/
│   │   │   │       ├── list/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── create/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── update/
│   │   │   │       │   └── route.ts
│   │   │   │       └── delete/
│   │   │   │           └── route.ts
│   │   │   ├── banner/
│   │   │   │   ├── active/
│   │   │   │   │   └── route.ts   # Get active banners
│   │   │   │   └── dismiss/
│   │   │   │       └── route.ts   # Dismiss banner tracking
│   │   │   └── user/
│   │   │       ├── profile/
│   │   │       │   └── route.ts   # Get/update user profile
│   │   │       └── test-apikey/
│   │   │           └── route.ts   # Validate API key
│   │   │
│   │   ├── admin/
│   │   │   └── dashboard/
│   │   │       └── page.tsx       # Admin dashboard UI
│   │   │
│   │   ├── tools/                 # AI Tool Pages
│   │   │   ├── rpp/
│   │   │   │   └── page.tsx       # RPP/Modul Ajar Generator
│   │   │   ├── buat-soal/
│   │   │   │   └── page.tsx       # Question Generator
│   │   │   ├── lkpd/
│   │   │   │   └── page.tsx       # Student Worksheet Generator
│   │   │   ├── materi/
│   │   │   │   └── page.tsx       # Teaching Material Summarizer
│   │   │   ├── presentasi/
│   │   │   │   └── page.tsx       # Presentation Outline Generator
│   │   │   ├── rubrik/
│   │   │   │   └── page.tsx       # Assessment Rubric Generator
│   │   │   ├── icebreak/
│   │   │   │   └── page.tsx       # Icebreaker Activity Generator
│   │   │   └── refleksi/
│   │   │       └── page.tsx       # Reflection Activity Generator
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── register/
│   │   │   └── page.tsx           # Registration page
│   │   ├── profile/
│   │   │   └── page.tsx           # User profile page
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── page.tsx               # Main dashboard/home
│   │   └── globals.css            # Global styles
│   │
│   ├── components/
│   │   ├── Providers.tsx          # SessionProvider wrapper
│   │   ├── EngagementBanner.tsx   # Dynamic banner component
│   │   ├── exam-renderer.tsx      # Exam content display
│   │   └── tool-preview-tabs.tsx  # Tabbed preview component
│   │
│   └── lib/
│       ├── auth.ts                # NextAuth configuration
│       ├── prompt-injection-defense.ts  # Security against prompt injection
│       ├── tools-schema.ts        # TypeScript interfaces for tools
│       ├── tools-prompt-builder.ts # Tool-specific prompts
│       ├── tools-validator.ts     # Response validation
│       ├── tools-docx-export.ts   # DOCX export utilities
│       ├── exam-schema.ts         # Exam-specific schema
│       ├── exam-prompt-builder.ts # Exam prompt generation
│       ├── exam-validator.ts      # Exam validation
│       ├── exam-docx-export.ts    # Exam export utilities
│       └── exam-retry.ts          # Exam retry logic
│
├── cypress/                       # E2E Testing
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.cy.ts        # Login tests
│   │   │   └── register.cy.ts     # Registration tests
│   │   ├── admin/
│   │   │   ├── user-management.cy.ts   # Admin user tests
│   │   │   └── engagement-banners.cy.ts # Banner tests
│   │   ├── ai/
│   │   │   └── api-tests.cy.ts    # API endpoint tests
│   │   └── tools/
│   │       ├── rpp.cy.ts          # RPP tool tests
│   │       ├── buat-soal.cy.ts    # Question generator tests
│   │       ├── lkpd.cy.ts         # LKPD tool tests
│   │       └── other-tools.cy.ts  # Other tools tests
│   ├── support/
│   │   ├── commands.ts            # Custom Cypress commands
│   │   └── e2e.ts                 # E2E support file
│   └── fixtures/
│       └── test-data.json         # Test data fixtures
│
├── cypress.config.ts              # Cypress configuration
├── middleware.ts                  # Route protection middleware
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

---

## 3. AUTHENTICATION SYSTEM

### Configuration: `src/lib/auth.ts`

**Provider:** Credentials (email/password)

**Session Strategy:** JWT (stateless)

**Password Hashing:** bcryptjs (10 rounds)

### User Status Flow

| Status | Meaning | Can Login? |
|--------|---------|------------|
| `pending` | New user, awaiting admin approval | No |
| `approved` | Approved by admin | Yes |
| `rejected` | Registration denied | No |
| `unapproved` | Disabled by admin | No |

### Login Flow

1. User submits email/password via `/login`
2. NextAuth `authorize` function validates credentials
3. Password compared with bcrypt hash
4. Status check performed:
   - `pending` → "Your account is waiting for admin approval."
   - `rejected` → "Your registration was rejected."
   - `unapproved` → "Your account has been disabled by admin."
   - `approved` → Session created, redirect to dashboard
5. JWT token contains: `id`, `name`, `email`, `role`, `status`

### Session Extensions

```typescript
interface SessionUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'pending' | 'approved' | 'rejected' | 'unapproved'
}
```

---

## 4. DATABASE ARCHITECTURE

### Prisma Schema: `prisma/schema.prisma`

#### User Model

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String                   // Bcrypt hashed
  role      Role     @default(user)
  status    Status   @default(pending)
  apiKey    String?                  // User's Gemini API key
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  bannerDismisses BannerDismiss[]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | User's full name |
| email | String | Unique identifier |
| password | String | Bcrypt hashed password |
| role | Enum | `admin` or `user` |
| status | Enum | `pending`, `approved`, `rejected`, `unapproved` |
| apiKey | String? | User's personal Gemini API key |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### EngagementBanner Model

```prisma
model EngagementBanner {
  id                  String   @id @default(uuid())
  title               String
  message             String
  buttonText          String
  buttonUrl           String
  showOnUserDashboard Boolean  @default(true)
  allowDismiss        Boolean  @default(true)
  active              Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  dismisses BannerDismiss[]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| title | String | Banner heading |
| message | String | Banner body text |
| buttonText | String | Call-to-action button text |
| buttonUrl | String | Button destination URL |
| showOnUserDashboard | Boolean | Show to regular users |
| allowDismiss | Boolean | Allow users to dismiss |
| active | Boolean | Banner is enabled |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### BannerDismiss Model

```prisma
model BannerDismiss {
  id         String   @id @default(uuid())
  bannerId   String
  userId     String
  dismissedAt DateTime @default(now())

  // Relations
  banner EngagementBanner @relation(fields: [bannerId], references: [id], onDelete: Cascade)
  user   User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([bannerId, userId])
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| bannerId | String | FK to EngagementBanner |
| userId | String | FK to User |
| dismissedAt | DateTime | When user dismissed |

**Relationships:**
- User → BannerDismiss (One-to-Many)
- EngagementBanner → BannerDismiss (One-to-Many)
- Unique constraint on (bannerId, userId) prevents duplicate dismissals

---

## 5. API LAYER

### Authentication Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/[...nextauth]` | NextAuth handler (signin, signout) |
| POST | `/api/auth/test-setup` | Create test users (dev only) |

### AI Generation Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ai/generate` | Unified AI content generation (7 tools) |
| POST | `/api/ai/generate-exam` | Exam/question paper generation |

### Admin Management Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/users/list` | List users with filtering |
| POST | `/api/admin/users/update` | Update user details |
| POST | `/api/admin/users/[id]/approve` | Approve pending user |
| POST | `/api/admin/users/[id]/reject` | Reject user |
| POST | `/api/admin/users/[id]/unapprove` | Unapprove user |
| GET | `/api/admin/engagement/list` | List all banners |
| POST | `/api/admin/engagement/create` | Create new banner |
| POST | `/api/admin/engagement/update` | Update banner |
| POST | `/api/admin/engagement/delete` | Delete banner |

### User Management Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/profile` | Get user profile |
| POST | `/api/user/profile` | Update profile (name, password, apiKey) |
| POST | `/api/user/test-apikey` | Validate API key |

### Banner Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/banner/active` | Get active banners for user |
| POST | `/api/banner/dismiss` | Record banner dismissal |

---

## 6. AI TOOLS SYSTEM

### JSON-Structured Architecture

All AI tools use a consistent JSON-based architecture:

1. **Request Schema** (`tools-schema.ts`) - TypeScript interfaces for each tool
2. **Prompt Builder** (`tools-prompt-builder.ts`) - Tool-specific Indonesian prompts
3. **Response Validator** (`tools-validator.ts`) - Validates AI responses against schema
4. **Retry Logic** - Automatic retry with corrected prompts on validation failure
5. **DOCX Export** (`tools-docx-export.ts`) - Export to Microsoft Word format

### Supported Tools

| Tool | Path | Description |
|------|------|-------------|
| `rpp` | `/tools/rpp` | RPP/Modul Ajar (Lesson Plan) Generator |
| `lkpd` | `/tools/lkpd` | LKPD (Student Worksheet) Generator |
| `materi` | `/tools/materi` | Ringkasan Materi (Teaching Material) Summarizer |
| `presentasi` | `/tools/presentasi` | Kerangka Presentasi (Presentation Outline) |
| `rubrik` | `/tools/rubrik` | Rubrik Penilaian (Assessment Rubric) |
| `icebreak` | `/tools/icebreak` | Ice Breaking Generator |
| `refleksi` | `/tools/refleksi` | Refleksi Mengajar (Teaching Reflection) |
| `buat-soal` | `/tools/buat-soal` | Buat Soal (Question Generator) - uses separate endpoint |

### AI Generation Flow

```
User Input → Tool Schema → Prompt Builder → Gemini API
                                              ↓
                                         JSON Response
                                              ↓
                                         Validator
                                              ↓
                                    ┌─────────┴─────────┐
                               Valid?                  Invalid?
                                ↓                         ↓
                           Display Result          Retry with Correction
                                                        ↓
                                                   Max 3 attempts
```

### API Key Priority

1. **User's personal API key** (stored in `User.apiKey`) - PRIMARY
2. **Environment variable** (`GEMINI_API_KEY`) - FALLBACK

### Models Used

| Purpose | Model |
|---------|-------|
| Text Generation | `gemini-2.5-flash` |
| Image Generation | `imagen-4.0-generate-001` |

---

## 7. EXAM GENERATION SYSTEM

### Separate Architecture (`exam-schema.ts`, `exam-prompt-builder.ts`)

The exam/soal generation uses a specialized system with:

- **Difficulty Distribution**: mudah (easy), sedang (medium), sulit (hard)
- **Cognitive Levels**: C1-C6 (Bloom's Taxonomy)
- **Question Types**: multiple_choice, essay, short_answer, true_false, matching, mixed
- **Image Prompts**: Optional image generation per question
- **Educator Identity**: Teacher name, NIP, school, principal info

### Exam Request Structure

```typescript
interface ExamGenerationRequest {
  metadata: ExamMetadata
  educator?: EducatorIdentity
  difficulty_distribution: DifficultyDistribution
  cognitive_distribution?: CognitiveDistribution
  include_images: boolean
  special_instructions?: string
  reference_text?: string
}
```

### Exam Response Structure

```typescript
interface ExamGenerationResponse {
  metadata: ExamMetadata
  educator?: EducatorIdentity
  questions: Question[]
}
```

### Question Structure

```typescript
interface Question {
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
```

---

## 8. ADMIN SYSTEM

### Dashboard: `/admin/dashboard`

**Features:**
- Two tabs: "Manage Users" and "Engagement Tools"
- User list with filtering by status
- Search by email
- Approve/Reject/Unapprove buttons
- Banner management (CRUD)
- Dismiss tracking for banners

### User Management Actions

| Action | Endpoint | Status Change |
|--------|----------|---------------|
| Approve | `POST /api/admin/users/[id]/approve` | `pending` → `approved` |
| Reject | `POST /api/admin/users/[id]/reject` | Any → `rejected` |
| Unapprove | `POST /api/admin/users/[id]/unapprove` | Any → `unapproved` |

---

## 9. ENGAGEMENT TOOLS (PROMO BANNER SYSTEM)

### Banner Management

**Admin Capabilities:**
- Create banners with title, message, button
- Set destination URL for button
- Toggle active/inactive
- Enable/disable user dashboard display
- Allow/prevent user dismissal
- View dismiss statistics

**User Experience:**
- Banners shown on main dashboard (`/`)
- "Dismiss" button to hide banner
- Dismissal tracked per user (doesn't show again)
- Admins excluded from seeing banners

### Banner Dismiss Flow

```
User logs in → GET /api/banner/active → Filter dismissed banners
                                                ↓
                                        Display on dashboard
                                                ↓
                                     User clicks dismiss
                                                ↓
                          POST /api/banner/dismiss → Record in BannerDismiss
```

---

## 10. SECURITY SYSTEM

### Prompt Injection Defense (`prompt-injection-defense.ts`)

**Protection Measures:**

1. **Pattern Detection** - Detects known injection attempts:
   - Ignore/override instructions
   - Role manipulation ("you are now...")
   - Jailbreak patterns (DAN mode, developer mode)
   - System prompt extraction
   - Special character manipulations

2. **Input Sanitization:**
   - Remove markdown code blocks
   - Remove special character sequences
   - Truncate excessive input (3000 char limit)

3. **Validation:**
   - All tool data validated before AI call
   - Recursive check for nested objects
   - Returns Indonesian error messages

4. **Security Instructions:**
   - Appended to all system prompts
   - Reinforces core purpose
   - Instructions to reject manipulation attempts

### Middleware Protection (`middleware.ts`)

**Protected Routes:**

| Route | Protection |
|-------|------------|
| `/admin/*` | Admin only (`role === 'admin'`) |
| `/` | Approved users only (`status === 'approved'`) |
| `/profile` | Authenticated users only |

**Redirect Logic:**
- Non-admin → `/` when accessing `/admin/*`
- Non-approved → `/login` when accessing protected routes

---

## 11. USER PROFILE SYSTEM

### Profile Page: `/profile`

**Features:**
- View profile info (name, email, role, status)
- Update name
- Change password (with old password verification)
- Add/remove personal Gemini API key
- API key masked (shows only last 6 characters)

### API Key Management

**Storage:** `User.apiKey` field

**Usage Priority:**
1. User's personal key from database
2. Fallback to `GEMINI_API_KEY` environment variable

**Validation:** `/api/user/test-apikey` endpoint validates key before saving

---

## 12. TESTING FRAMEWORK

### Cypress E2E Testing

**Configuration:** `cypress.config.ts`
- Base URL: `http://localhost:3000`
- Browser: Chrome (headless for CI)
- Video recording: Enabled
- Screenshot on failure: Enabled
- Retry on failure: 2 attempts (run mode)

### Test Structure

```
cypress/
├── e2e/
│   ├── auth/
│   │   ├── login.cy.ts           # 14 tests
│   │   └── register.cy.ts        # 13 tests
│   ├── admin/
│   │   ├── user-management.cy.ts # 15 tests
│   │   └── engagement-banners.cy.ts # 15 tests
│   ├── ai/
│   │   └── api-tests.cy.ts       # 18 tests
│   └── tools/
│       ├── rpp.cy.ts             # 23 tests
│       ├── buat-soal.cy.ts       # 3 tests
│       ├── lkpd.cy.ts            # 2 tests
│       └── other-tools.cy.ts     # 10 tests
├── support/
│   ├── commands.ts               # Custom commands
│   └── e2e.ts                    # Global hooks
└── fixtures/
    └── test-data.json            # Sample data
```

### Custom Commands

```typescript
cy.login(email, password)      // Login user
cy.adminLogin()                // Login as admin
cy.registerUser(name, email)   // Register new user
cy.logout()                    // Logout user
cy.fillRPPForm(data)           // Fill RPP form
cy.fillBuatSoalForm(data)      // Fill question form
cy.fillLKPDForm(data)          // Fill LKPD form
cy.waitForGeneration()         // Wait for AI to complete
cy.setupUserWithApiKey()       // Setup test user with API key
```

### Test Coverage

| Area | Tests | Coverage |
|------|-------|----------|
| Authentication | 27 | Login, register, validation, status restrictions, session |
| Admin | 30 | User management, banner management, access control |
| AI Tools | 41 | All 8 tools, form validation, generation, export |
| API | 18 | Endpoints, security, prompt injection, rate limiting |
| **Total** | **113** | **Full E2E coverage** |

---

## 13. ENVIRONMENT VARIABLES

### Required

```env
DATABASE_URL="mysql://root:@localhost:3306/ai_module_generator"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Optional

```env
GEMINI_API_KEY="your-google-ai-api-key-here"  # Fallback API key
```

### NextAuth URL (for production)

```env
NEXTAUTH_URL="https://your-domain.com"
```

---

## 14. DEPLOYMENT

### Build Commands

```bash
npm run build       # Production build
npm run start       # Start production server
```

### Database Setup

```bash
npx prisma generate    # Generate Prisma Client
npx prisma db push      # Push schema to database
npx prisma db seed      # Seed initial admin
```

### Testing

```bash
npm run cy:run      # Run all Cypress tests
npm run test:e2e    # Run tests in Chrome
```

### Production Considerations

1. Set `NODE_ENV=production`
2. Configure `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
3. Use production database URL
4. Disable `/api/auth/test-setup` endpoint in production
5. Configure CORS if needed
6. Set up proper logging and monitoring

---

## 15. LICENSE

This project is proprietary software. All rights reserved.
