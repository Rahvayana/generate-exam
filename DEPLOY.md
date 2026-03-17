# Deployment Guide - AI Module Generator

This guide covers deploying the **AI Module Generator** - a Next.js application with MySQL database, NextAuth authentication, and Google Gemini AI integration.

---

## Quick Start (5 Minutes)

For local development, run these commands:

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (if not exists)
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Setup database tables
npx prisma generate
npx prisma db push

# 4. Run development server
npm run dev
```

Open http://localhost:3000

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Platform-Specific Guides](#platform-specific-guides)
6. [Post-Deployment Steps](#post-deployment-steps)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.17+ | Runtime |
| npm | 9.0+ | Package manager |
| MySQL | 8.0+ | Database |

### Required Accounts

- **Google Cloud** - For Gemini AI API key
- **Git Provider** - GitHub, GitLab, or Bitbucket
- **Hosting Account** - Vercel, Railway, DigitalOcean, etc.

---

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# ============================================
# DATABASE
# ============================================
# MySQL connection string
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:password@localhost:3306/ai_module_generator"

# ============================================
# NEXTAUTH
# ============================================
# Secret key for JWT encryption (generate a random string)
NEXTAUTH_SECRET="your-random-secret-key-min-32-chars"

# Base URL of your application (update for production)
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# GOOGLE GEMINI AI (Optional - for users without their own key)
# ============================================
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key"
```

### Generate NEXTAUTH_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
-join (((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ }))
```

---

## Database Setup

### First Time Setup (Fresh Installation)

⚠️ **Run these commands in order** to create tables and set up the database:

```bash
# 1. Install dependencies first
npm install

# 2. Generate Prisma Client (creates JS client from schema)
npx prisma generate

# 3. Create/Update database tables (pushes schema to MySQL)
npx prisma db push

# 4. Seed database (optional - adds initial data)
npx prisma db seed
```

**What each command does:**

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Generates Prisma Client from `prisma/schema.prisma` |
| `npx prisma db push` | Creates tables in MySQL based on schema |
| `npx prisma db seed` | Runs `prisma/seed.ts` to populate initial data |

### Manual Database Creation (Optional)

If you prefer to create the database manually first:

```sql
CREATE DATABASE ai_module_generator
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Then update your `.env` DATABASE_URL and run `npx prisma db push`.

### Production Migration

For production deployments with migrations:

```bash
# Instead of db push, use migrate deploy
npx prisma migrate deploy
```

### Database Schema

The application uses the following models:

- **User** - Authentication, roles (admin/user), status (pending/approved/rejected)
- **EngagementBanner** - Admin banners for user dashboard
- **BannerDismiss** - Track banner dismissals

---

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Pros:** Zero config, automatic deployments, built-in CDN
**Cons:** Limited to serverless functions, database connection limits

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to: Project Settings > Environment Variables
   - Add all variables from [Environment Variables](#environment-variables)
   - Set `NEXTAUTH_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`)

5. **Deploy Database Separately**
   - Use **PlanetScale**, **Railway**, or **Neon** for MySQL
   - Update `DATABASE_URL` with the hosted database URL

---

### Option 2: Railway (Full-Stack)

**Pros:** Database + app in one place, simple pricing
**Cons:** Less control over infrastructure

#### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)

2. **New Project**
   - Click "New Project" > "Deploy from GitHub repo"

3. **Add MySQL Database**
   - Click "New Service" > Select "MySQL"
   - Railway will provide `DATABASE_URL`

4. **Add Environment Variables**
   - Go to Project Settings > Variables
   - Add `NEXTAUTH_SECRET` and `GEMINI_API_KEY`

5. **Deploy**
   - Railway auto-deploys on git push

---

### Option 3: DigitalOcean / VPS

**Pros:** Full control, predictable pricing
**Cons:** Manual setup required

#### Steps:

1. **Provision VPS**
   - Ubuntu 20.04+ with at least 1GB RAM
   - Or use DigitalOcean App Platform

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 20.x
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MySQL
   sudo apt install -y mysql-server
   sudo mysql_secure_installation
   ```

3. **Setup Database**
   ```bash
   sudo mysql -u root -p
   ```
   ```sql
   CREATE USER 'nextjs'@'localhost' IDENTIFIED BY 'secure_password';
   CREATE DATABASE ai_module_generator;
   GRANT ALL PRIVILEGES ON ai_module_generator.* TO 'nextjs'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Clone & Build**
   ```bash
   cd /var/www
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO

   # Install dependencies
   npm ci

   # Build application
   npm run build

   # Setup database
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Use PM2 for Process Management**
   ```bash
   # Install PM2 globally
   sudo npm i -g pm2

   # Start app
   NODE_ENV=production pm2 start npm --name "ai-module-gen" -- start

   # Save PM2 config
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install -y nginx

   # Edit config
   sudo nano /etc/nginx/sites-available/ai-module-gen
   ```
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   ```bash
   sudo ln -s /etc/nginx/sites-available/ai-module-gen /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **SSL with Certbot**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 4: Docker (Containerized)

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Update `next.config.ts` for standalone output:

```typescript
const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone', // Add this
};
```

Build and run:

```bash
# Build image
docker build -t ai-module-generator .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://..." \
  ai-module-generator
```

---

## Platform-Specific Guides

### Google Gemini AI Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Set as `GEMINI_API_KEY` environment variable

2. **For Production**
   - Enable billing for higher quotas
   - Set up usage alerts in Google Cloud Console

### Default Admin User

After seeding the database, create an admin user:

```sql
INSERT INTO User (id, name, email, password, role, status)
VALUES (
  UUID(),
  'Admin',
  'admin@yourdomain.com',
  -- Hash this password first!
  '$2a$10$abcdefghijklmnopqrstuvwxyz...',
  'admin',
  'approved'
);
```

Or register through the app and manually update:

```sql
UPDATE User SET role = 'admin', status = 'approved'
WHERE email = 'your-email@example.com';
```

---

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Check health
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/auth/csrf
```

### 2. Create First Admin User

1. Navigate to `/register`
2. Create an account
3. Manually approve and set to admin in database
4. Or run: `npx prisma db seed`

### 3. Configure Engagement Banners (Optional)

Use the admin panel at `/admin/banner` to create user-facing banners.

### 4. Test Key Features

- [ ] User registration and login
- [ ] Admin panel access
- [ ] AI generation tools (LKPD, RPP, Materi, etc.)
- [ ] DOCX export with images
- [ ] User approval workflow

---

## Monitoring & Maintenance

### Logs

```bash
# Vercel
vercel logs

# Railway
# View in dashboard

# PM2
pm2 logs ai-module-gen

# Docker
docker logs -f container-id
```

### Database Backups

```bash
# Manual backup
mysqldump -u USER -p ai_module_generator > backup_$(date +%Y%m%d).sql

# Restore
mysql -u USER -p ai_module_generator < backup_20250101.sql
```

### Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Run migrations
npx prisma migrate deploy

# Restart application
pm2 restart ai-module-gen
# or
vercel --prod
```

---

## Troubleshooting

### Issue: Database Connection Timeout

**Solution:**
- Check `DATABASE_URL` format
- Ensure database allows external connections
- Verify firewall settings

### Issue: NextAuth Callback Errors

**Solution:**
- Set `NEXTAUTH_URL` to your production domain
- Ensure HTTPS in production (NextAuth requires it)

### Issue: DOCX Export Fails

**Solution:**
- Verify images are accessible (no broken URLs)
- Check base64 image formats
- Ensure sufficient memory for large documents

### Issue: AI Generation Fails

**Solution:**
- Verify `GEMINI_API_KEY` is valid
- Check API quota limits
- Ensure users can input their own API key

---

## Security Checklist

- [ ] Change `NEXTAUTH_SECRET` from default
- [ ] Use strong database passwords
- [ ] Enable HTTPS (SSL certificate)
- [ ] Restrict database to specific IPs
- [ ] Set up rate limiting on API routes
- [ ] Regular security updates (`npm audit fix`)
- [ ] Enable CORS for specific domains only
- [ ] Set up monitoring for suspicious activity

---

## Cost Estimates

| Platform | Monthly Cost (Approx) |
|----------|----------------------|
| **Vercel + PlanetScale** | Free - $20 |
| **Railway** | $5 - $20 |
| **DigitalOcean VPS** | $6 - $12 |
| **AWS Lightsail** | $3.50 - $5 |
| **Self-hosted** | Server cost only |

---

## Support

For issues or questions:
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
- Review Next.js docs: https://nextjs.org/docs
- Review Prisma docs: https://www.prisma.io/docs
