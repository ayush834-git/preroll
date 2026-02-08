> **Note**
> Preroll is my **first end-to-end project** and an evolving prototype.
> It was built while learning modern web development and GenAI workflows, with extensive use of AI-assisted tools for design, debugging, and iteration.
>
> The focus of this project is not perfection, but understanding **product flow, UX trade-offs, performance constraints, and AI-assisted system design** through hands-on building.

# 🎬 Preroll

**Preroll** is an AI-assisted film pre-production workspace designed to generate *exactly what the user asks for* — no more, no less.

Instead of being a “generate everything” AI tool, Preroll follows an **intent-driven approach**, allowing users to selectively generate scene breakdowns, visual direction, sound design, budget considerations, and production notes based on their needs.

The project began as a campus hackathon submission and has been actively developed since, with a focus on usability, performance, and real-world workflows.

---

## 🔗 Live & Code

- **Live Demo:** https://preroll-zciu.vercel.app/
- **Repository:** https://github.com/ayush834-git/preroll

---

## 🧠 Product Philosophy

Preroll is built around three core principles:

### 1. Intent-Driven AI
Users explicitly choose **what** they want generated.
The system avoids unnecessary output and focuses only on the selected generation type.

### 2. Workspace → Report Flow
Input happens in a focused workspace.
Output is delivered as a structured, professional report — not a chat conversation.

### 3. Performance-Aware Design
The UI adapts to device capability:
- rich and cinematic where possible
- simple, smooth, and respectful where necessary

---

## ✨ Key Features

- AI-generated **pre-production reports**
- Selective generation types:
  - Scene Breakdown
  - Visual Direction
  - Sound & Mood Design
  - Budget Considerations
  - Director / Production Notes
- Structured, expandable result sections
- Versioned outputs with metadata
- **PDF export** for generated results
- Adaptive UI across devices

---

## ⚙️ Adaptive Performance Modes

Preroll uses an **intentional performance system** to balance visuals and usability:

### 🎥 Cinematic Mode
- Enabled on capable desktops and laptops
- Animated beam backgrounds
- Hover effects and subtle motion
- Cinematic visual polish

### ⚖️ Reduced Mode
- Used on mid-range devices
- Limited motion and effects
- Same layout and content
- Improved stability and smoothness

### ⚡ Performance Mode
- Default on phones, touch devices, and low-end hardware
- No heavy animations or background effects
- Static but cinematic visuals
- Smooth scrolling and fast interaction

The content and workflow remain identical across all modes — only rendering intensity changes.

---

## 🧭 Core User Flow

1. Create a project
2. Define production parameters (genre, budget tier, complexity, etc.)
3. Select the generation type
4. Enter a creative prompt
5. Generate a structured results report
6. Copy sections, regenerate, or **download results as PDF**

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

### AI
- Groq API
- LLaMA 3.1 8B (instant)
- Token-optimized, structured prompting

### Deployment
- Vercel

---

## 🧪 Project Status

- No authentication (demo workspace)
- No persistent backend storage yet
- Focused on:
  - UX clarity
  - performance correctness
  - AI output structure
  - iterative improvement

This is an **early but intentional stage**, not a finished product.

---

## 🏆 Origins

Built during a **campus hackathon (NASSCOM × IBM – Introduction to GenAI)**  
Placed in the **Top 30** among ~150–200 teams (1st–4th year students).

The college permitted continued development and reuse for future hackathons, and the project has been iterated beyond the event.

---

## 📌 Closing Note

Preroll is not a “do-everything” AI tool.

It is a **selective, performance-aware system** designed to support creative pre-production workflows without overwhelming the user or the device.

🎬 *Where films begin — before the camera rolls.*
