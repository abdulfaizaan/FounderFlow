import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export type StartupWithGoal = Prisma.StartupGetPayload<{
  include: {
    goals: {
      where: { isActive: true };
      include: {
        milestones: {
          include: {
            tasks: {
              where: { status: { notIn: ["ARCHIVED", "DONE"] } };
              include: { milestone: { include: { goal: true } } };
            };
          };
        };
      };
      take: 1;
    };
  };
}>;

// Resolves the founder's active startup id given an optional URL override.
// Ownership-checked; returns null if the founder has no startups.
export async function resolveActiveStartupId(
  founder: { id: string; activeStartupId: string | null },
  startupIds: string[],
  startupParam?: string | null
): Promise<string | null> {
  if (startupIds.length === 0) return null;

  let activeStartupId = founder.activeStartupId;

  if (startupParam && startupIds.includes(startupParam)) {
    activeStartupId = startupParam;
    if (founder.activeStartupId !== startupParam) {
      await prisma.founder.update({
        where: { id: founder.id },
        data: { activeStartupId: startupParam },
      });
    }
  }

  if (!activeStartupId || !startupIds.includes(activeStartupId)) {
    activeStartupId = startupIds[0];
  }

  return activeStartupId;
}

// Server-action friendly: returns { founder, startupId } or null. No redirects.
export async function getActiveStartupIdForUser(userId: string, startupParam?: string | null) {
  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
    include: { startups: { orderBy: { createdAt: "asc" }, select: { id: true } } },
  });

  if (!founder || founder.startups.length === 0) return null;

  const startupId = await resolveActiveStartupId(
    founder,
    founder.startups.map((s) => s.id),
    startupParam
  );

  if (!startupId) return null;

  return { founder, startupId };
}

// Available working minutes per day; falls back to 8h when unset.
export function getAvailableMinutes(founder: { workingHours: unknown }): number {
  const wh = founder.workingHours as { hoursPerDay?: number } | null;
  const hours = wh?.hoursPerDay ?? 8;
  return Math.min(16, Math.max(1, hours)) * 60;
}

// Milestones the founder has rated net-positive via recommendation feedback.
export async function getFounderPreferenceMilestoneIds(startupId: string): Promise<string[]> {
  const rated = await prisma.recommendation.findMany({
    where: { startupId, feedback: { in: ["HELPFUL", "NOT_HELPFUL"] } },
    select: { feedback: true, task: { select: { milestoneId: true } } },
  });

  const net = new Map<string, number>();
  for (const r of rated) {
    if (!r.task) continue;
    const delta = r.feedback === "HELPFUL" ? 1 : -1;
    net.set(r.task.milestoneId, (net.get(r.task.milestoneId) ?? 0) + delta);
  }

  return [...net.entries()].filter(([, v]) => v > 0).map(([id]) => id);
}

export async function getActiveStartup(startupParam?: string | null) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
    include: {
      startups: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, createdAt: true },
      },
    },
  });

  if (!founder || founder.startups.length === 0) {
    redirect("/onboarding");
  }

  const activeStartupId = await resolveActiveStartupId(
    founder,
    founder.startups.map((s) => s.id),
    startupParam
  );

  if (!activeStartupId) redirect("/onboarding");

  const startup = await prisma.startup.findUnique({
    where: { id: activeStartupId },
    include: {
      goals: {
        where: { isActive: true },
        include: {
          milestones: {
            include: {
              tasks: {
                where: { status: { notIn: ["ARCHIVED", "DONE"] } },
                include: { milestone: { include: { goal: true } } },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        take: 1,
      },
    },
  });

  if (!startup) redirect("/onboarding");

  return { founder, startup };
}