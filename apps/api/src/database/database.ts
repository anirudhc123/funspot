import { prisma } from './prisma';

export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

export const checkDatabaseHealth = async (): Promise<void> => {
  await prisma.$queryRaw`SELECT 1`;
};