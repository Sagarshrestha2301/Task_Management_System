export type AuditEntry = {
  action: string;
  resourceType: string;
  resourceId?: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
};
