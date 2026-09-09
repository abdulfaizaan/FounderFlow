export interface TemplateTask {
  title: string;
  estimateMinutes: number;
}

export interface GoalTemplate {
  id: string;
  label: string;
  description: string;
  goalTitle: string;
  definitionOfSuccess: string;
  milestoneTitle: string;
  tasks: TemplateTask[];
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: "first-10-customers",
    label: "First 10 paying customers",
    description: "Convert warm prospects into paying customers.",
    goalTitle: "Get my first 10 paying customers",
    definitionOfSuccess: "10 customers paying for 2 consecutive months",
    milestoneTitle: "Customer conversion sprint",
    tasks: [
      { title: "List everyone who has shown interest and qualify their urgency", estimateMinutes: 30 },
      { title: "Offer 5 prospects a founding discount and ask to close", estimateMinutes: 45 },
      { title: "Collect feedback from the first 3 customers and tighten the pitch", estimateMinutes: 45 },
    ],
  },
  {
    id: "launch-mvp",
    label: "Launch my MVP",
    description: "Ship a lean version to real users fast.",
    goalTitle: "Launch my MVP to real users",
    definitionOfSuccess: "MVP live and used by 20 target users this month",
    milestoneTitle: "MVP launch",
    tasks: [
      { title: "Cut scope to one core promise and write the launch checklist", estimateMinutes: 30 },
      { title: "Publish the MVP and invite 10 waitlist users", estimateMinutes: 60 },
      { title: "Fix the top 3 onboarding blockers reported by early users", estimateMinutes: 60 },
    ],
  },
  {
    id: "validate-problem",
    label: "Validate the problem",
    description: "Confirm the problem is painful and worth paying for.",
    goalTitle: "Validate that the problem is worth solving",
    definitionOfSuccess: "20 target founders agree the problem is painful and worth paying for",
    milestoneTitle: "Problem validation",
    tasks: [
      { title: "Run 5 customer interviews on the problem and current workaround", estimateMinutes: 60 },
      { title: "Synthesize pain points and rank the most mentioned", estimateMinutes: 30 },
      { title: "Test willingness to pay with 5 serious prospects", estimateMinutes: 45 },
    ],
  },
  {
    id: "audience",
    label: "Build an audience",
    description: "Become discoverable to early buyers.",
    goalTitle: "Build an audience of 500 target founders",
    definitionOfSuccess: "500 engaged followers or 50 inbound conversations",
    milestoneTitle: "Audience building",
    tasks: [
      { title: "Define the 3 topics your buyers care about", estimateMinutes: 30 },
      { title: "Publish 3 posts this week on one of those topics", estimateMinutes: 45 },
      { title: "Reply within 24h to every comment or DM", estimateMinutes: 15 },
    ],
  },
];