import { Router } from 'express';

import { jsonHandler } from '../../middleware/async-handler.js';
import { prisma } from '../core/prisma.js';
import { authenticate } from './permissions.middleware.js';

export function createPermissionRouter(): Router {
  const router = Router();

  router.get(
    '/features',
    authenticate,
    jsonHandler(async () => {
      const features = await prisma.featureRegistry.findMany({
        where: { isActive: true },
        orderBy: [{ module: 'asc' }, { key: 'asc' }],
      });

      return features.map((f) => ({
        key: f.key,
        module: f.module,
        label: f.label,
        description: f.description,
      }));
    }),
  );

  return router;
}
