import { createServer } from 'node:http';

import { Server } from 'socket.io';

import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './database/database';
import { logger } from './utils/logger';
import { registerChatSocket } from './socket/chatSocket';
import { corsOptions } from './config/cors';

const port = env.PORT;

const start = async (): Promise<void> => {
  await connectDatabase();
  const app = createApp();
  const server = createServer(app);
  const io = new Server(server, {
    cors: corsOptions,
  });

  registerChatSocket(io);

  server.listen(port, () => {
    logger.info({ port, nodeEnv: env.NODE_ENV }, 'Funspot API server started');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutting down Funspot API server');
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
};

void start().catch((error: unknown) => {
  logger.error({ error }, 'Failed to start Funspot API server');
  process.exit(1);
});
