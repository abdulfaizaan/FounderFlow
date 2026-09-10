import { prisma } from "@/lib/prisma";
import { getActiveStartup } from "@/lib/startup-context";
import { TaskManager } from "@/components/dashboard/task-manager";

export const dynamic = "force-dynamic";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ startup?: string }>;
}) {
  const { startup: startupParam } = await searchParams;
  const { startup } = await getActiveStartup(startupParam);

  const goal = await prisma.goal.findFirst({
    where: { startupId: startup.id, isActive: true },
    include: {
      milestones: {
        orderBy: { sortOrder: "asc" },
        include: {
          tasks: {
            orderBy: { createdAt: "asc" },
            where: { status: { not: "ARCHIVED" } },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plan</h1>
        <p className="text-muted-foreground mt-1">
          {startup.name} — milestones and tasks linked to your goal.
        </p>
      </div>

      {goal ? (
        <TaskManager
          goal={{ id: goal.id, title: goal.title }}
          milestones={goal.milestones.map((m) => ({
            id: m.id,
            title: m.title,
            status: m.status,
            tasks: m.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              estimateMinutes: t.estimateMinutes,
              dueDate: t.dueDate,
            })),
          }))}
        />
      ) : (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">No active goal yet. Set one up during onboarding.</p>
        </div>
      )}
    </div>
  );
}