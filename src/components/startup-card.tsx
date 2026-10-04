"use client";

import { useRouter } from "next/navigation";
import { switchStartup } from "@/lib/actions/startups";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StartupCardProps {
  startup: {
    id: string;
    name: string;
    stage: string;
    industry: string | null;
    _count: { goals: number };
  };
  isActive: boolean;
}

export function StartupCard({ startup, isActive }: StartupCardProps) {
  const router = useRouter();

  const handleSwitch = async () => {
    if (!isActive) {
      await switchStartup(startup.id);
      router.push("/today");
      router.refresh();
    }
  };

  return (
    <div
      className={`rounded-xl border p-6 ${
        isActive ? "border-primary/40 bg-card ring-1 ring-primary/10" : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-muted">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        {isActive && (
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1">{startup.name}</h3>
      <p className="text-sm text-muted-foreground mb-5 capitalize">
        {startup.stage} Stage · {startup.industry || "no industry set"}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {startup._count.goals} goal{startup._count.goals === 1 ? "" : "s"}
        </span>
        <Button size="sm" variant="outline" onClick={handleSwitch} disabled={isActive}>
          {isActive ? "Current startup" : (
            <>
              Switch <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}