"use client";

interface StepPersonalProps {
  data: { name: string; timezone: string; availableHoursPerDay: number };
  updateData: (partial: {
    name?: string;
    timezone?: string;
    availableHoursPerDay?: number;
  }) => void;
}

export function StepPersonal({ data, updateData }: StepPersonalProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="e.g. Sarah"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium mb-1">
          Timezone
        </label>
        <select
          id="timezone"
          value={data.timezone}
          onChange={(e) => updateData({ timezone: e.target.value })}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Berlin">Berlin</option>
          <option value="Asia/Kolkata">India (IST)</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Asia/Shanghai">Shanghai</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>
      <div>
        <label htmlFor="hours" className="block text-sm font-medium mb-1">
          Focus hours per workday
        </label>
        <input
          id="hours"
          type="number"
          min={1}
          max={16}
          value={data.availableHoursPerDay}
          onChange={(e) =>
            updateData({ availableHoursPerDay: Number(e.target.value) || 8 })
          }
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          How much time you can realistically spend on your startup each day. We use this to fit recommendations.
        </p>
      </div>
    </div>
  );
}
