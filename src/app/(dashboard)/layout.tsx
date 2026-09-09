import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  const founder = userId
    ? await prisma.founder.findUnique({
        where: { clerkId: userId },
        include: {
          startups: {
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, stage: true, isPrimary: true },
          },
        },
      })
    : null;

  const startups = founder?.startups ?? [];
  const activeStartupId =
    (founder?.activeStartupId && startups.some((s) => s.id === founder.activeStartupId))
      ? founder.activeStartupId
      : startups[0]?.id ?? null;

  return (
    <DashboardShell startups={startups} activeStartupId={activeStartupId}>
      {children}
    </DashboardShell>
  );
}