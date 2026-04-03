# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Generate Prisma client + build Next.js for production
npm run start        # Run production server
npm run lint         # Run ESLint
npx prisma db push   # Push schema changes to database (migrations)
npx prisma generate  # Regenerate Prisma client after schema changes
node seed.js         # Seed DB with default admin user (admin@smartlink.com / admin123)
```

## Architecture

**SmartLink Pilot** is a SaaS URL shortener (Next.js 14 App Router + TypeScript) deployed on Vercel with Supabase (PostgreSQL) as the database.

### Key Technologies
- **Auth**: NextAuth v4 — dual strategy (Google OAuth + email/password credentials), JWT sessions, PrismaAdapter
- **Database**: PostgreSQL via Supabase + Prisma ORM; `DATABASE_URL` uses pgbouncer (pooled), `DIRECT_URL` is the direct connection (required for migrations)
- **Payments**: Stripe subscriptions
- **Mobile**: Capacitor hybrid app (Android AAB builds via GitHub Actions)
- **AI**: OpenAI API for admin blog content writer

### URL Shortening Flow
- Unauthenticated users get a 3-link free tier tracked by `device_id` cookie
- Authenticated users get unlimited links with premium features (custom aliases, password protection, expiration)
- Short codes are 6-char base62 or custom aliases (premium)
- Redirection is handled by `/app/[shortCode]/route.ts` — HTTP 302 with analytics tracking (country, device, browser, referrer)

### Authentication
- `lib/auth.ts` — PrismaAdapter is wrapped to auto-inject `username` and `role` on account creation
- The CEO email (`mclean@smartlinkpilot.com`) is hardcoded to always receive `admin` role
- User roles: `free_user`, `premium_user`, `enterprise_user`, `admin`

### Route Structure
- `/app/api/` — REST API routes (shorten, analytics, admin, auth, stripe webhooks, etc.)
- `/app/[shortCode]/` — Redirect handler (must stay at root to intercept short codes)
- `/app/dashboard/` — Authenticated user link management
- `/app/admin/` — Admin-only (blog, visitor analytics, settings CMS, AI writer)
- `/app/(public)/` — Landing page, blog, pricing, features, about

### Middleware
`middleware.ts` handles rate limiting (30 req/min per IP), auth redirects, and security headers. Rate limiting runs before auth checks.

### Database Schema Highlights
- `Url`: shortCode (unique), originalUrl, userId (nullable for anon), deviceId, password, expiresAt
- `Click`: per-redirect analytics tied to `urlId`
- `VisitorSession` + `PageView`: anonymous visitor tracking for admin analytics
- `BlogPost`: admin-managed blog with HTML/Markdown content, optional YouTube embed
- `SiteSetting` / `PageContent` / `AppConfig`: CMS-style key-value tables for admin-configurable content

### Environment Variables
See `.env.example`. Required: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY`.
