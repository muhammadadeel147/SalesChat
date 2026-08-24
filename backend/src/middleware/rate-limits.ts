import rateLimit from 'express-rate-limit';

import { appConfig } from '../config.js';

export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: appConfig.nodeEnv === 'production' ? 600 : 1200,
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginRateLimit = rateLimit({
  windowMs: appConfig.nodeEnv === 'production' ? 15 * 60 * 1000 : 60 * 1000,
  max: appConfig.nodeEnv === 'production' ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Too many login attempts. Try again later.',
  },
});

export const supportRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const platformReadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

export const platformWriteRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
