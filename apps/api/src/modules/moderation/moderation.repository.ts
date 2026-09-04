import type { UserRole, UserStatus } from '../users/users.repository';

export type ReportStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED';
export type ReportTargetType = 'USER' | 'POST' | 'COMMENT';

export type ReportRecord = {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason?: string;
  status: ReportStatus;
  createdAt: Date;
  reviewedBy?: string;
};

export type AuditRecord = {
  id: string;
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};

export const reports: ReportRecord[] = [];
export const auditLogs: AuditRecord[] = [];

const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export class ModerationRepository {
  static createReport(input: Omit<ReportRecord, 'id' | 'createdAt' | 'status'>): ReportRecord {
    const report: ReportRecord = { ...input, id: id('report'), status: 'OPEN', createdAt: new Date() };
    reports.push(report);
    return report;
  }

  static listReports(status?: ReportStatus): ReportRecord[] {
    return reports.filter((report) => !status || report.status === status);
  }

  static findReport(reportId: string): ReportRecord | undefined {
    return reports.find((report) => report.id === reportId);
  }

  static updateReport(report: ReportRecord, status: ReportStatus, reviewerId: string): ReportRecord {
    report.status = status;
    report.reviewedBy = reviewerId;
    return report;
  }

  static createAudit(input: Omit<AuditRecord, 'id' | 'createdAt'>): AuditRecord {
    const record: AuditRecord = { ...input, id: id('audit'), createdAt: new Date() };
    auditLogs.push(record);
    return record;
  }

  static listAuditLogs(): AuditRecord[] {
    return auditLogs;
  }

  static serializeUserStatus(status: UserStatus, role: UserRole) {
    return { role, status };
  }
}
