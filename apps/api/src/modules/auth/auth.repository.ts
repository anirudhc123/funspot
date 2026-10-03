import { createHash } from 'crypto';

import { prisma } from '../../database/prisma';
import { UsersRepository, type UserRecord } from '../users/users.repository';

export type SessionRecord = {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
};

export type ResetTokenRecord = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
};

export type VerificationTokenRecord = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
};

// Password-reset and email-verification tokens intentionally remain in memory until their schema models exist.
export const resetTokens: ResetTokenRecord[] = [];
export const verificationTokens: VerificationTokenRecord[] = [];

const hashRefreshToken = (token: string) => createHash('sha256').update(token).digest('hex');

export class AuthRepository {
  static findByEmail(email: string): Promise<UserRecord | undefined> {
    return UsersRepository.findByEmail(email);
  }

  static findByUsername(username: string): Promise<UserRecord | undefined> {
    return UsersRepository.findByUsernameInsensitive(username);
  }

  static findById(id: string): Promise<UserRecord | undefined> {
    return UsersRepository.findById(id);
  }

  static createUser(input: Pick<UserRecord, 'email' | 'username' | 'displayName' | 'passwordHash' | 'privacy'>): Promise<UserRecord> {
    return UsersRepository.create(input);
  }

  static async createSession(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<SessionRecord> {
    const session = await prisma.$transaction(async (transaction) => {
      const created = await transaction.session.create({
        data: { userId, userAgent, ip: ipAddress, expiresAt },
      });
      await transaction.refreshToken.create({
        data: { userId, sessionId: created.id, tokenHash: hashRefreshToken(refreshToken) },
      });
      return created;
    });
    return {
      id: session.id,
      userId: session.userId,
      userAgent: session.userAgent ?? undefined,
      ipAddress: session.ip ?? undefined,
      expiresAt: session.expiresAt ?? expiresAt,
      createdAt: session.createdAt,
    };
  }

  static async findSessionByRefreshToken(refreshToken: string): Promise<SessionRecord | undefined> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(refreshToken) },
      include: { session: true },
    });
    if (!storedToken || storedToken.revoked || !storedToken.session) return undefined;
    return {
      id: storedToken.session.id,
      userId: storedToken.session.userId,
      userAgent: storedToken.session.userAgent ?? undefined,
      ipAddress: storedToken.session.ip ?? undefined,
      expiresAt: storedToken.session.expiresAt ?? storedToken.createdAt,
      createdAt: storedToken.session.createdAt,
    };
  }

  static async revokeSession(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashRefreshToken(refreshToken), revoked: false },
      data: { revoked: true },
    });
  }

  static async revokeUserSessions(userId: string): Promise<void> {
    const revokedAt = new Date();
    await prisma.$transaction([
      prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } }),
      prisma.session.updateMany({ where: { userId }, data: { expiresAt: revokedAt } }),
    ]);
  }

  static createResetToken(userId: string, token: string, expiresAt: Date): ResetTokenRecord {
    const record = {
      id: `reset-${Date.now()}`,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    resetTokens.push(record);
    return record;
  }

  static getResetToken(token: string): ResetTokenRecord | undefined {
    return resetTokens.find((r) => r.token === token && !r.usedAt && r.expiresAt > new Date());
  }

  static consumeResetToken(token: string): void {
    const record = resetTokens.find((r) => r.token === token);
    if (record) record.usedAt = new Date();
  }

  static createVerificationToken(userId: string, token: string, expiresAt: Date): VerificationTokenRecord {
    const record = {
      id: `verify-${Date.now()}`,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    verificationTokens.push(record);
    return record;
  }

  static getVerificationToken(token: string): VerificationTokenRecord | undefined {
    return verificationTokens.find((r) => r.token === token && !r.usedAt && r.expiresAt > new Date());
  }

  static consumeVerificationToken(token: string): void {
    const record = verificationTokens.find((r) => r.token === token);
    if (record) record.usedAt = new Date();
  }
}
