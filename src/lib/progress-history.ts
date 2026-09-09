export interface WeekBucket {
  label: string;
  tasksDone: number;
  evidence: number;
  revenue: number;
}

export const HISTORY_WEEKS = 12;

export function weekStart(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function buildBuckets(): { buckets: WeekBucket[]; firstStart: Date } {
  const firstStart = weekStart(new Date());
  firstStart.setDate(firstStart.getDate() - (HISTORY_WEEKS - 1) * 7);

  const buckets: WeekBucket[] = [];
  for (let i = 0; i < HISTORY_WEEKS; i++) {
    const ws = new Date(firstStart);
    ws.setDate(firstStart.getDate() + i * 7);
    buckets.push({
      label: ws.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      tasksDone: 0,
      evidence: 0,
      revenue: 0,
    });
  }
  return { buckets, firstStart };
}

export function bucketIndexFor(weekStartDate: Date, firstStart: Date): number {
  return Math.floor((weekStartDate.getTime() - firstStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
}