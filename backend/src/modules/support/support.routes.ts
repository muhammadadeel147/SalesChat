import { Router } from 'express';

import { jsonHandler } from '../../middleware/async-handler.js';
import { supportRateLimit } from '../../middleware/rate-limits.js';
import { ValidationError } from '../core/errors.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate } from '../permissions/permissions.middleware.js';
import { createSupportQuery, createSupportQuerySchema } from './support.service.js';

export function createSupportRouter(): Router {
  const router = Router();

  router.post(
    '/support/queries',
    authenticate,
    supportRateLimit,
    jsonHandler(async (req) => {
      const parsed = createSupportQuerySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }

      const tenantId = resolveTenantId(req);
      const userId = req.user!.id;
      return createSupportQuery(tenantId, userId, parsed.data);
    }),
  );

  return router;
}
