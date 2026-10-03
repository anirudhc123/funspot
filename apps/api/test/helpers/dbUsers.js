const { prisma } = require('../../dist/database/prisma.js');

async function cleanupUsers(namespace) {
  const emailSuffix = `@${namespace}.test`;
  const existing = await prisma.user.findMany({
    where: { email: { endsWith: emailSuffix } },
    select: { id: true },
  });
  const userIds = existing.map((user) => user.id);
  if (userIds.length === 0) return;

  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

async function resetUsers(namespace, records) {
  await cleanupUsers(namespace);
  for (const record of records) {
    await prisma.user.create({
      data: {
        id: record.id,
        email: record.email,
        passwordHash: record.passwordHash,
        role: record.role ?? 'USER',
        status: record.status ?? 'ACTIVE',
        profile: {
          create: {
            username: record.username,
            displayName: record.displayName,
            bio: record.bio,
            avatarUrl: record.avatar,
            coverImage: record.coverImage,
            website: record.website,
            location: record.location,
            privacy: record.privacy ?? 'public',
          },
        },
      },
    });
  }
  return records;
}

module.exports = { cleanupUsers, resetUsers };
