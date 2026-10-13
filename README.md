# MediCare Hub — Private Medical Clinic Website (Pakistan)

A complete, production-ready, mobile-first healthcare website and appointment management system built for **MediCare Hub** (`Caring for Your Family, Every Day`) in Clifton, Karachi.

Designed specifically for families and elderly patients in Sindh and Punjab, featuring **English (LTR)**, **Urdu (RTL)**, and **Sindhi (RTL)** support, a **60-second 4-step online appointment booking wizard**, a **multilingual rule-based medical chatbot** with emergency guardrails, and a **password-protected staff admin panel**.

---

## 1. Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom medical design tokens (`#0E9AA7` Medical Teal, `#12355B` Deep Blue, `#FF6B4A` Warm Coral)
- **Database:** Prisma ORM + SQLite locally (100% compatible with PostgreSQL for production)
- **Internationalization (i18n):** `next-intl` supporting `/en`, `/ur`, and `/sd` with automatic RTL layout mirroring and font switching (`Poppins`, `Inter`, `Noto Nastaliq Urdu`, `Noto Naskh Arabic`)
- **Animations & Carousels:** Framer Motion (with `prefers-reduced-motion` support) + Swiper.js
- **Forms & Validation:** `react-hook-form` + `zod` + server-side sanitization & IP rate limiting

---

## 2. How to Install & Run Locally

### Step 1: Install dependencies
```bash
npm install
```

### Step 2: Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` values:
```env
DATABASE_URL="file:./dev.db"
ADMIN_USER="admin"
ADMIN_PASSWORD="MediCareAdmin2026!"
ADMIN_SESSION_SECRET="medicare-hub-super-secret-session-key-2026"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Step 3: Push Prisma schema & seed the database
```bash
npm run db:setup
```
*(Or run `npx prisma db push` followed by `npm run seed` to populate the 8 services, 6 doctors, sample appointments, and sample leads.)*

### Step 4: Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
- Public Website: `http://localhost:3000/en`, `http://localhost:3000/ur`, `http://localhost:3000/sd`
- Staff Admin Panel: `http://localhost:3000/admin` (Username: `admin`, Password: `MediCareAdmin2026!`)

---

## 3. How to Change Clinic Details (Single Config File)

All clinic-wide placeholders are centralized in **`src/config/clinic.ts`**:
- Clinic Name (`en`, `ur`, `sd`) & Tagline
- Address (`Suite 203, Al-Noor Medical Plaza, Clifton Block 5, Karachi 75600`)
- Phone (`+92 21 3500 0000`), WhatsApp (`+92 328 8285894`), Email (`muzamilelahi798@gmail.com`)
- Opening Hours (`Mon-Sat 9:00 AM - 9:00 PM, Sunday 10:00 AM - 2:00 PM`)
- Home Page Statistics (`10+ Years`, `15,000+ Patients`, `8 Doctors`, `4.8/5 Rating`)
- Lab report turnaround hours (`6` hours)
- Google Maps coordinates & embed URL

Editing `src/config/clinic.ts` automatically updates the Header, Footer, Home Page, Contact Page, Chatbot replies, and SEO JSON-LD structured data.

---

## 4. How to Replace Placeholder Images

Replace the placeholder graphics inside `public/images/`:
- **Hero Slider backgrounds:** `public/images/hero-1.svg`, `hero-2.svg`, `hero-3.svg` (or `.jpg`/`.webp` equivalents)
- **About Clinic preview:** `public/images/clinic-about.svg`
- **Doctor portraits:** `public/images/doctor-1.svg` through `doctor-6.svg`
- **Clinic Gallery photos:** `public/images/gallery-1.svg` through `gallery-12.svg`

---

## 5. How to Add or Edit Doctors & Health Tips

### Adding/Editing Doctors
1. **Via the Admin Panel (Recommended):** Log in at `/admin`, click **Doctors Manager**, and click **Add New Doctor** or **Edit** on any doctor card to update their fee, specialty, bio, or 30-minute availability slots.
2. **Via Seed Script:** Edit `prisma/seed.ts` and run `npm run seed`.

### Adding Health Tips / Blog Articles
Create a new `.mdx` file in `content/health-tips/your-article-slug.mdx` with frontmatter (`title`, `titleUr`, `titleSd`, `excerpt`, `author`, `date`, `serviceSlug`). It will automatically appear on `/health-tips`.

---

## 6. How to Plug In an AI API (Claude / Gemini) for the Chatbot

- Conversation flows, quick replies, emergency keywords, and symptom safety rules live in **`src/chatbot/flows.ts`**.
- To connect Anthropic Claude or Google Gemini for open-ended questions, add your API key to `AI_API_KEY` in `.env` and implement `queryAIAdapter` inside **`src/chatbot/aiAdapter.ts`**.

---

## 7. Deploying to Vercel (with PostgreSQL)

1. Push this repository to GitHub / GitLab.
2. Create a free managed PostgreSQL database on **Neon**, **Supabase**, or **Vercel Postgres**.
3. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
4. Import the project in **Vercel** and configure the Environment Variables:
   - `DATABASE_URL` (your PostgreSQL connection string)
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
5. Set the Vercel Build Command to `npx prisma db push && npm run build` and run `npm run seed` once against the production database.
