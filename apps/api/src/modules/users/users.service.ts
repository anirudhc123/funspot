import { AppError } from '../../errors/AppError';
import { UsersRepository, type UserRecord } from './users.repository';

export class UsersService {
  static getMe(userId: string) {
    const user = UsersRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Current user was not found.');
    }

    return UsersRepository.serialize(user);
  }

  static updateMe(userId: string, changes: Partial<UserRecord>) {
    const user = UsersRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Current user was not found.');
    }

    const nextUser = UsersRepository.update(user, {
      ...changes,
      username: changes.username ?? user.username,
      displayName: changes.displayName ?? user.displayName,
      bio: changes.bio ?? user.bio,
      avatar: changes.avatar ?? user.avatar,
      coverImage: changes.coverImage ?? user.coverImage,
      website: changes.website ?? user.website,
      location: changes.location ?? user.location,
      privacy: changes.privacy ?? user.privacy,
    });

    return UsersRepository.serialize(nextUser);
  }

  static getProfile(username: string, viewerId?: string) {
    const user = UsersRepository.findByUsername(username);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Profile was not found.');

    if (user.privacy === 'private' && viewerId !== user.id) {
      const isAcceptedFollower = UsersRepository.getFollowsByFollower(viewerId ?? '').some(
        (f) => f.followeeId === user.id,
      );

      if (!isAcceptedFollower) {
        throw new AppError(403, 'PROFILE_PRIVATE', 'This profile is private.');
      }
    }

    return UsersRepository.serialize(user);
  }

  static followUser(actorId: string, targetId: string) {
    const actor = UsersRepository.findById(actorId);
    const target = UsersRepository.findById(targetId);
    if (!actor || !target) throw new AppError(404, 'USER_NOT_FOUND', 'User could not be found.');

    if (target.id === actor.id) {
      throw new AppError(409, 'SELF_FOLLOW', 'You cannot follow yourself.');
    }

    if (UsersRepository.getFollowsByFollower(actorId).some((f) => f.followeeId === target.id)) {
      throw new AppError(409, 'ALREADY_FOLLOWING', 'You already follow this user.');
    }

    if (target.privacy === 'private') {
      const request = UsersRepository.createFollowRequest(actor.id, target.id);
      return { followRequest: request, status: 'pending' };
    }

    const follow = UsersRepository.createFollow(actor.id, target.id, 'accepted');
    return { follow, status: 'accepted' };
  }

  static unfollowUser(actorId: string, targetId: string) {
    const actor = UsersRepository.findById(actorId);
    const target = UsersRepository.findById(targetId);
    if (!actor || !target) throw new AppError(404, 'USER_NOT_FOUND', 'User could not be found.');

    UsersRepository.removeFollow(actor.id, target.id);
    return { destroyed: true };
  }

  static acceptFollowRequest(requestId: string) {
    const req = UsersRepository.getFollowRequest(requestId);
    if (!req) throw new AppError(404, 'FOLLOW_REQUEST_NOT_FOUND', 'Follow request not found.');

    UsersRepository.updateFollowRequestStatus(requestId, 'accepted');
    UsersRepository.createFollow(req.requesterId, req.targetId, 'accepted');
    return { accepted: true };
  }

  static rejectFollowRequest(requestId: string) {
    const req = UsersRepository.getFollowRequest(requestId);
    if (!req) throw new AppError(404, 'FOLLOW_REQUEST_NOT_FOUND', 'Follow request not found.');

    UsersRepository.updateFollowRequestStatus(requestId, 'rejected');
    return { rejected: true };
  }

  static cancelFollowRequest(requestId: string) {
    const req = UsersRepository.getFollowRequest(requestId);
    if (!req) throw new AppError(404, 'FOLLOW_REQUEST_NOT_FOUND', 'Follow request not found.');

    UsersRepository.cancelFollowRequest(requestId);
    return { canceled: true };
  }

  static followers(username: string) {
    const user = UsersRepository.findByUsername(username);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found.');

    const followRecords = UsersRepository.getFollowsByTarget(user.id);
    return followRecords.map((r) => UsersRepository.findById(r.followerId)).filter(Boolean).map((u) => UsersRepository.serialize(u as UserRecord));
  }

  static following(username: string) {
    const user = UsersRepository.findByUsername(username);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found.');

    const followRecords = UsersRepository.getFollowsByFollower(user.id);
    return followRecords.map((r) => UsersRepository.findById(r.followeeId)).filter(Boolean).map((u) => UsersRepository.serialize(u as UserRecord));
  }

  static blockUser(actorId: string, targetId: string) {
    const actor = UsersRepository.findById(actorId);
    const target = UsersRepository.findById(targetId);
    if (!actor || !target) throw new AppError(404, 'USER_NOT_FOUND', 'User could not be found.');
    if (actor.id === target.id) throw new AppError(409, 'SELF_BLOCK', 'You cannot block yourself.');

    UsersRepository.createBlock(actor.id, target.id);
    return { blocked: true };
  }

  static unblockUser(actorId: string, targetId: string) {
    const actor = UsersRepository.findById(actorId);
    const target = UsersRepository.findById(targetId);
    if (!actor || !target) throw new AppError(404, 'USER_NOT_FOUND', 'User could not be found.');

    UsersRepository.removeBlock(actor.id, target.id);
    return { unblocked: true };
  }

  static muteUser(actorId: string, targetId: string) {
    const actor = UsersRepository.findById(actorId);
    const target = UsersRepository.findById(targetId);
    if (!actor || !target) throw new AppError(404, 'USER_NOT_FOUND', 'User could not be found.');

    UsersRepository.createMute(actor.id, target.id);
    return { muted: true };
  }

  static unmuteUser(actorId: string, targetId: string) {
    const actor = UsersRepository.findById(actorId);
    const target = UsersRepository.findById(targetId);
    if (!actor || !target) throw new AppError(404, 'USER_NOT_FOUND', 'User could not be found.');

    UsersRepository.removeMute(actor.id, target.id);
    return { unmuted: true };
  }
}
