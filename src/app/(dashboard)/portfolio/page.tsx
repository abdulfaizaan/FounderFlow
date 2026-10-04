import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { StartupCard } from "@/components/startup-card";
import { NewStartupDialog } from "@/components/startup-dialog";
import { redirect } from "next/navigation";

export default async function PortfolioPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) redirect("/onboarding");

  const startups = await prisma.startup.findMany({
    where: { founderId: ctx.founder.id },
    include: {
      _count: {
        select: { goals: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage your startups and ventures</p>
        </div>
        <NewStartupDialog />
      </div>

      {startups.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/40 p-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            You have no startups yet. Add one to start planning.
          </p>
          <NewStartupDialog />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {startups.map((startup) => (
            <StartupCard
              key={startup.id}
              startup={startup}
              isActive={startup.id === ctx.startupId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
