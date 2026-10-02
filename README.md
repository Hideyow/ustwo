# UsTwo — "our little space ✦"

A private, responsive web application for couples built with React 19, TypeScript, Tailwind CSS v4, and TanStack Query. Designed after intimate couple spaces with soft lavender/blush gradients, rounded geometry, and a couple calendar.

---

## 🎨 Design System & Visual Palette

- **Primary Colors**: Deep violet (`#7c0fd0` to `#9333ea`) gradient for primary buttons, badges, and active pills.
- **Surfaces**: Soft lavender surfaces (`#f5e9ff` / `#faf0ff`), blush pink accents (`#fde4ef`), and translucent glass top nav (`backdrop-blur-md`).
- **Typography**: Google Fonts [Quicksand](https://fonts.google.com/specimen/Quicksand) (headings) and [Inter](https://fonts.google.com/specimen/Inter) (body).
- **Geometry**: Heavily rounded cards (`rounded-3xl` / `rounded-[2.5rem]`), pill shapes (`rounded-full`), and inputs (`rounded-2xl`).
- **Decorations**: Soft blurred background blobs, micro-animations (shake on wrong passcode, sparkle floats, heart pulses), and category colors:
  - **Milestones**: Deep violet (`#7c3aed`)
  - **Date Nights**: Blush pink & magenta (`#ec4899`)
  - **Getaways & Trips**: Medium purple (`#8b5cf6`)
  - **Anniversaries**: Regal violet (`#6d28d9`)
  - **Little Moments**: Warm amber (`#f59e0b`)

---

## 🚀 Features

### 1. Lock Screen (`/lock`)
- Private haven gatekeeper with couple avatars, heart badge, and key indicator.
- 4-dot passcode progress indicator that highlights as you type.
- Show/hide password toggle.
- Collapsible "Need a soft reminder?" dropdown with anniversary hints.
- Wrong passcode validation triggers a shake animation and an error toast.
- "Note of the day" preview card from the partner.
- Interactive "Switch Partner" toggle and "Forgot passcode?" help.

### 2. Shared Calendar (`/calendar`)
- **Top Navigation Bar (AppShell)**: UsTwo logo wordmark, "Together for 428+ days" pill, tab nav, user names ("Alex & Mia"), partner thinking status, and stacked interactive avatar chips.
- **Pinned Note Banner**: Active note from partner with a one-click "Send Quick Heartbeat 💜" button that delivers an instant haptic toast.
- **3 Stat Cards**:
  - *12 Moments* (Shared adventures this month)
  - *In 3 Days* (Upcoming adventure computed dynamically)
  - *Days Together* (Our love story continues with partner initials)
- **Month Switcher Bar**: Previous/Next month pagination, seasonal badge (*"Month of Cozy Sweaters 🧣"*), and "+ Add Special Date" button.
- **Filter Tabs**: Pill group with live counts for *All (12)*, *Date Nights 🍷*, *Trips & Getaways ✈️*, *Anniversaries 💍*, *Little Moments ☕*, and *Special Surprises 🎁*.
- **Interactive 7-Day Monthly Grid**:
  - Monday–Sunday layout, with weekend columns tinted blush pink.
  - Leading/trailing dates from adjacent months faded out.
  - Milestone cards (Oct 14: *1st Kiss Anniversary — Our sacred memory*).
  - Selected date highlight (Oct 18: *Italian Pasta Night* with meal thumbnail, time, and partner dots).
  - Multi-day spans (Oct 22–23: *Cabin Getaway in Pine Valley*).
  - TODAY badge (Oct 27: *Pottery Class Tonight • 6:00 PM*).
  - Accessible keyboard navigation (Arrow keys + Enter).
- **Date Inspector (Sidebar Card A)**:
  - Category chip, favorite heart toggle.
  - Formatted date & time header.
  - Photo memory card with *"Cherished ✨"* badge and *"3 photos added by Mia"*. Clicking opens a photo gallery modal.
  - **DATE BLUEPRINT** container with sweet description and assigned partner tasks.
  - Mood badge (*"Mood: Romantic & Cozy 🍰"*) and *"Confirmed by"* partner avatars.
  - *"Edit Date"* (loads into Quick Plan Editor) and *"Delete"* (Radix AlertDialog confirmation).
- **Quick Plan Editor (Sidebar Card B)**:
  - Form fields: When (date picker), Time, Event Title, Sweet Details & Tasks (textarea).
  - Mood/Vibe single-select pills: *🍰 Romantic*, *☕ Chill & Cozy*, *🥂 Fancy Glam*, *🏔 Adventure*.
  - Photo memory attachment with thumbnail previews.
  - Works in both Create and Edit mode with cancel capabilities.
  - React Hook Form + Zod schema validation.
  - TanStack Query optimistic updates with Sonner feedback toasts.

### 3. Additional Sanctuary Pages
- `/memories`: Photo gallery archive with polaroid memory cards.
- `/ideas`: Couple bucket list & date ideas wishlist with interactive checkboxes and new idea submissions.

---

## 🛠 Tech Stack

- **React 19** with direct named imports (no `React.FC` or `React.*`).
- **TypeScript** (Strict mode).
- **Vite 8** with `@tailwindcss/vite` plugin.
- **Tailwind CSS v4** using the `@theme` directive in `src/index.css`.
- **Radix UI Primitives**: Label, Slot, Alert Dialog, Collapsible.
- **TanStack Query v5** for server and client cache state.
- **React Hook Form + Zod** for typed validation schemas.
- **React Router v7** with declarative navigation and search parameters (`?filter=...&date=...`).
- **Lucide React** for icons, **Sonner** for toasts.

---

## 📁 Project Structure

```
src/
├── api/
│   ├── client.ts             # Typed apiFetch wrapper & ApiError
│   ├── events.api.ts         # Event CRUD operations
│   └── mock-adapter.ts       # In-memory store seeded with October 2024 dates
├── components/
│   ├── calendar/
│   │   ├── CalendarGrid.tsx   # 7-day monthly grid & legend
│   │   ├── DateInspector.tsx  # Selected day detail card & photo modal
│   │   ├── DayCell.tsx        # Individual calendar day cell
│   │   ├── EventChip.tsx      # Category-specific event badge
│   │   ├── FilterTabs.tsx     # Pill group with event counts
│   │   ├── MonthSwitcher.tsx  # Month pagination & seasonal chip
│   │   ├── PinnedNoteBanner.tsx # Pinned partner message & heartbeat action
│   │   ├── QuickPlanEditor.tsx# Event creation/edit form
│   │   └── StatCards.tsx      # Top 3 statistics cards
│   ├── layout/
│   │   ├── AppShell.tsx       # Glass top navigation & footer
│   │   ├── PasscodeGuard.tsx  # Route protection guard
│   │   └── UsTwoLogo.tsx      # UsTwo wordmark & glossy heart
│   └── ui/
│       ├── AlertDialog.tsx    # Radix UI alert dialog primitive
│       ├── Badge.tsx          # Pill badge variants
│       ├── Button.tsx         # Primary gradient, outline, ghost buttons
│       ├── Card.tsx           # Rounded-3xl card containers
│       ├── Input.tsx          # Rounded-2xl form inputs
│       ├── Label.tsx          # Radix Label primitive
│       ├── Pill.tsx           # Filter and selection pills
│       └── Textarea.tsx       # Textarea component
├── context/
│   ├── partner-context.tsx    # Active partner state & days together
│   └── passcode-context.tsx   # Vault lock / unlock state
├── hooks/
│   └── useEvents.ts           # useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent
├── lib/
│   ├── date-helpers.ts        # Calendar matrix, formatting, seasonal chips
│   ├── logger.ts              # Dev logger
│   └── utils.ts               # cn() (clsx + tailwind-merge)
├── routes/
│   ├── calendar/              # Shared Calendar page
│   ├── ideas/                 # Date Ideas & Wishlist page
│   ├── lock/                  # Private Passcode Lock screen
│   └── memories/              # Memories Polaroid Archive
├── types/
│   └── schemas.ts             # Zod schemas & TypeScript types
├── App.tsx                    # Routes & route guards
├── index.css                  # Tailwind v4 theme tokens & animations
├── main.tsx                   # React root entry
└── providers.tsx              # QueryClient, Partner, Passcode, Router, Toaster
```

---

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment (`.env`)
Copy the example environment configuration:
```bash
cp .env.example .env
```
Default local settings:
```ini
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_USE_MOCK=true
VITE_COUPLE_PASSCODE=0304
```
> While `VITE_USE_MOCK=true` or before Supabase credentials are configured, the app runs offline using a local storage mock adapter.

### 3. Start Development Server
```bash
pnpm dev
```
Open `http://localhost:5173/` in your browser. Enter your 4-digit passcode (`0304`) to unlock!

---

## 🗄️ Supabase Setup & Security

### 1. Run Schema Migration
In your Supabase project dashboard, open **SQL Editor** and run the contents of [`supabase/schema.sql`](file:///c:/Users/Lawrence/OneDrive/Desktop/ourlove/supabase/schema.sql).
- Uses additive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements so existing tables are never overwritten or dropped.
- Creates `events` and `event_photos` tables with indexes on `events(date)` and foreign keys.
- Enables Row Level Security (RLS) on all tables.
- Creates the private storage bucket `memories` with signed URL access and server-side 10MB limits.
- Enables Supabase Realtime replication on `events` and `event_photos`.

### 2. Configure Supabase Authentication
1. Go to **Authentication → Providers → Email**:
   - Ensure Email provider is enabled.
   - **CRITICAL**: Turn OFF **"Allow new users to sign up"** (disable public sign-ups so only the two partner accounts exist).
2. Go to **Authentication → Users**:
   - Manually invite or create the 2 partner user accounts.
3. Go to **Authentication → URL Configuration**:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add:
     - `https://your-app.vercel.app/**`
     - `http://localhost:5173/**`

---

## 🚀 Vercel Deployment

### 1. Project Configuration
The repository includes [`vercel.json`](file:///c:/Users/Lawrence/OneDrive/Desktop/ourlove/vercel.json) pre-configured with:
- **SPA Rewrites**: Route all requests to `/index.html` for client-side routing.
- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Security Headers**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and strict `Content-Security-Policy` allowing Google Fonts and Supabase endpoints.

### 2. Environment Variables in Vercel Dashboard
In your Vercel Project Settings under **Environment Variables**, set:
- `VITE_SUPABASE_URL`: `https://<your-project-id>.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
- `VITE_USE_MOCK`: `false`
- `VITE_COUPLE_PASSCODE`: `0304` (or your 4-digit anniversary passcode)

> 🔒 **Security Notice**: Never expose your Supabase `service_role` key in frontend code or client environment variables. Real data protection is enforced via Supabase Auth and Row Level Security (RLS) policies.

