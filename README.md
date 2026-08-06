# Mnar Photofilm Sessions — Photographer Booking Website

A bilingual (Arabic-first, RTL) photographer booking and schedule management web app built with **Next.js 16**, **Tailwind CSS**, **Framer Motion**, and **Supabase**.

## Features

- 🗓️ **Public schedule page** — calendar view + timeline list view with staggered animations
- 🔒 **Admin panel** — full CRUD session management, bulk CSV/JSON import
- 🌙 **Premium dark UI** — gold accent design system, glassmorphism, micro-animations
- 🇸🇦 **RTL-first** — Cairo Arabic font, full right-to-left layout
- 📱 **Mobile-first responsive** design

---

## Local Development Setup

### 1. Clone & Install

```bash
cd d:\coding-repo\schedula\app
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `mnar-photofilm`), set a strong database password, select a region near you
3. Wait for project to initialize (~2 minutes)
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY` _(keep this secret!)_

### 3. Run Database Schema

1. In your Supabase project, go to **SQL Editor → New query**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

### 4. Create Admin Account

1. In Supabase, go to **Authentication → Users → Add user**
2. Enter your email and a strong password
3. Click **Create user**

That's your admin login. No other setup required — v1 supports a single admin user.

### 5. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 6. Start the Dev Server

```bash
npm run dev
```

Visit:
- **Public page**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin

---

## Deploying to Vercel (Free Tier)

### 1. Push to GitHub

```bash
# In d:\coding-repo\schedula\app\
git init
git add .
git commit -m "Initial commit — Mnar Photofilm Sessions"
```

Create a new repo on [github.com](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mnar-photofilm.git
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repo
3. Click **Deploy** (Vercel auto-detects Next.js — no config needed)

### 3. Set Environment Variables on Vercel

In Vercel project settings → **Environment Variables**, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Redeploy after adding variables.

### 4. Live URL

Vercel assigns a URL like `mnar-photofilm.vercel.app`. You can add a custom domain under **Project Settings → Domains**.

---

## Importing Initial Session Data

1. Log in to your admin panel at `/admin`
2. Click the **Upload** icon in the header → goes to `/admin/import`
3. Paste your CSV data or upload a `.csv` / `.json` file
4. Preview the parsed rows
5. Click **Import** to load everything into Supabase

### Supported CSV columns (Arabic or English headers):
| Arabic | English | Required |
|---|---|---|
| الإسم | client_name | ✅ |
| التاريخ | date | ✅ (YYYY-MM-DD or DD/MM/YYYY) |
| الساعة | time | — |
| اللوكيشن | location | — |
| نوع التصوير | session_type | — |
| السعر | price | — |
| ملاحظات | notes | — |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public home page
│   ├── layout.tsx            # Root layout (RTL, Cairo font)
│   ├── globals.css           # Design system & tokens
│   ├── api/
│   │   ├── sessions/         # Public sessions endpoint
│   │   └── admin/
│   │       ├── sessions/     # Admin CRUD endpoints
│   │       └── import/       # Bulk import endpoint
│   └── admin/
│       ├── login/            # Login page
│       ├── import/           # Bulk import UI
│       └── page.tsx          # Admin dashboard
├── components/
│   ├── public/               # Hero, CalendarView, ListView, etc.
│   └── admin/                # AdminCalendar, SessionTable, SessionForm
├── lib/
│   ├── supabase/             # Browser + server Supabase clients
│   └── utils.ts              # Date formatting, CSV parser
├── middleware.ts             # Auth guard for /admin routes
└── types/
    └── session.ts            # TypeScript types
supabase/
└── schema.sql                # Database schema + RLS policies
```
