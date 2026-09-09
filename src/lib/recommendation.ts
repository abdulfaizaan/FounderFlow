export interface TaskInput {
  id: string;
  title: string;
  description: string | null;
  status: string;
  estimateMinutes: number | null;
  dueDate: Date | null;
  createdAt: Date;
  milestone: {
    id: string;
    title: string;
    goal: {
      id: string;
      title: string;
      isActive: boolean;
    };
  };
}

interface Context {
  goalId: string;
  availableMinutes: number;
  openBlockerTaskIds: string[];
  recentEvidenceMilestoneIds: string[];
  taskIdsToSnooze: string[];
  founderPreferenceMilestoneIds: string[];
}

export interface ScoredTask {
  taskId: string;
  title: string;
  description: string | null;
  score: number;
  confidence: number;
  actionText: string;
  rationale: string;
  goalTitle: string;
  milestoneTitle: string;
  estimateMinutes: number;
  dueDate: Date | null;
}

export const WEIGHTS = {
  goalAlignment: 0.30,
  deadlineProximity: 0.20,
  effortFit: 0.15,
  blockerRemoval: 0.15,
  milestoneOrder: 0.05,
  noRecentEvidence: 0.10,
  founderPreference: 0.05,
} as const;

function scoreGoalAlignment(task: TaskInput, goalId: string): number {
  return task.milestone.goal.id === goalId && task.milestone.goal.isActive ? 1.0 : 0.0;
}

function scoreDeadlineProximity(task: TaskInput): number {
  if (!task.dueDate) return 0.3;
  const now = new Date();
  const daysUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysUntilDue <= 2) return 1.0;
  if (daysUntilDue <= 7) return 0.5;
  return 0.1;
}

function scoreEffortFit(task: TaskInput, availableMinutes: number): number {
  const estimate = task.estimateMinutes ?? 30;
  return estimate <= availableMinutes ? 1.0 : 0.3;
}

function scoreBlockerRemoval(task: TaskInput, openBlockerTaskIds: string[]): number {
  return openBlockerTaskIds.includes(task.id) ? 1.0 : 0.0;
}

function scoreMilestoneOrder(task: TaskInput, allTasks: TaskInput[]): number {
  const milestoneTasks = allTasks
    .filter((t) => t.milestone.id === task.milestone.id && t.status !== "ARCHIVED")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const firstTodo = milestoneTasks.find((t) => t.status === "TODO");
  return firstTodo?.id === task.id ? 1.0 : 0.3;
}

function scoreNoRecentEvidence(task: TaskInput, recentEvidenceMilestoneIds: string[]): number {
  return recentEvidenceMilestoneIds.includes(task.milestone.id) ? 0.2 : 1.0;
}

function scoreFounderPreference(
  task: TaskInput,
  founderPreferenceMilestoneIds: string[]
): number {
  return founderPreferenceMilestoneIds.includes(task.milestone.id) ? 1.0 : 0.0;
}

function generateRationale(task: TaskInput, scores: Record<string, number>): string {
  if (scores.blockerRemoval === 1.0) return "Removing a blocker unlocks other work";
  if (scores.goalAlignment === 1.0 && scores.deadlineProximity >= 0.5) {
    return `Directly advances "${task.milestone.goal.title}" and is due soon`;
  }
  if (scores.goalAlignment === 1.0) return `Directly advances "${task.milestone.goal.title}"`;
  if (scores.deadlineProximity >= 0.5) return "Due soon — best to tackle now";
  if (scores.effortFit === 1.0) return "Fits your available time today";
  return "Next in your milestone sequence";
}

export function rankTasks(tasks: TaskInput[], context: Context): ScoredTask[] {
  const scored = tasks
    .filter((t) => t.status === "TODO" && !context.taskIdsToSnooze.includes(t.id))
    .map((task) => {
      const scores = {
        goalAlignment: scoreGoalAlignment(task, context.goalId),
        deadlineProximity: scoreDeadlineProximity(task),
        effortFit: scoreEffortFit(task, context.availableMinutes),
        blockerRemoval: scoreBlockerRemoval(task, context.openBlockerTaskIds),
        milestoneOrder: scoreMilestoneOrder(task, tasks),
        noRecentEvidence: scoreNoRecentEvidence(task, context.recentEvidenceMilestoneIds),
        founderPreference: scoreFounderPreference(task, context.founderPreferenceMilestoneIds),
      };

      const score =
        scores.goalAlignment * WEIGHTS.goalAlignment +
        scores.deadlineProximity * WEIGHTS.deadlineProximity +
        scores.effortFit * WEIGHTS.effortFit +
        scores.blockerRemoval * WEIGHTS.blockerRemoval +
        scores.milestoneOrder * WEIGHTS.milestoneOrder +
        scores.noRecentEvidence * WEIGHTS.noRecentEvidence +
        scores.founderPreference * WEIGHTS.founderPreference;

      return {
        taskId: task.id,
        title: task.title,
        description: task.description,
        score,
        confidence: Math.round(score * 100),
        actionText: task.title,
        rationale: generateRationale(task, scores),
        goalTitle: task.milestone.goal.title,
        milestoneTitle: task.milestone.title,
        estimateMinutes: task.estimateMinutes ?? 30,
        dueDate: task.dueDate,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored;
}

export function getRecommendation(scored: ScoredTask[]) {
  if (scored.length === 0) return null;
  const primary = scored[0];
  const alternatives = scored.slice(1, 3).filter((s) => s.score > 0.3);
  return { primary, alternatives };
}
