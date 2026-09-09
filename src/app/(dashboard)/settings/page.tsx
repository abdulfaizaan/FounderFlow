import { ThemeSettings } from "@/components/dashboard/theme-settings";
import { ProfileSettings } from "@/components/dashboard/profile-settings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-2 text-muted-foreground">
          Account and startup preferences.
        </p>
      </div>
      <ProfileSettings />
      <ThemeSettings />
    </div>
  );
}