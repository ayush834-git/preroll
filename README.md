# 🎬 Preroll

> AI-powered film pre-production workspace. Generate structured production documents from a single creative prompt — with persistent version history, side-by-side diff, and PDF export.

<p align="center">
  <a href="https://preroll-zciu.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-preroll--zciu.vercel.app-C9A84C?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-82.7%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-LLaMA%203.1%208B-FF6B35?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/commit-activity/t/ayush834-git/preroll?style=flat-square&label=Total%20Commits&color=C9A84C" />
  <img src="https://img.shields.io/badge/Deployments-210%2B-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Live%20%26%20Deployed-brightgreen?style=flat-square" />
</p>

---

## What is Preroll?

Before any film gets made, a production team spends days on paperwork — scene breakdowns, budget estimates, crew lists, sound design notes. Preroll generates all of it from a single sentence in under 3 seconds.

It is not a chatbot. It is a structured, authenticated workspace that produces the same guaranteed sections every time — shaped by your budget tier, scene complexity, runtime, and location count. Every generation is saved. Every version is comparable. Every document is exportable as a PDF.

**The problem:** Film pre-production planning takes days and requires domain expertise most students and indie creators don't have.

**The solution:** One prompt. Structured professional output. Instantly.

---

## Live Demo

🔗 **[preroll-zciu.vercel.app](https://preroll-zciu.vercel.app)**

Sign in with any email. A magic link will arrive in seconds. No password required.

---

## Features

### Core Generation
- **6 generation types** — Scene Breakdown, Full Production Plan, Budget Plan, Sound Design, Visual Direction, Production Notes
- **Structured output contracts** — every generation type returns the same guaranteed sections every time. Not prose — predictable JSON rendered as expandable cards
- **Parameter-aware generation** — budget tier (Low/Medium/High), scene complexity, estimated runtime, and location count all shape the output explicitly
- **Demo Mode** — pre-loaded example for presentations without needing an account

### Versioning & Collaboration
- **Version history** — every generation saved with timestamp. Come back to any project anytime
- **Side-by-side diff view** — compare any two versions with CHANGED labels per section
- **Refinement** — add instructions to evolve v1 into v2 into v3. The model sees what already exists and improves it
- **Copy Project Link** — shareable URL for team collaboration (PRJ-ID display in sidebar)

### Export & Auth
- **PDF export** — client-side generation via pdf-lib. Zero server cost. Download or share instantly
- **Magic link authentication** — no passwords. Email → link → session. Secure and frictionless
- **Persistent dashboard** — all projects saved per user. Resume exactly where you left off
- **Protected routes** — every project and workspace is user-bound. No cross-user data access

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Frontend + backend in one. Serverless API routes. File-based routing |
| Language | TypeScript | Type-safe queries, compile-time error catching, Prisma type inference |
| Styling | Tailwind CSS + Framer Motion | Utility-first styling, smooth animated transitions |
| Auth | NextAuth (Email Magic Link) | Passwordless — filmmakers are creatives, not developers |
| ORM | Prisma | Type-safe database access, compile-time validation, migration tracking |
| Database | Supabase (PostgreSQL) | Managed Postgres, relational data, generous free tier |
| AI Inference | Groq API → LLaMA 3.1 8B | LPU hardware on AMD Instinct architecture. Sub-3s inference. 10x faster than standard GPU |
| PDF Generation | pdf-lib (client-side) | Zero server processing. Runs entirely in the browser |
| Deployment | Vercel (Serverless) | Auto-scaling, edge network, 210+ preview deployments during development |

---

## Architecture

```
User
 │
 ├─ Visits landing page (public, server-rendered)
 │
 ├─ Enters email → NextAuth sends magic link via Gmail SMTP (Nodemailer)
 │
 ├─ Clicks link → token verified → JWT created → HTTP-only cookie set
 │
 ├─ Dashboard → Prisma fetches user's projects from Supabase
 │   └─ WHERE userId = session.user.id  (row-level security in app code)
 │
 ├─ Creates project → name, genre, team roles saved via Prisma
 │
 ├─ Workspace → enters prompt + selects parameters
 │
 └─ Clicks Generate
      │
      ├─ POST /api/generate
      │   ├─ Auth check (getServerSession)
      │   ├─ Builds structured system prompt with injected parameters
      │   ├─ Calls Groq API (LLaMA 3.1 8B, temp: 0.4, max_tokens: 1800)
      │   ├─ Parses guaranteed JSON response
      │   └─ Saves version snapshot to Supabase via Prisma
      │
      └─ Frontend renders expandable section cards
          ├─ Refine → loops back with previous result in context
          ├─ Compare → side-by-side diff with CHANGED labels
          └─ Export → pdf-lib generates PDF client-side, browser download
```

---

## Database Schema

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  createdAt DateTime  @default(now())
  projects  Project[]
}

model Project {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  name      String
  genre     String
  content   Json     // { prompt, parameters, result, versions: [...] }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Deliberate design decision:** Versions are stored as a JSON array inside `Project.content` rather than a separate table. At current scale, all versions are always queried together — a separate table adds JOIN complexity with no performance benefit. Migration path to a dedicated versions table is straightforward when needed.

---

## The Generation Engine

The core engineering in Preroll is not the AI call — it is the system prompt.

Every generation sends:
- **Role assignment** — expert film production coordinator persona
- **Output contracts** — exact section names, exact order, JSON only, no preamble
- **Injected parameters** — budget tier, complexity, runtime, location count explicitly shape all outputs
- **Quality constraints** — 3–5 actionable items per section, specific to the described scene, never generic

**Temperature: 0.4** — low enough that JSON structure stays consistent and sections don't drop. High enough that two identical prompts generate meaningfully different creative content.

**Max tokens: 1800** — sufficient for 11 sections at 3–5 items each. Tested ceiling before output quality degrades.

This is why Preroll produces structured documents instead of prose. The output contract is the product.

---

## Why Not Just Use ChatGPT?

| | ChatGPT | Preroll |
|---|---|---|
| Output structure | Varying prose, inconsistent | Guaranteed same sections every time |
| Context awareness | No knowledge of budget, crew, runtime | Budget tier, complexity, runtime, locations all shape output |
| Persistence | Conversations disappear | All versions saved with timestamps |
| Version comparison | Not possible | Side-by-side diff with CHANGED labels |
| Export | Copy/paste | Production-ready PDF download |
| Workflow | General conversation | Purpose-built pre-production workflow |

---

## Scalability

| Bottleneck | Limit | Solution |
|---|---|---|
| Groq free tier | 14,400 requests/day | Groq Pro or async queue with retry |
| Supabase free tier | 500MB, 50k MAU | Paid tier at scale |
| Vercel serverless | Auto-scales horizontally | No action needed |
| JSON content field growth | Large projects → large payload | Migrate versions to separate table |

Current architecture handles ~10,000 MAU without changes.

---

## Known Limitations

- LLaMA 3.1 8B occasionally drops sections under high inference load. Output contracts reduce this significantly. Retry logic not yet implemented
- No real-time collaboration (WebSocket-based co-editing is on the roadmap)
- 1800 token limit truncates very complex multi-location scenes
- Visual Direction is text-only — no image generation yet
- Mobile functional but not optimized for small screens
- `project-page-client.tsx` is 2,326 lines — component decomposition is the next refactor priority

---

## Roadmap

- [ ] Shot list generator (7th generation type)
- [ ] Retry logic for dropped sections
- [ ] Component decomposition — split workspace into focused hooks and panels
- [ ] Real-time collaboration with shared project links
- [ ] AI storyboard integration — Visual Direction + image generation
- [ ] Freemium SaaS tier — $9/month Pro with unlimited projects
- [ ] Direct AMD ROCm/HIP integration (currently indirect via Groq)
- [ ] Calendar and scheduling export (StudioBinder / Movie Magic compatible)

---

## Environment Variables

```env
DATABASE_URL=                  # Supabase PostgreSQL connection string
NEXTAUTH_SECRET=               # Random string for JWT signing
NEXTAUTH_URL=                  # App URL (https://preroll-zciu.vercel.app in prod)
EMAIL_SERVER_USER=             # Gmail address
EMAIL_SERVER_PASSWORD=         # Gmail app password (16 chars, not regular password)
EMAIL_FROM=                    # Must match EMAIL_SERVER_USER exactly
GROQ_API_KEY=                  # Groq API key — server-side only, never exposed to client
```

---

## Local Setup

```bash
git clone https://github.com/ayush834-git/preroll
cd preroll
npm install

# Add environment variables to .env.local
# Run Prisma migration
npx prisma migrate dev

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## About This Project

Preroll is my first end-to-end deployed product. Built 4 months into learning computer science, on my first PC, starting with zero web development knowledge.

138 commits. 210+ deployments. Every decision documented and understood.

The focus was building a real product — not a tutorial project. Working authentication, persistent database, production deployment, structured AI generation, version history. All of it built, broken, debugged, and shipped.

> *"Where films begin — before the camera rolls."*

---

<p align="center">
  Built by <a href="https://github.com/ayush834-git">Ayush Singh</a> · CS Fresher · 
  <a href="https://preroll-zciu.vercel.app">Live Demo</a>
</p>
