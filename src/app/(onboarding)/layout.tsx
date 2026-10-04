import Link from "next/link";
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
          <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-contain" />
          <h1 className="text-xl font-bold tracking-tight">FounderFlow</h1>
        </Link>
        {children}
      </div>
    </div>
  );
}
