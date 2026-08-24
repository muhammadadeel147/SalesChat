import pino from 'pino';

import { appConfig } from './config.js';

export const logger = pino({
  level: appConfig.nodeEnv === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'body.password',
      'body.currentPassword',
      'body.newPassword',
      'body.refreshToken',
      'body.accessToken',
    ],
    censor: '[Redacted]',
  },
});
