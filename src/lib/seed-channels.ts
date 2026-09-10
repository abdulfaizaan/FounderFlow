import { prisma } from "@/lib/prisma";

async function seedChannels() {
  const channels = [
    { name: "general", description: "Main hangout for all founders" },
    { name: "fundraising", description: "Discuss pitch decks and VC relations" },
    { name: "growth", description: "User acquisition and marketing strategies" },
    { name: "tech-stack", description: "Tools, frameworks, and infrastructure" },
    { name: "mental-health", description: "The emotional side of the founder journey" },
  ];

  for (const channel of channels) {
    await prisma.channel.upsert({
      where: { id: channel.name }, // This won't work because id is cuid. I'll use a different check.
      update: {},
      create: channel,
    });
  }
}
