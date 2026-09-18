export const SORT_FIELDS = {
  ISSUES: ["updatedAt", "dueDate", "priority", "createdAt", "title"] as const,
} as const;

export const SORT_ORDERS = ["asc", "desc"] as const;

export const ISSUE_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

export const ISSUE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const PROJECT_ROLES = ["OWNER", "MEMBER"] as const;
