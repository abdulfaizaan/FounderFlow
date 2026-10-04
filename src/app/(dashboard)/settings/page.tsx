import { ThemeSettings } from "@/components/dashboard/theme-settings";
import { ProfileSettings } from "@/components/dashboard/profile-settings";
import { Reveal } from "@/components/reveal";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Account and startup preferences.
        </p>
      </Reveal>
      <ProfileSettings />
      <ThemeSettings />
    </div>
  );
}