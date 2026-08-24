import { Router } from 'express';

import { jsonHandler } from '../../middleware/async-handler.js';
import { platformReadRateLimit, platformWriteRateLimit } from '../../middleware/rate-limits.js';
import { ValidationError } from '../core/errors.js';
import {
  authenticate,
  requirePlatformAdmin,
  requirePlatformOwner,
} from '../permissions/permissions.middleware.js';
import {
  createSalesRep,
  createSalesRepSchema,
  getAdminDashboard,
  listSalesReps,
} from './admin.service.js';

export function createAdminRouter(): Router {
  const router = Router();

  const readGuard = [authenticate, requirePlatformAdmin(), platformReadRateLimit];
  const writeGuard = [authenticate, requirePlatformOwner(), platformWriteRateLimit];

  router.get(
    '/admin/dashboard',
    ...readGuard,
    jsonHandler(async () => getAdminDashboard()),
  );

  router.get(
    '/admin/sales-reps',
    ...readGuard,
    jsonHandler(async () => listSalesReps()),
  );

  router.post(
    '/admin/sales-reps',
    ...writeGuard,
    jsonHandler(async (req) => {
      const parsed = createSalesRepSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createSalesRep(parsed.data);
    }),
  );

  return router;
}
