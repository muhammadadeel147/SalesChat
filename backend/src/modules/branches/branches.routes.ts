import { Router } from 'express';

import { FEATURES } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { ValidationError } from '../core/errors.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate, requireFeature } from '../permissions/permissions.middleware.js';
import { branchSchema, createBranch, listBranches, updateBranch } from './branches.service.js';

export function createBranchRouter(): Router {
  const router = Router();

  router.get(
    '/branches',
    authenticate,
    requireFeature(FEATURES.MULTI_BRANCH_ACCESS),
    jsonHandler(async (req) => listBranches(resolveTenantId(req))),
  );

  router.post(
    '/branches',
    authenticate,
    requireFeature(FEATURES.MULTI_BRANCH_ACCESS),
    jsonHandler(async (req) => {
      const parsed = branchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createBranch(resolveTenantId(req), parsed.data);
    }),
  );

  router.patch(
    '/branches/:branchId',
    authenticate,
    requireFeature(FEATURES.MULTI_BRANCH_ACCESS),
    jsonHandler(async (req) => {
      const { branchId } = req.params as { branchId: string };
      const parsed = branchSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateBranch(resolveTenantId(req), branchId, parsed.data);
    }),
  );

  return router;
}
