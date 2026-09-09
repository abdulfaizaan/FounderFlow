"use client";

interface Task {
  title: string;
  estimateMinutes: number;
}

interface StepTasksProps {
  data: { milestoneTitle: string; tasks: Task[] };
  updateData: (partial: { milestoneTitle?: string; tasks?: Task[] }) => void;
}

export function StepTasks({ data, updateData }: StepTasksProps) {
  const updateTask = (index: number, field: keyof Task, value: string | number) => {
    const newTasks = [...data.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    updateData({ tasks: newTasks });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="milestoneTitle" className="block text-sm font-medium mb-1">
          First milestone
        </label>
        <input
          id="milestoneTitle"
          type="text"
          value={data.milestoneTitle}
          onChange={(e) => updateData({ milestoneTitle: e.target.value })}
          placeholder="e.g. First customer outreach"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          First 3 tasks
        </label>
        <div className="space-y-3">
          {data.tasks.map((task, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={task.title}
                onChange={(e) => updateTask(i, "title", e.target.value)}
                placeholder={`Task ${i + 1}`}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={task.estimateMinutes}
                onChange={(e) => updateTask(i, "estimateMinutes", parseInt(e.target.value) || 0)}
                min={0}
                className="w-20 rounded-md border bg-background px-3 py-2 text-sm"
              />
              <span className="self-center text-xs text-muted-foreground">min</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
