# 🎬 Preroll

**Preroll** is an AI-assisted film pre-production workspace designed to generate *exactly what the user asks for* — no more, no less.

Instead of a one-click “do everything” AI tool, Preroll focuses on **intent-driven generation**: scene breakdowns, sound design notes, visual direction, budget considerations, and production insights — generated selectively based on user choice.

This project began as a campus hackathon submission and is now being actively developed as a reusable platform for future hackathons and product iterations.
> **Note**  
> Preroll is my **first end-to-end project** and an early-stage prototype.  
> It was built while learning modern web development and GenAI workflows, with heavy use of AI-assisted tools for design, debugging, and iteration.  
>  
> The goal of this project is not perfection, but exploration — understanding product flow, UX decisions, and how AI-assisted systems can be shaped into usable tools.

---

## 🔗 Live & Code

- **Live Demo:** https://preroll-zciu.vercel.app/
- **Repository:** https://github.com/ayush834-git/preroll

---

## 🧠 Product Philosophy

Preroll is built on three core ideas:

1. **Selective Generation**  
   Users choose *what* they want generated (scene breakdown, sound, budget, etc.).  
   The system does not generate unnecessary sections.

2. **Workspace → Report Flow**  
   Input happens in a focused workspace.  
   Output is presented as a structured, professional report — not a chat response.

3. **Usability over Novelty**  
   The goal is clarity, structure, and usefulness — not AI spectacle.

This mirrors how real pre-production planning works in practice.

---

## ✨ What Preroll Does

- Structured AI-generated **pre-production reports**
- User-controlled generation types:
  - Scene Breakdown
  - Visual Direction
  - Sound & Mood Design
  - Budget Considerations
  - Director / Production Notes
- Professional, skimmable output format
- Versioned results with metadata
- Adaptive UI performance (cinematic on capable devices, reduced on low-end)

> Preroll generates **only what is requested** by the user.  
> It is optimized for intent, not completeness.

---

## 🧭 Core Flow

1. Create a project
2. Define production parameters (genre, budget tier, complexity, etc.)
3. Choose the generation type
4. Provide a creative prompt
5. Generate a structured results report
6. Copy, regenerate, or iterate sections as needed

---

## 🛠 Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Framer Motion**

### AI
- **Groq API**
- **LLaMA 3.1 8B (instant)**
- Structured, role-based prompting
- Token-optimized generation

### Deployment
- **Vercel**

---

## ⚙️ Performance & Accessibility

Preroll includes an adaptive performance system:

- **Cinematic Mode**  
  Full animations and visual effects on capable devices

- **Reduced Mode**  
  Shorter animations and lighter effects for mid-range devices

- **Performance Mode**  
  Minimal motion and static visuals for low-end devices or users with reduced-motion preferences

The layout and content remain identical across modes.

---

## 🧪 Project Status

- No authentication (demo workspace)
- No persistent backend storage (yet)
- Focused on:
  - UX clarity
  - output structure
  - product direction

This repository represents an **early but intentional stage**, not a finished product.

---

## 🚀 Why This Project Exists

Preroll is used as:
- a reusable base for future hackathons
- a sandbox for exploring GenAI workflows
- a portfolio project demonstrating product thinking
- a controlled environment for improving AI output quality

The project continues to evolve with each iteration.

---

## 🏆 Origins

Built during a **campus hackathon (NASSCOM × IBM – Introduction to GenAI)**  
Placed in the **Top 30** among ~150–200 teams (1st–4th year students).

The college permitted continued development and reuse for future hackathons.

---

## 📌 Closing Note

Preroll is not a “finished app.”

It is a **designed system**:
- opinionated
- selective
- evolving

The goal is not to generate everything —  
but to generate **exactly what is needed, when it is needed**.

🎬 *Where films begin — before the camera rolls.*
