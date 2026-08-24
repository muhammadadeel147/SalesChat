import type { NextFunction, Request, Response } from 'express';

import { clearRlsSession } from '../modules/core/rls.js';

export function requestContext(_req: Request, res: Response, next: NextFunction): void {
  res.on('finish', () => {
    void clearRlsSession();
  });
  next();
}
