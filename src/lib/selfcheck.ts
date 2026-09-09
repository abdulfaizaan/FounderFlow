import assert from "node:assert/strict";
import { rankTasks, WEIGHTS } from "./recommendation.ts";
import { buildBuckets, bucketIndexFor, weekStart } from "./progress-history.ts";
import { escapeCell, toSectionedCSV, buildExportData } from "./export.ts";
import type { TaskInput } from "./recommendation.ts";
import { GOAL_TEMPLATES } from "./templates.ts";

function task(over: Partial<TaskInput> & { id: string; milestoneId?: string; goalId?: string }): TaskInput {
  return {
    title: over.id,
    description: null,
    status: "TODO",
    estimateMinutes: 30,
    dueDate: null,
    createdAt: new Date("2026-01-01"),
    milestone: {
      id: over.milestoneId ?? "m",
      title: `M ${over.id}`,
      goal: {
        id: over.goalId ?? "g",
        title: "Goal",
        isActive: true,
      },
    },
    ...over,
  };
}

const baseContext = {
  goalId: "g",
  availableMinutes: 60,
  openBlockerTaskIds: [],
  recentEvidenceMilestoneIds: [],
  taskIdsToSnooze: [],
  founderPreferenceMilestoneIds: [],
};

const weightsSum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
assert.equal(Math.round(weightsSum * 100) / 100, 1, "weights must sum to 1.0");

const prefs = ["preferred"];
const tasks = [
  task({ id: "a", milestoneId: "preferred" }),
  task({ id: "b", milestoneId: "plain" }),
];

const withPref = rankTasks(tasks, {
  ...baseContext,
  founderPreferenceMilestoneIds: prefs,
}).map((s) => s.taskId);

assert.deepEqual(withPref, ["a", "b"], "preferred milestone task must rank first when preference active");

const again = rankTasks(tasks, { ...baseContext, founderPreferenceMilestoneIds: prefs }).map((s) => s.taskId);
assert.deepEqual(again, withPref, "same inputs must produce same order");

const { buckets, firstStart } = buildBuckets();
assert.equal(buckets.length, 12, "12 weekly buckets");
const midweek = new Date(firstStart);
midweek.setDate(midweek.getDate() + 3);
const midweekIndex = bucketIndexFor(weekStart(midweek), firstStart);
assert.equal(buckets[midweekIndex].label.length > 0, true, "midweek event lands in a labeled bucket");
const beforeStart = new Date(firstStart);
beforeStart.setDate(beforeStart.getDate() - 1);
assert.equal(bucketIndexFor(weekStart(beforeStart), firstStart), -1, "pre-window events are excluded");

const templateIds = new Set(GOAL_TEMPLATES.map((t) => t.id));
assert.equal(templateIds.size, GOAL_TEMPLATES.length, "template ids are unique");
for (const t of GOAL_TEMPLATES) {
  assert.ok(t.label.length > 0 && t.goalTitle.length > 0, `${t.id}: goal title present`);
  assert.ok(t.milestoneTitle.length > 0, `${t.id}: milestone title present`);
  assert.equal(t.tasks.length, 3, `${t.id}: exactly 3 tasks`);
  for (const task of t.tasks) {
    assert.ok(task.title.length > 0, `${t.id}: task titles non-empty`);
    assert.ok(Number.isInteger(task.estimateMinutes) && task.estimateMinutes > 0, `${t.id}: valid estimates`);
  }
}

const snoozed = rankTasks(tasks, {
  ...baseContext,
  taskIdsToSnooze: ["a"],
}).map((s) => s.taskId);
assert.deepEqual(snoozed, ["b"], "snoozed/dismissed task must drop out of ranking");

assert.equal(escapeCell("plain"), "plain", "plain cell unchanged");
assert.equal(escapeCell('has"quote'), '"has""quote"', "quotes doubled and wrapped");
assert.equal(escapeCell("has,comma"), '"has,comma"', "comma forces wrapping");
assert.equal(escapeCell("has\nnewline"), '"has\nnewline"', "newline forces wrapping");
const csv = toSectionedCSV(
  buildExportData({
    name: "Acme",
    stage: "launch",
    targetCustomer: "founders",
    goals: [
      {
        id: "g1",
        title: "Goal",
        targetDate: new Date(),
        targetValue: 10,
        definitionOfSuccess: null,
        milestones: [
          {
            id: "m1",
            title: "Milestone",
            status: "pending",
            tasks: [
              {
                id: "t1",
                title: 'call "prospects", then sync',
                description: null,
                status: "TODO",
                estimateMinutes: 30,
                dueDate: null,
                scheduledFor: null,
                createdAt: new Date(),
              },
            ],
          },
        ],
      },
    ],
    standups: [],
    evidence: [],
    journalEntries: [],
  })
);
assert.ok(csv.includes("# Tasks"), "Tasks section heading present");
assert.ok(
  csv.includes('"call ""prospects"", then sync"'),
  "quoted cell escaped in sectioned CSV"
);

console.log("selfcheck ok");