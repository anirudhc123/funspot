import { Worker } from 'bullmq';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const parsedRedisUrl = new URL(redisUrl);
const connection = {
  host: parsedRedisUrl.hostname,
  port: Number(parsedRedisUrl.port || 6379),
  ...(parsedRedisUrl.password ? { password: decodeURIComponent(parsedRedisUrl.password) } : {}),
};

const workers = [
  new Worker('notification-delivery', async (job) => {
    console.info('notification job received', { id: job.id, name: job.name });
  }, { connection }),
  new Worker('post-media-processing', async (job) => {
    console.info('media job received', { id: job.id, name: job.name });
  }, { connection }),
];

const shutdown = async (signal: string) => {
  console.info('worker shutting down', { signal });
  await Promise.all(workers.map((worker) => worker.close()));
  process.exit(0);
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

for (const worker of workers) {
  worker.on('error', (error) => {
    console.error('worker error', { error });
  });
}
