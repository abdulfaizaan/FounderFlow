import Link from "next/link";
import { Zap } from "lucide-react";
import { AmbientBackground } from "@/components/dashboard/ambient-background";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AmbientBackground />
      <div className="relative w-full max-w-lg">
        <Link href="/today" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6349ea] via-[#875fe0] to-[#0099ff] flex items-center justify-center shadow-lg shadow-primary/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FounderFlow</h1>
        </Link>
        {children}
      </div>
    </div>
  );
}
