export type Privacy = 'public' | 'private' | 'followers';
export type FollowStatus = 'accepted' | 'pending' | 'rejected';

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

export const users: UserRecord[] = [
  {
    id: 'u-1',
    email: 'alice@example.com',
    username: 'alice',
    displayName: 'Alice',
    bio: 'Designer and builder.',
    avatar: 'https://example.com/alice/avatar.png',
    coverImage: 'https://example.com/alice/cover.png',
    website: 'https://alice.example',
    location: 'San Francisco',
    privacy: 'public',
    passwordHash: 'hash',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'u-2',
    email: 'bob@example.com',
    username: 'bob',
    displayName: 'Bob',
    bio: 'Photographer.',
    avatar: 'https://example.com/bob/avatar.png',
    coverImage: 'https://example.com/bob/cover.png',
    website: 'https://bob.example',
    location: 'New York',
    privacy: 'private',
    passwordHash: 'hash',
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  },
  {
    id: 'u-3',
    email: 'carol@example.com',
    username: 'carol',
    displayName: 'Carol',
    bio: 'Creator.',
    avatar: 'https://example.com/carol/avatar.png',
    coverImage: 'https://example.com/carol/cover.png',
    website: 'https://carol.example',
    location: 'Austin',
    privacy: 'followers',
    passwordHash: 'hash',
    createdAt: new Date('2026-01-03T00:00:00Z'),
    updatedAt: new Date('2026-01-03T00:00:00Z'),
  },
];

export const follows: FollowRecord[] = [];
export const blocked: BlockRecord[] = [];
export const muted: MuteRecord[] = [];
export const followRequests: FollowRequestRecord[] = [];

export class UsersRepository {
  static findById(id: string): UserRecord | undefined {
    return users.find((user) => user.id === id);
  }

  static findByUsername(username: string): UserRecord | undefined {
    return users.find((user) => user.username === username);
  }

  static listAll(): UserRecord[] {
    return users;
  }

  static serialize(user: UserRecord): Record<string, unknown> {
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static update(user: UserRecord, changes: Partial<UserRecord>): UserRecord {
    Object.assign(user, changes, { updatedAt: new Date() });
    return user;
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
