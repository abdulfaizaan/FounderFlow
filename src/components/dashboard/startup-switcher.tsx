"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { switchStartup, createStartup } from "@/lib/actions/startups";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown, Check, Plus, Building2, Zap } from "lucide-react";

interface Startup {
  id: string;
  name: string;
  stage: string;
  isPrimary: boolean;
}

interface StartupSwitcherProps {
  startups: Startup[];
  activeStartupId: string;
}

const STAGES = ["idea", "mvp", "launched", "growing"];

export function StartupSwitcher({ startups, activeStartupId }: StartupSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [stage, setStage] = useState("idea");
  const [saving, setSaving] = useState(false);

  const active = startups.find((s) => s.id === activeStartupId) ?? startups[0];

  const handleSwitch = async (id: string) => {
    setOpen(false);
    if (id === activeStartupId) return;
    await switchStartup(id);
    router.push("/today");
    router.refresh();
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createStartup({ name: name.trim(), stage });
      setOpen(false);
      setCreating(false);
      setName("");
      setStage("idea");
      router.push("/today");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border bg-card px-3 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2 truncate">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate">{active?.name ?? "Startup"}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 w-full rounded-xl border bg-card p-2 shadow-xl"
            >
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your startups
              </p>
              {startups.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSwitch(s.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                    s.id === activeStartupId
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1 text-left">{s.name}</span>
                  {s.id === activeStartupId && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))}

              <div className="my-2 border-t" />

              {!creating ? (
                <button
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  New startup
                </button>
              ) : (
                <div className="space-y-2 px-2 py-1">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Startup name"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <div className="flex gap-1">
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStage(s)}
                        className={`flex-1 rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors ${
                          stage === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={saving || !name.trim()}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4" />
                    {saving ? "Creating..." : "Create startup"}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}