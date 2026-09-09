import { prisma } from "@/lib/prisma";

export const MONTHLY_COPILOT_LIMIT = 100;

export async function getCopilotUsage(founderId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.copilotMessage.count({
    where: { founderId, role: "AI", createdAt: { gte: startOfMonth } },
  });

  return { used, limit: MONTHLY_COPILOT_LIMIT };
}

// ponytail: rough Gemini blend (~$0.02 /1k tokens, ~4 chars/token); calibrate once real invoices exist
export function estimateCostUSD(text: string): number {
  return (text.length / 4 / 1000) * 0.02;
}