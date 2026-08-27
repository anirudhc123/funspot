import cors from 'cors';
import helmet from 'helmet';

import { corsOptions } from '../config/cors';
import { apiRateLimit } from '../config/rateLimit';

export const securityMiddleware = [helmet(), cors(corsOptions), apiRateLimit];
