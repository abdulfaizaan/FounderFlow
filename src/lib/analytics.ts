import { prisma } from "@/lib/prisma";

export type AnalyticsMeta = Record<string, string | number | boolean | null>;

/**
 * Record a product event. Never carries raw journal, standup, or Copilot
 * content — only the event name, timing, entity IDs, and aggregate meta.
 * Fire-and-forget: analytics failures must never break the core flow.
 */
export async function track(
  event: string,
  opts: {
    founderId?: string | null;
    startupId?: string | null;
    entityId?: string | null;
    meta?: AnalyticsMeta;
  } = {}
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        event,
        founderId: opts.founderId ?? null,
        startupId: opts.startupId ?? null,
        entityId: opts.entityId ?? null,
        meta: (opts.meta ?? undefined) as object | undefined,
      },
    });
  } catch {
    // analytics must never break the request
  }
}