import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { AppError } from '../../errors/AppError';
import { AuthRepository } from './auth.repository';
import { UsersRepository, UserRecord } from '../users/users.repository';
import { env } from '../../config/env';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export class AuthService {
  static async register(input: { email: string; username: string; displayName: string; password: string }) {
    if (await AuthRepository.findByEmail(input.email)) {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'That email is already registered.');
    }

    if (await AuthRepository.findByUsername(input.username)) {
      throw new AppError(409, 'USERNAME_ALREADY_EXISTS', 'That username is already taken.');
    }

    if (input.password.length < 8 || !/[0-9]/.test(input.password) || !/[A-Z]/.test(input.password)) {
      throw new AppError(400, 'INVALID_PASSWORD', 'Password must be at least 8 characters and include a number and uppercase letter.');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await AuthRepository.createUser({
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      passwordHash,
      privacy: 'public',
    });

    const tokens = AuthService.issueTokens(user);
    await AuthRepository.createSession(user.id, tokens.refreshToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));

    return {
      user: AuthService.safeUser(user),
      ...tokens,
    };
  }

  static async login(input: { email?: string; username?: string; password: string }) {
    const identifier = input.email ?? input.username;
    const user = identifier
      ? (await AuthRepository.findByEmail(identifier)) ?? (await AuthRepository.findByUsername(identifier))
      : undefined;

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Login failed.');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Wrong password.');
    }

    const tokens = AuthService.issueTokens(user);
    await AuthRepository.createSession(user.id, tokens.refreshToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));

    return {
      user: AuthService.safeUser(user),
      ...tokens,
    };
  }

  static async logout(refreshToken: string) {
    await AuthRepository.revokeSession(refreshToken);
    return { loggedOut: true };
  }

  static async refresh(refreshToken: string) {
    let payload: jwt.JwtPayload;
    try {
      const verified = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
        issuer: 'funspot',
        audience: 'funspot-api',
        algorithms: ['HS256'],
      });
      if (typeof verified === 'string' || verified.type !== 'refresh' || typeof verified.sub !== 'string') {
        throw new Error('Invalid refresh token.');
      }
      payload = verified;
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid.');
    }

    const session = await AuthRepository.findSessionByRefreshToken(refreshToken);
    if (!session || !payload.sub || session.expiresAt <= new Date()) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid.');
    }

    const user = await AuthRepository.findById(session.userId);
    if (!user) throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid.');

    const newTokens = AuthService.issueTokens(user);
    await AuthRepository.revokeSession(refreshToken);
    await AuthRepository.createSession(user.id, newTokens.refreshToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));

    return { user: AuthService.safeUser(user), ...newTokens };
  }

  static async forgotPassword(email: string) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) {
      return { sent: true };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    AuthRepository.createResetToken(user.id, token, expiresAt);
    void token;
    return { sent: true };
  }

  static async resetPassword(token: string, password: string) {
    const record = AuthRepository.getResetToken(token);
    if (!record) throw new AppError(400, 'INVALID_RESET_TOKEN', 'Reset token is invalid.');

    if (password.length < 8 || !/[0-9]/.test(password) || !/[A-Z]/.test(password)) {
      throw new AppError(400, 'INVALID_PASSWORD', 'Password must be at least 8 characters and include a number and uppercase letter.');
    }

    const user = await AuthRepository.findById(record.userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found.');

    await UsersRepository.update(user, { passwordHash: bcrypt.hashSync(password, 10) });
    AuthRepository.consumeResetToken(token);
    await AuthRepository.revokeUserSessions(user.id);
    return { reset: true };
  }

  static async verifyEmail(token: string) {
    const record = AuthRepository.getVerificationToken(token);
    if (!record) throw new AppError(400, 'INVALID_VERIFICATION_TOKEN', 'Verification token is invalid.');

    const user = await AuthRepository.findById(record.userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found.');

    AuthRepository.consumeVerificationToken(token);
    return { verified: true, user: AuthService.safeUser(user) };
  }

  static issueTokens(user: UserRecord): AuthTokens {
    const accessToken = jwt.sign({ sub: user.id, email: user.email, username: user.username }, env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
      issuer: 'funspot',
      audience: 'funspot-api',
    });

    const refreshJti = crypto.randomUUID();
    const refreshToken = jwt.sign({ sub: user.id, type: 'refresh', jti: refreshJti }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
      issuer: 'funspot',
      audience: 'funspot-api',
    });

    return { accessToken, refreshToken };
  }

  static safeUser(user: UserRecord) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      coverImage: user.coverImage,
      website: user.website,
      location: user.location,
      privacy: user.privacy,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
