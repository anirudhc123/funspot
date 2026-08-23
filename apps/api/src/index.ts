import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

const port = env.PORT;

app.listen(port, () => {
  logger.info(
    {
      port,
      nodeEnv: env.NODE_ENV,
    },
    'Funspot API server started',
  );
});
