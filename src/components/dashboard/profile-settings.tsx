"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/actions/startups";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [founderData, setFounderData] = useState({ name: "", timezone: "", hoursPerDay: 8 });
  const [startupData, setStartupData] = useState({ name: "", industry: "", website: "", description: "" });

  useEffect(() => {
    getProfile()
      .then((profile) => {
        if (profile) {
          setFounderData(profile.founder);
          if (profile.startup) setStartupData(profile.startup);
        }
        setFetching(false);
      })
      .catch(() => {
        toast.error("Could not load your profile");
        setFetching(false);
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: founderData.name,
        timezone: founderData.timezone,
        hoursPerDay: founderData.hoursPerDay,
        startupName: startupData.name,
        industry: startupData.industry,
        website: startupData.website,
        description: startupData.description,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-6">Personal profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={founderData.name}
              onChange={(e) => setFounderData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={founderData.timezone}
              onChange={(e) => setFounderData((p) => ({ ...p, timezone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hours">Daily focus hours</Label>
            <Input
              id="hours"
              type="number"
              value={founderData.hoursPerDay}
              onChange={(e) => setFounderData((p) => ({ ...p, hoursPerDay: Number(e.target.value) }))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-6">Active startup</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startup-name">Startup name</Label>
            <Input
              id="startup-name"
              value={startupData.name}
              onChange={(e) => setStartupData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={startupData.industry}
              onChange={(e) => setStartupData((p) => ({ ...p, industry: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={startupData.website}
              onChange={(e) => setStartupData((p) => ({ ...p, website: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={startupData.description}
              onChange={(e) => setStartupData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}