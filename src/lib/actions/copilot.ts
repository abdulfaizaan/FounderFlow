"use server";

import { auth } from "@clerk/nextjs/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { geminiModel } from "@/lib/gemini";
import { track } from "@/lib/analytics";
import { getCopilotUsage, estimateCostUSD } from "@/lib/usage";
import { revalidatePath } from "next/cache";

export async function chatWithCopilot(message: string) {
// ... existing chatWithCopilot implementation ...

export async function chatWithCopilot(message: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) {
    return { response: "Please complete onboarding first so I can help you." };
  }

  const startup = await prisma.startup.findUnique({
    where: { id: ctx.startupId },
    include: {
      goals: {
        where: { isActive: true },
        include: {
          milestones: {
            include: { tasks: true },
          },
        },
        take: 1,
      },
      standups: { orderBy: { date: "desc" }, take: 5 },
      blockers: { where: { status: "OPEN" }, take: 10 },
      evidence: { orderBy: { recordedAt: "desc" }, take: 20 },
      journalEntries: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!startup) {
    return { response: "Please complete onboarding first so I can help you." };
  }

  const founder = ctx.founder;
  const goal = startup.goals[0];

  const usage = await getCopilotUsage(founder.id);
  if (usage.used >= usage.limit) {
    return {
      response: `You've used all ${usage.limit} AI messages this month. Your plan includes a fair-use AI limit — it resets on the 1st. Record evidence or run your weekly review in the meantime.`,
    };
  }

  // Build context
  const allTasks = goal
    ? goal.milestones.flatMap((m) =>
        m.tasks.map((t) => ({
          title: t.title,
          status: t.status,
          estimate: t.estimateMinutes,
          milestone: m.title,
        }))
      )
    : [];

  const context = `Founder: ${founder.name || "Unknown"}
Startup: ${startup.name}
Stage: ${startup.stage}
Target customer: ${startup.targetCustomer || "Not specified"}

Active goal: ${goal?.title || "No active goal"}
Goal success criteria: ${goal?.definitionOfSuccess || "Not specified"}
Target date: ${goal?.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "No target date"}

Tasks (${allTasks.length}):
${allTasks.map((t) => `- ${t.title} [${t.status}] ${t.estimate ? `(${t.estimate}min)` : ""} in ${t.milestone}`).join("\n") || "None"}

Open blockers: ${startup.blockers.length}
${startup.blockers.map((b) => `- ${b.description}`).join("\n") || "None"}

Recent standups:
${startup.standups.map((s) => `- ${new Date(s.date).toLocaleDateString()}: ${s.today || "No plan"}`).join("\n") || "None"}

Recent evidence:
${startup.evidence.map((e) => `- ${e.type}: ${e.value ?? "N/A"} ${e.note ? `(${e.note})` : ""}`).join("\n") || "None"}

Recent journal:
${startup.journalEntries.map((j) => `- [${j.type}] ${j.content}`).join("\n") || "None"}`;

  const systemPrompt = `You are an AI copilot for a solo founder. You have access to their startup data above. Answer their questions using ONLY the data provided. Never fabricate information.

Rules:
- Reference specific tasks, goals, blockers, or evidence in your answers
- If the data is insufficient to answer, say so clearly
- Be concise and actionable
- Focus on what helps the founder make progress toward their goal
- If asked "what should I work on today", recommend based on the task list and goal alignment
- If asked about risks, identify blockers and missing evidence
- Keep responses under 200 words`;

  // Save user message
  const recentMessages = await prisma.copilotMessage.findMany({
    where: { startupId: startup.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const snapshotId = createHash("sha1").update(`${context}\n${recentMessages.map((m) => m.content).join("\n")}`).digest("hex").slice(0, 16);

  const founderMessage = await prisma.copilotMessage.create({
    data: {
      startupId: startup.id,
      founderId: founder.id,
      role: "FOUNDER",
      content: message,
      contextSnapshotId: snapshotId,
    },
  });

  const chatHistory = recentMessages.reverse().map((m) => `${m.role}: ${m.content}`).join("\n");

  const prompt = `${systemPrompt}

${context}

Recent conversation:
${chatHistory}

User: ${message}

AI:`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response.text();

  // Save AI response
  await prisma.copilotMessage.create({
    data: {
      startupId: startup.id,
      founderId: founder.id,
      role: "AI",
      content: response,
      contextSnapshotId: snapshotId,
    },
  });

  await track("copilot_message_sent", {
    founderId: founder.id,
    startupId: startup.id,
    entityId: founderMessage.id,
  });
  await track("ai_cost_incurred", {
    founderId: founder.id,
    startupId: startup.id,
    meta: { feature: "copilot", costUsd: Number(estimateCostUSD(prompt).toFixed(4)) },
  });

  return { response };
}

// ... after getCopilotHistory ...

export async function proposeSchedule() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const startup = await prisma.startup.findUnique({
    where: { id: ctx.startupId },
    include: {
      goals: {
        where: { isActive: true },
        include: { milestones: { include: { tasks: true } } },
        take: 1,
      },
      blockers: { where: { status: "OPEN" } },
    },
  });

  if (!startup || !startup.goals[0]) {
    throw new Error("No active goal found. Please set a goal first.");
  }

  const goal = startup.goals[0];
  const allTasks = goal.milestones.flatMap(m =>
    m.tasks.filter(t => t.status !== "DONE").map(t => ({
      id: t.id,
      title: t.title,
      estimate: t.estimateMinutes,
      milestone: m.title
    }))
  );

  const workingHours = ctx.founder.workingHours as { hoursPerDay?: number } || { hoursPerDay: 8 };

  const prompt = `You are an AI schedule assistant. Propose a realistic daily schedule for a founder.
Founder's available time: ${workingHours.hoursPerDay} hours.
Active Goal: ${goal.title}
Tasks:
${allTasks.map(t => `- ${t.id}: ${t.title} (${t.estimate ?? 30}min) in ${t.milestone}`).join("\n")}
Open Blockers:
${startup.blockers.map(b => `- ${b.description}`).join("\n")}

Provide a JSON response with a "schedule" array of objects: { "taskId": string, "startTime": "HH:mm" }.
Start from 9:00 AM. Ensure tasks don't overlap and total time is within ${workingHours.hoursPerDay} hours.
Only include the most important tasks.
Return ONLY the JSON.`;

  const result = await geminiModel.generateContent(prompt);
  const responseText = result.response.text();

  try {
    const json = JSON.parse(responseText.replace(/```json|```/g, ""));
    return json.schedule;
  } catch (e) {
    console.error("Failed to parse AI schedule:", responseText);
    throw new Error("AI failed to generate a valid schedule. Please try again.");
  }
}

export async function applyProposedSchedule(schedule: { taskId: string; startTime: string }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.$transaction(
    schedule.map(item => {
      const [hours, minutes] = item.startTime.split(":").map(Number);
      const scheduledDate = new Date(today);
      scheduledDate.setHours(hours, minutes, 0, 0);

      return prisma.task.update({
        where: { id: item.taskId },
        data: { scheduledFor: scheduledDate },
      });
    })
  );

  revalidatePath("/today");
  return { success: true };
}

