"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { geminiModel } from "@/lib/gemini";
import { track } from "@/lib/analytics";
import { estimateCostUSD } from "@/lib/usage";
import { revalidatePath } from "next/cache";

export async function generateWeeklyReview() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const startup = await prisma.startup.findUnique({
    where: { id: ctx.startupId },
    include: {
      goals: {
        where: { isActive: true },
        include: {
          milestones: {
            include: {
              tasks: true,
            },
          },
        },
        take: 1,
      },
      standups: {
        orderBy: { date: "desc" },
        take: 7,
      },
      blockers: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      evidence: {
        orderBy: { recordedAt: "desc" },
        take: 20,
      },
    },
  });

  if (!startup) throw new Error("No startup");

  const goal = startup.goals[0];

  if (!goal) throw new Error("No active goal");

  // Build context for Gemini
  const allTasks = goal.milestones.flatMap((m) =>
    m.tasks.map((t) => ({
      title: t.title,
      status: t.status,
      milestone: m.title,
    }))
  );

  const completedTasks = allTasks.filter((t) => t.status === "DONE");
  const pendingTasks = allTasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS");
  const blockedTasks = allTasks.filter((t) => t.status === "BLOCKED");

  const context = `Goal: ${goal.title}
Definition of success: ${goal.definitionOfSuccess || "Not specified"}
Target date: ${goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "No target date"}

Completed tasks this week: ${completedTasks.length}
${completedTasks.map((t) => `- ${t.title} (${t.milestone})`).join("\n") || "None"}

Pending tasks: ${pendingTasks.length}
${pendingTasks.map((t) => `- ${t.title} (${t.status}, ${t.milestone})`).join("\n") || "None"}

Blocked tasks: ${blockedTasks.length}
${blockedTasks.map((t) => `- ${t.title} (${t.milestone})`).join("\n") || "None"}

Recent standups:
${startup.standups.map((s) => `- ${new Date(s.date).toLocaleDateString()}: "${s.yesterday || "No update"}" → "${s.today || "No plan"}" | Blockers: ${s.blockers || "None"}`).join("\n") || "None"}

Open blockers: ${startup.blockers.filter((b) => b.status === "OPEN").length}
${startup.blockers.filter((b) => b.status === "OPEN").map((b) => `- ${b.description}`).join("\n") || "None"}

Evidence recorded this week: ${startup.evidence.length}
${startup.evidence.map((e) => `- ${e.type}: ${e.value ?? "N/A"} ${e.note ? `(${e.note})` : ""}`).join("\n") || "None"}`;

  const prompt = `You are a startup advisor reviewing a founder's week. Based on this data:

${context}

Generate a concise weekly review with these sections:
1. **Completed** - What got done (facts only)
2. **In Progress** - What's moving (facts only)
3. **Blockers** - What's stuck (facts only)
4. **Evidence** - What customer/market signal was recorded (facts only)
5. **Focus for Next Week** - Your recommendation (clearly mark as SUGGESTION, not fact)
6. **Continue/Stop/Investigate** - One actionable recommendation (clearly mark as SUGGESTION)

Rules:
- Every factual statement must reference the actual data above
- Never fabricate tasks, evidence, or metrics
- Distinguish FACTS from SUGGESTIONS clearly
- Keep it under 3 minutes to read
- Be direct and specific`;

  const result = await geminiModel.generateContent(prompt);
  const reviewText = result.response.text();

  await track("weekly_review_generated", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
  });
  await track("ai_cost_incurred", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    meta: { feature: "weekly_review", costUsd: Number(estimateCostUSD(prompt + reviewText).toFixed(4)) },
  });

  // Save review to DB
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const review = await prisma.weeklyReview.create({
    data: {
      startupId: startup.id,
      weekStart,
      completedSummary: reviewText,
      recommendedFocus: "See full review",
    },
  });

  revalidatePath("/today");
  revalidatePath("/review");
  return { review, reviewText };
}

export async function getLatestReview() {
  const { userId } = await auth();
  if (!userId) return null;

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return null;

  const review = await prisma.weeklyReview.findFirst({
    where: { startupId: ctx.startupId },
    orderBy: { weekStart: "desc" },
  });

  return review;
}

export async function trackReviewOpened() {
  const { userId } = await auth();
  if (!userId) return;
  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return;
  await track("weekly_review_opened", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
  });
}
