Good instinct.
We don’t throw away the reflective tone of version 1.
We don’t hide the engineering of version 2.

We merge them intelligently.

You keep the honesty about it being your first end-to-end build — but you don’t downplay authentication, persistence, and deployment.

Here is the integrated version:

---

# 🎬 Preroll

> **Note**
> Preroll is my first end-to-end product build and an evolving system.
> It was developed while learning modern web development and GenAI workflows, with extensive use of AI-assisted tools for iteration and debugging.
>
> The focus of this project is building a working product — understanding product flow, UX trade-offs, performance constraints, authentication, and persistent system design through hands-on implementation.

---

## 🔎 Overview

**Preroll** is an AI-assisted film pre-production workspace built around an intent-driven generation model.

Users authenticate via magic link, create projects, generate selective production reports, and revisit saved work through a persistent dashboard.

This is not a static demo — it is a deployed, multi-user system with working authentication and database-backed storage.

Live: [https://preroll-zciu.vercel.app](https://preroll-zciu.vercel.app)
Repository: [https://github.com/ayush834-git/preroll](https://github.com/ayush834-git/preroll)

---

## 🔐 Authentication & Persistence

Preroll includes full end-to-end authentication and user-bound data storage:

* Email magic-link authentication (NextAuth)
* JWT-based session management
* Protected routes
* PostgreSQL database (Supabase)
* Projects tied to authenticated users
* Resume saved projects from dashboard

Generated outputs persist across sessions and are stored per user.

---

## 🧠 Product Philosophy

Preroll follows three principles:

### 1. Intent-Driven AI

Users explicitly choose what they want generated.
The system avoids unnecessary output.

### 2. Workspace → Structured Report

Input happens in a focused workspace.
Output is delivered as a structured report, not a chat interface.

### 3. Performance-Aware Rendering

The UI adapts to device capability while preserving workflow integrity.

---

## 🧭 Core Workflow

1. Log in via magic link
2. Create a project
3. Define production parameters
4. Select generation type
5. Enter creative prompt
6. Generate structured report
7. Save, revisit, or export results

Projects remain accessible whenever the user logs back in.

---

## ✨ Key Features

* Magic-link authentication
* Persistent PostgreSQL storage
* Auth-protected dashboard
* Selective AI report generation
* Expandable structured sections
* PDF export
* Cinematic dark UI theme
* Responsive design

---

## 🛠 Tech Stack

Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* Framer Motion

Backend

* NextAuth (Email provider)
* Prisma ORM
* PostgreSQL (Supabase)
* JWT session strategy

AI

* Groq API
* LLaMA 3.1 8B
* Structured prompting

Deployment

* Vercel (Serverless)

---

## 🏗 Architecture Snapshot

User → Magic Link → VerificationToken (DB)
Session (JWT) → Protected Routes
Project → Stored via Prisma → PostgreSQL
Dashboard → Fetches user-bound projects

Authentication, session management, AI generation, and persistence are intentionally separated.

---

## 🎯 Closing

Preroll is not a general-purpose AI assistant.

It is a structured, authenticated workspace designed to support creative pre-production planning with persistence and clarity.

🎬 *Where films begin — before the camera rolls.*

---


