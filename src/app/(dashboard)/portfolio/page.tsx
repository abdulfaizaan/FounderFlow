import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { StartupCard } from "@/components/startup-card";
import { Plus } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage your startups and ventures</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
          <Plus className="h-4 w-4" /> Add Startup
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {startups.map((startup) => (
          <StartupCard
            key={startup.id}
            startup={startup}
            isActive={startup.id === ctx.startupId}
          />
        ))}
      </div>
    </div>
  );
}
