# FounderFlow

**Turn startup uncertainty into daily progress.**

FounderFlow is an AI-powered operating system for solo founders — the connective tissue between a long-term goal and what actually gets shipped today. Every morning it surfaces the single highest-leverage task for your current goal, schedules it around your real capacity, and tracks the evidence that proves you're moving forward.

No dashboard dumps, no busywork. One goal, one plan, one founder who ships.

## 🎯 Project Scope
The project ships in two layers:
1. **Founder OS (Free):** The daily execution system — stand-ups, AI recommendations, time-blocked scheduling, and evidence tracking. Built to acquire users and build the shipping habit.
2. **Founder Community (Paid):** The monetization layer — a private network of founders, a personal AI coach, and shared resources.

---

## ✅ What's Built (Founder OS - Free)
The following core productivity features are fully implemented:

### 📅 Daily Execution
- **Daily Stand-ups:** A streamlined check-in process to record yesterday's wins, today's focus, and current blockers.
- **Blocker Lifecycle:** Automatic extraction of blockers from stand-ups with a management system to resolve or dismiss them.
- **Visual Time-Blocking:** A chronological daily schedule grid (8 AM - 8 PM) allowing founders to map out their day.

### 🛠️ Task Management
- **Hierarchical Structure:** Full support for the `Goal` $\rightarrow$ `Milestone` $\rightarrow$ `Task` hierarchy.
- **Advanced Task Control:** 
  - **Priority Levels:** High/Medium/Low prioritization for better focus.
  - **Snooze Logic:** Ability to postpone tasks to tomorrow to prevent burnout.
  - **Smart Filtering:** Filter tasks by status and sort by priority or due date.

### 🤖 AI Integration
- **AI Schedule Assistant:** A Gemini-powered engine that analyzes goals and blockers to autonomously propose an optimized daily schedule.
- **Approval Workflow:** A "propose-and-apply" system where founders can review AI suggestions before updating their calendar.

### 💼 Portfolio & Profile
- **Startup Portfolio:** A centralized dashboard to manage multiple startups, track their stage, and switch between them seamlessly.
- **Founder Profile:** Personalized settings for working hours and timezones to power the scheduling engine.

### 💰 Revenue Tracking
- **Revenue Evidence:** A system to log financial wins and revenue metrics as "Evidence," providing data-driven insights into startup growth.

---

## 🏗️ What's Yet to be Built (Future Scope)
### 👥 Founder Community (Paid Layer)
- [ ] **Live Chat Rooms:** Real-time communication for founders.
- [ ] **Discussion Forum:** Knowledge sharing and Q&A.
- [ ] **Personal AI Coach:** A deeper, RAG-grounded AI coach that knows the founder's specific metrics and goals.
- [ ] **Resource Library:** Curated guides and templates for solo founders.
- [ ] **Jobs & Co-founder Boards:** Connecting founders with talent and partners.

### 🚀 Platform Enhancements
- [ ] **Automated Weekly Reviews:** AI-generated summaries of the week's progress vs. goals.
- [ ] **Full Billing System:** Stripe integration for membership subscriptions.
- [ ] **Mobile Application:** Native app for on-the-go stand-ups and scheduling.

---

## 🛠️ Tech Stack
### Core Frameworks
- **Frontend/Backend:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

### Infrastructure & Data
- **Database:** [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Clerk](https://clerk.com/)

### Intelligence & State
- **AI Model:** [Google Gemini 2.0 Flash](https://aistudio.google.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Validation:** [Zod](https://zod.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
