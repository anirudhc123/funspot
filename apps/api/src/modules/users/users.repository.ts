import type { Prisma } from '@prisma/client';

import { prisma } from '../../database/prisma';

export type Privacy = 'public' | 'private' | 'followers';
export type FollowStatus = 'accepted' | 'pending' | 'rejected';
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export type UserRecord = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  website?: string;
  location?: string;
  passwordHash?: string;
  privacy: Privacy;
  role: UserRole;
  status: UserStatus;
  suspendedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type FollowRecord = {
  id: string;
  followerId: string;
  followeeId: string;
  status: FollowStatus;
  createdAt: Date;
};

export type FollowRequestRecord = {
  id: string;
  requesterId: string;
  targetId: string;
  message?: string;
  createdAt: Date;
  status: FollowStatus;
};

export type BlockRecord = {
  id: string;
  sourceUserId: string;
  blockedUserId: string;
  createdAt: Date;
};

export type MuteRecord = {
  id: string;
  sourceUserId: string;
  mutedUserId: string;
  createdAt: Date;
};

const createUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export const follows: FollowRecord[] = [];
export const blocked: BlockRecord[] = [];
export const muted: MuteRecord[] = [];
export const followRequests: FollowRequestRecord[] = [];

type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;

function toPrivacy(privacy: string | null | undefined): Privacy {
  if (privacy === 'private' || privacy === 'followers') return privacy;
  return 'public';
}

function toUserRecord(user: UserWithProfile): UserRecord {
  return {
    id: user.id,
    email: user.email,
    username: user.profile?.username ?? '',
    displayName: user.profile?.displayName ?? '',
    bio: user.profile?.bio ?? undefined,
    avatar: user.profile?.avatarUrl ?? undefined,
    coverImage: user.profile?.coverImage ?? undefined,
    website: user.profile?.website ?? undefined,
    location: user.profile?.location ?? undefined,
    passwordHash: user.passwordHash ?? undefined,
    privacy: toPrivacy(user.profile?.privacy),
    role: user.role,
    status: user.status,
    suspendedUntil: user.suspendedUntil ?? undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UsersRepository {
  static async findById(id: string): Promise<UserRecord | undefined> {
    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    return user ? toUserRecord(user) : undefined;
  }

  static async findByEmail(email: string): Promise<UserRecord | undefined> {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { profile: true },
    });
    return user ? toUserRecord(user) : undefined;
  }

  static async findByUsername(username: string): Promise<UserRecord | undefined> {
    const user = await prisma.user.findFirst({
      where: { profile: { is: { username } } },
      include: { profile: true },
    });
    return user ? toUserRecord(user) : undefined;
  }

  static async findByUsernameInsensitive(username: string): Promise<UserRecord | undefined> {
    const user = await prisma.user.findFirst({
      where: { profile: { is: { username: { equals: username, mode: 'insensitive' } } } },
      include: { profile: true },
    });
    return user ? toUserRecord(user) : undefined;
  }

  static async create(input: Pick<UserRecord, 'email' | 'username' | 'displayName' | 'passwordHash' | 'privacy'>): Promise<UserRecord> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        profile: {
          create: {
            username: input.username,
            displayName: input.displayName,
            privacy: input.privacy,
          },
        },
      },
      include: { profile: true },
    });
    return toUserRecord(user);
  }

  static async listAll(): Promise<UserRecord[]> {
    const users = await prisma.user.findMany({ include: { profile: true } });
    return users.map(toUserRecord);
  }

  static async serialize(user: UserRecord): Promise<Record<string, unknown>> {
    return {
      id: user.id,
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
      suspendedUntil: user.suspendedUntil,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async update(user: UserRecord, changes: Partial<UserRecord>): Promise<UserRecord> {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: changes.email,
        passwordHash: changes.passwordHash,
        role: changes.role,
        status: changes.status,
        suspendedUntil: Object.hasOwn(changes, 'suspendedUntil')
          ? changes.suspendedUntil ?? null
          : undefined,
        profile: {
          upsert: {
            create: {
              username: changes.username ?? user.username,
              displayName: changes.displayName ?? user.displayName,
              bio: changes.bio ?? user.bio ?? null,
              avatarUrl: changes.avatar ?? user.avatar ?? null,
              coverImage: changes.coverImage ?? user.coverImage ?? null,
              website: changes.website ?? user.website ?? null,
              location: changes.location ?? user.location ?? null,
              privacy: changes.privacy ?? user.privacy,
            },
            update: {
              username: changes.username,
              displayName: changes.displayName,
              bio: changes.bio,
              avatarUrl: changes.avatar,
              coverImage: changes.coverImage,
              website: changes.website,
              location: changes.location,
              privacy: changes.privacy,
            },
          },
        },
      },
      include: { profile: true },
    });
    return toUserRecord(updated);
  }

  static createFollow(followerId: string, followeeId: string, status: FollowStatus): FollowRecord {
    const follow = {
      id: createUniqueId('follow'),
      followerId,
      followeeId,
      status,
      createdAt: new Date(),
    };
    follows.push(follow);
    return follow;
  }

  static removeFollow(followerId: string, followeeId: string): void {
    const idx = follows.findIndex(
      (f) => f.followerId === followerId && f.followeeId === followeeId,
    );

    if (idx >= 0) {
      follows.splice(idx, 1);
    }
  }

  static getFollowsByTarget(targetUserId: string): FollowRecord[] {
    return follows.filter((f) => f.followeeId === targetUserId && f.status === 'accepted');
  }

  static getFollowsByFollower(followerId: string): FollowRecord[] {
    return follows.filter((f) => f.followerId === followerId && f.status === 'accepted');
  }

  static createFollowRequest(requesterId: string, targetId: string): FollowRequestRecord {
    const request = {
      id: createUniqueId('follow-request'),
      requesterId,
      targetId,
      message: undefined,
      createdAt: new Date(),
      status: 'pending' as FollowStatus,
    };
    followRequests.push(request);
    return request;
  }

  static getFollowRequest(requestId: string): FollowRequestRecord | undefined {
    return followRequests.find((r) => r.id === requestId);
  }

  static updateFollowRequestStatus(requestId: string, status: FollowStatus): FollowRequestRecord | undefined {
    const req = this.getFollowRequest(requestId);
    if (!req) return undefined;
    req.status = status;
    return req;
  }

  static cancelFollowRequest(requestId: string): void {
    const i = followRequests.findIndex((r) => r.id === requestId);
    if (i >= 0) followRequests.splice(i, 1);
  }

  static createBlock(sourceUserId: string, blockedUserId: string): BlockRecord {
    const block = {
      id: createUniqueId('block'),
      sourceUserId,
      blockedUserId,
      createdAt: new Date(),
    };
    blocked.push(block);
    return block;
  }

  static removeBlock(sourceUserId: string, blockedUserId: string): void {
    const idx = blocked.findIndex(
      (b) => b.sourceUserId === sourceUserId && b.blockedUserId === blockedUserId,
    );

    if (idx >= 0) blocked.splice(idx, 1);
  }

  static createMute(sourceUserId: string, mutedUserId: string): MuteRecord {
    const mute = {
      id: createUniqueId('mute'),
      sourceUserId,
      mutedUserId,
      createdAt: new Date(),
    };
    muted.push(mute);
    return mute;
  }

  static removeMute(sourceUserId: string, mutedUserId: string): void {
    const idx = muted.findIndex(
      (m) => m.sourceUserId === sourceUserId && m.mutedUserId === mutedUserId,
    );

    if (idx >= 0) muted.splice(idx, 1);
  }
}
