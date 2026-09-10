export const JOURNAL_TYPES = [
  "IDEA",
  "DECISION",
  "LESSON",
  "WIN",
  "FAILURE",
  "CUSTOMER_INSIGHT",
] as const;

export type JournalType = (typeof JOURNAL_TYPES)[number];
