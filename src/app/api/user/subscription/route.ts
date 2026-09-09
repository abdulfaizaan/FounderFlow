import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const founder = await prisma.founder.findUnique({
      where: { clerkId: userId },
      select: { subscriptionStatus: true },
    });

    if (!founder) {
      return NextResponse.json({ error: "Founder profile not found" }, { status: 404 });
    }

    return NextResponse.json({ status: founder.subscriptionStatus });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
