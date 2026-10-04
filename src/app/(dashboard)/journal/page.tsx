import { prisma } from "@/lib/prisma";
import { getActiveStartup } from "@/lib/startup-context";
import { getWikiStructure } from "@/lib/actions/wiki";
import { NotesView } from "@/components/dashboard/notes-view";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ startup?: string; tab?: string }>;
}) {
  const { startup: startupParam, tab } = await searchParams;
  const { startup } = await getActiveStartup(startupParam);

  const [entries, wiki] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { startupId: startup.id },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    getWikiStructure(startup.id),
  ]);

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground mt-1">
          {startup.name} — journal captures and your team&apos;s living knowledge.
        </p>
      </Reveal>
      <NotesView
        entries={entries}
        initialStructure={wiki}
        startupId={startup.id}
        defaultTab={tab === "wiki" ? "wiki" : "journal"}
      />
    </div>
  );
}