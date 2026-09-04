import { AppError } from '../../errors/AppError';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository, type UserRole, type UserStatus } from '../users/users.repository';
import { ModerationRepository, type ReportStatus, type ReportTargetType } from './moderation.repository';

export class ModerationService {
  private static roleLevel(role: UserRole): number {
    return { USER: 0, MODERATOR: 1, ADMIN: 2, SUPER_ADMIN: 3 }[role];
  }

  private static assertCanManage(actorId: string, target: { id: string; role: UserRole }) {
    const actor = UsersRepository.findById(actorId);
    if (!actor || actor.id === target.id || ModerationService.roleLevel(actor.role) <= ModerationService.roleLevel(target.role)) {
      throw new AppError(403, 'INSUFFICIENT_PRIVILEGES', 'You cannot manage this account.');
    }
  }

  static createReport(reporterId: string, input: { targetType: ReportTargetType; targetId: string; reason?: string }) {
    if (input.targetType === 'USER' && !UsersRepository.findById(input.targetId)) {
      throw new AppError(404, 'REPORT_TARGET_NOT_FOUND', 'The reported user was not found.');
    }
    if (input.targetType === 'POST' && !PostsRepository.findById(input.targetId)) {
      throw new AppError(404, 'REPORT_TARGET_NOT_FOUND', 'The reported post was not found.');
    }
    return ModerationRepository.createReport({ reporterId, ...input });
  }

  static listReports(status?: ReportStatus) {
    return ModerationRepository.listReports(status);
  }

  static reviewReport(actorId: string, reportId: string, status: ReportStatus) {
    const report = ModerationRepository.findReport(reportId);
    if (!report) throw new AppError(404, 'REPORT_NOT_FOUND', 'Report was not found.');
    const updated = ModerationRepository.updateReport(report, status, actorId);
    ModerationRepository.createAudit({ actorId, action: 'REVIEW_REPORT', targetType: 'REPORT', targetId: reportId, metadata: { status } });
    return updated;
  }

  static listUsers() {
    return UsersRepository.listAll().map((user) => ({
      ...UsersRepository.serialize(user),
      ...ModerationRepository.serializeUserStatus(user.status, user.role),
    }));
  }

  static updateRole(actorId: string, userId: string, role: UserRole) {
    const user = UsersRepository.findById(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found.');
    ModerationService.assertCanManage(actorId, user);
    const actor = UsersRepository.findById(actorId);
    if (!actor || ModerationService.roleLevel(actor.role) < ModerationService.roleLevel(role)) {
      throw new AppError(403, 'INSUFFICIENT_PRIVILEGES', 'You cannot grant this role.');
    }
    user.role = role;
    UsersRepository.update(user, {});
    ModerationRepository.createAudit({ actorId, action: 'UPDATE_USER_ROLE', targetType: 'USER', targetId: userId, metadata: { role } });
    return UsersRepository.serialize(user);
  }

  static setUserStatus(actorId: string, userId: string, status: UserStatus, reason?: string, durationHours?: number) {
    const user = UsersRepository.findById(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found.');
    ModerationService.assertCanManage(actorId, user);
    user.status = status;
    user.suspendedUntil = status === 'SUSPENDED' && durationHours ? new Date(Date.now() + durationHours * 60 * 60 * 1000) : undefined;
    UsersRepository.update(user, {});
    ModerationRepository.createAudit({ actorId, action: status === 'BANNED' ? 'BAN_USER' : 'SUSPEND_USER', targetType: 'USER', targetId: userId, metadata: { reason, durationHours } });
    return ModerationRepository.serializeUserStatus(user.status, user.role);
  }

  static deletePost(actorId: string, postId: string, reason?: string) {
    const post = PostsRepository.findById(postId);
    if (!post) throw new AppError(404, 'POST_NOT_FOUND', 'Post was not found.');
    PostsRepository.delete(post);
    ModerationRepository.createAudit({ actorId, action: 'DELETE_CONTENT', targetType: 'POST', targetId: postId, metadata: { reason } });
    return { deleted: true };
  }

  static listAuditLogs() {
    return [...ModerationRepository.listAuditLogs()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static dashboard() {
    const users = UsersRepository.listAll();
    return {
      users: users.length,
      activeUsers: users.filter((user) => user.status === 'ACTIVE').length,
      suspendedUsers: users.filter((user) => user.status === 'SUSPENDED').length,
      bannedUsers: users.filter((user) => user.status === 'BANNED').length,
      posts: PostsRepository.count(),
      openReports: ModerationRepository.listReports('OPEN').length,
      auditEvents: ModerationRepository.listAuditLogs().length,
    };
  }
}
