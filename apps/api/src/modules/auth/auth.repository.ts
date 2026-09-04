import { UserRecord, users } from '../users/users.repository';

export type SessionRecord = {
  id: string;
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
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

export const sessions: SessionRecord[] = [];
export const resetTokens: ResetTokenRecord[] = [];
export const verificationTokens: VerificationTokenRecord[] = [];

export class AuthRepository {
  static findByEmail(email: string): UserRecord | undefined {
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  static findByUsername(username: string): UserRecord | undefined {
    return users.find((user) => user.username.toLowerCase() === username.toLowerCase());
  }

  static findById(id: string): UserRecord | undefined {
    return users.find((user) => user.id === id);
  }

  static createUser(input: Pick<UserRecord, 'email' | 'username' | 'displayName' | 'passwordHash' | 'privacy'>): UserRecord {
    const user: UserRecord = {
      id: `u-${Date.now()}`,
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      bio: undefined,
      avatar: undefined,
      coverImage: undefined,
      website: undefined,
      location: undefined,
      privacy: input.privacy ?? 'public',
      role: 'USER',
      status: 'ACTIVE',
      passwordHash: input.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    return user;
  }

  static createSession(userId: string, refreshToken: string, expiresAt: Date, userAgent?: string, ipAddress?: string): SessionRecord {
    const session: SessionRecord = {
      id: `session-${Date.now()}`,
      userId,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
      createdAt: new Date(),
    };
    sessions.push(session);
    return session;
  }

  static findSessionByRefreshToken(refreshToken: string): SessionRecord | undefined {
    return sessions.find((s) => s.refreshToken === refreshToken && !s.revokedAt);
  }

  static revokeSession(refreshToken: string): void {
    const session = sessions.find((s) => s.refreshToken === refreshToken);
    if (session) session.revokedAt = new Date();
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
