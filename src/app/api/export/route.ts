import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { buildExportData, toSectionedCSV } from "@/lib/export";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return new Response("No startup", { status: 404 });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";

  const startup = await prisma.startup.findUnique({
    where: { id: ctx.startupId },
    include: {
      goals: {
        include: {
          milestones: {
            include: { tasks: true },
          },
        },
      },
      standups: { orderBy: { date: "asc" } },
      evidence: { orderBy: { recordedAt: "asc" } },
      journalEntries: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!startup) return new Response("No startup", { status: 404 });

  const data = buildExportData(startup);

  if (format === "csv") {
    return new Response(toSectionedCSV(data), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="founderflow-export.csv"',
      },
    });
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="founderflow-export.json"',
    },
  });
}