"use client";

import { useTheme, type ThemeMode } from "@/components/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const options: { value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

export function ThemeSettings() {
  const { mode, setMode } = useTheme();

  return (
    <div className="card-hover rounded-2xl border bg-card p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Appearance
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        Choose how FounderFlow looks on this device.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {options.map((o) => {
          const Icon = o.icon;
          const active = mode === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setMode(o.value)}
              className={cn(
                "rounded-xl border p-4 text-center transition-colors duration-200",
                active
                  ? "border-primary bg-primary/5 text-foreground shadow-sm"
                  : "text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <Icon className={cn("mx-auto h-5 w-5 mb-2", active && "text-primary")} />
              <span className="block text-sm font-medium">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}