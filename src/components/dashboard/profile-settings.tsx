"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, User, Building2, Clock } from "lucide-react";

export function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [founderData, setFounderData] = useState({ name: "", timezone: "", hoursPerDay: 8 });
  const [startupData, setStartupData] = useState({ name: "", industry: "", website: "", description: "" });

  // In a real app, we'd fetch this from a server component or a hook
  // For now, we'll assume the data is passed or fetched in a useEffect

  const handleSave = async () => {
    setLoading(true);
    try {
      // Call server actions to update founder and startup
      // await updateFounderProfile(founderData);
      // await updateStartupDetails(startupData);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Personal Profile</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <input
              value={founderData.name}
              onChange={(e) => setFounderData(p => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Timezone</label>
            <input
              value={founderData.timezone}
              onChange={(e) => setFounderData(p => ({ ...p, timezone: e.target.value }))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Daily Focus Hours</label>
            <input
              type="number"
              value={founderData.hoursPerDay}
              onChange={(e) => setFounderData(p => ({ ...p, hoursPerDay: Number(e.target.value) }))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Active Startup</h3>
        </div>
        <div className="grid gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Startup Name</label>
            <input
              value={startupData.name}
              onChange={(e) => setStartupData(p => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Industry</label>
            <input
              value={startupData.industry}
              onChange={(e) => setStartupData(p => ({ ...p, industry: e.target.value }))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Website</label>
            <input
              value={startupData.website}
              onChange={(e) => setStartupData(p => ({ ...p, website: e.target.value }))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={startupData.description}
              onChange={(e) => setStartupData(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
