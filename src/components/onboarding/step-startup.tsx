"use client";

interface StepStartupProps {
  data: { startupName: string; stage: string; targetCustomer: string };
  updateData: (partial: { startupName?: string; stage?: string; targetCustomer?: string }) => void;
}

export function StepStartup({ data, updateData }: StepStartupProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="startupName" className="block text-sm font-medium mb-1">
          Startup name
        </label>
        <input
          id="startupName"
          type="text"
          value={data.startupName}
          onChange={(e) => updateData({ startupName: e.target.value })}
          placeholder="e.g. TaskFlow"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="stage" className="block text-sm font-medium mb-1">
          Stage
        </label>
        <select
          id="stage"
          value={data.stage}
          onChange={(e) => updateData({ stage: e.target.value })}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="idea">Idea</option>
          <option value="validate">Validating</option>
          <option value="growth">Growing</option>
        </select>
      </div>
      <div>
        <label htmlFor="targetCustomer" className="block text-sm font-medium mb-1">
          Who is your target customer?
        </label>
        <input
          id="targetCustomer"
          type="text"
          value={data.targetCustomer}
          onChange={(e) => updateData({ targetCustomer: e.target.value })}
          placeholder="e.g. Freelance designers who need invoicing"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
