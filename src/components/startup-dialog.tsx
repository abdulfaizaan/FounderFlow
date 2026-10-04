"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStartup } from "@/lib/actions/startups";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STAGES = ["idea", "mvp", "launched", "growing"];

export function NewStartupDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [stage, setStage] = useState("idea");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await createStartup({ name: name.trim(), stage });
      setOpen(false);
      setName("");
      setStage("idea");
      toast.success("Startup created");
      router.refresh();
    } catch {
      toast.error("Could not create startup");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add Startup
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a startup</DialogTitle>
          <DialogDescription>Track another venture alongside your current one.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="startup-name">Name</Label>
            <Input
              id="startup-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Northwind Labs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Stage</Label>
            <div className="flex gap-1">
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                    stage === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={saving || !name.trim()}>
            {saving ? "Creating…" : "Create startup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}