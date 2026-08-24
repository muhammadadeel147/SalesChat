import { Router } from 'express';

import type { FeatureKey } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { platformReadRateLimit, platformWriteRateLimit } from '../../middleware/rate-limits.js';
import { ValidationError } from '../core/errors.js';
import {
  authenticate,
  requirePlatformAdmin,
  requirePlatformOwner,
  requireTenantAccess,
} from '../permissions/permissions.middleware.js';
import {
  createTenant,
  createTenantSchema,
  getTenantById,
  listTenants,
  restoreTenantPortalAccess,
  restoreTenantAccessSchema,
  revokeTenantPortalAccess,
  revokeTenantAccessSchema,
  setTenantFeaturesSchema,
  updateTenant,
  updateTenantFeatures,
  updateTenantSchema,
} from './tenants.service.js';

export function createTenantRouter(): Router {
  const router = Router();

  const platformRead = [authenticate, requirePlatformAdmin(), platformReadRateLimit];
  const platformWrite = [authenticate, requirePlatformOwner(), platformWriteRateLimit];

  router.get(
    '/tenants',
    ...platformRead,
    jsonHandler(async (req) => {
      const q = req.query as { page?: string; pageSize?: string };
      const page = q.page ? Number(q.page) : 1;
      const pageSize = q.pageSize ? Number(q.pageSize) : 20;
      return listTenants(page, pageSize);
    }),
  );

  router.get(
    '/tenants/:tenantId',
    authenticate,
    jsonHandler(async (req) => {
      const { tenantId } = req.params as { tenantId: string };
      requireTenantAccess(req, tenantId);
      return getTenantById(tenantId);
    }),
  );

  router.post(
    '/tenants',
    ...platformWrite,
    jsonHandler(async (req) => {
      const parsed = createTenantSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createTenant(parsed.data, req.user!.id);
    }),
  );

  router.patch(
    '/tenants/:tenantId',
    ...platformWrite,
    jsonHandler(async (req) => {
      const { tenantId } = req.params as { tenantId: string };
      const parsed = updateTenantSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateTenant(tenantId, parsed.data, req.user!.id);
    }),
  );

  router.put(
    '/tenants/:tenantId/features',
    ...platformWrite,
    jsonHandler(async (req) => {
      const { tenantId } = req.params as { tenantId: string };
      const parsed = setTenantFeaturesSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateTenantFeatures(
        tenantId,
        parsed.data.featureKeys as FeatureKey[],
        req.user!.id,
        req.ip,
      );
    }),
  );

  router.post(
    '/tenants/:tenantId/revoke-access',
    ...platformWrite,
    jsonHandler(async (req) => {
      const { tenantId } = req.params as { tenantId: string };
      const parsed = revokeTenantAccessSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      const reason = parsed.data.reason ?? 'Access revoked by platform administrator';
      return revokeTenantPortalAccess(tenantId, reason, req.user!.id, req.ip);
    }),
  );

  router.post(
    '/tenants/:tenantId/restore-access',
    ...platformWrite,
    jsonHandler(async (req) => {
      const { tenantId } = req.params as { tenantId: string };
      const parsed = restoreTenantAccessSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return restoreTenantPortalAccess(tenantId, parsed.data, req.user!.id, req.ip);
    }),
  );

  return router;
}
