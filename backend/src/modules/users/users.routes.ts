import { Router } from 'express';

import { FEATURES, USER_ROLES } from '../../constants/index.js';
import type { FeatureKey } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { platformReadRateLimit, platformWriteRateLimit } from '../../middleware/rate-limits.js';
import { ValidationError } from '../core/errors.js';
import { resolveTenantId } from '../core/tenant.js';
import {
  authenticate,
  requireFeature,
  requirePlatformAdmin,
  requirePlatformOwner,
  requireRole,
} from '../permissions/permissions.middleware.js';
import {
  createTenantUser,
  createUserSchema,
  deleteTenantUser,
  listTenantUsers,
  setStaffFeaturesSchema,
  setTenantUserPassword,
  setTenantUserPasswordSchema,
  updateTenantUser,
  updateUserFeatures,
  updateUserSchema,
} from './users.service.js';

function clientIp(req: { ip?: string }): string {
  return req.ip ?? '';
}

export function createUserRouter(): Router {
  const router = Router();

  const manageGuard = [
    authenticate,
    requireRole(USER_ROLES.CLIENT_ADMIN),
    requireFeature(FEATURES.USERS_MANAGE),
  ];

  router.get(
    '/users',
    ...manageGuard,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as { page?: string; pageSize?: string };
      const page = q.page ? Number(q.page) : 1;
      const pageSize = q.pageSize ? Number(q.pageSize) : 20;
      return listTenantUsers(tenantId, page, pageSize);
    }),
  );

  router.post(
    '/users',
    ...manageGuard,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }

      return createTenantUser(
        tenantId,
        { ...parsed.data, role: USER_ROLES.STAFF },
        req.user!.id,
        req.user!.role,
      );
    }),
  );

  router.patch(
    '/users/:userId',
    ...manageGuard,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const { userId } = req.params as { userId: string };
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateTenantUser(tenantId, userId, parsed.data);
    }),
  );

  router.put(
    '/users/:userId/features',
    ...manageGuard,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const { userId } = req.params as { userId: string };
      const parsed = setStaffFeaturesSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateUserFeatures(
        tenantId,
        userId,
        parsed.data.featureKeys as FeatureKey[],
        req.user!.id,
        clientIp(req),
      );
    }),
  );

  const readGuard = [authenticate, requirePlatformAdmin(), platformReadRateLimit];
  const writeGuard = [authenticate, requirePlatformOwner(), platformWriteRateLimit];

  router.get(
    '/tenants/:tenantId/users',
    ...readGuard,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req, (req.params as { tenantId: string }).tenantId);
      const q = req.query as { page?: string; pageSize?: string };
      const page = q.page ? Number(q.page) : 1;
      const pageSize = q.pageSize ? Number(q.pageSize) : 20;
      return listTenantUsers(tenantId, page, pageSize);
    }),
  );

  router.post(
    '/tenants/:tenantId/users',
    ...writeGuard,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req, (req.params as { tenantId: string }).tenantId);
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }

      return createTenantUser(tenantId, parsed.data, req.user!.id, USER_ROLES.SUPER_ADMIN);
    }),
  );

  router.patch(
    '/tenants/:tenantId/users/:userId',
    ...writeGuard,
    jsonHandler(async (req) => {
      const { tenantId, userId } = req.params as { tenantId: string; userId: string };
      resolveTenantId(req, tenantId);
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateTenantUser(tenantId, userId, parsed.data);
    }),
  );

  router.post(
    '/tenants/:tenantId/users/:userId/set-password',
    ...writeGuard,
    jsonHandler(async (req) => {
      const { tenantId, userId } = req.params as { tenantId: string; userId: string };
      resolveTenantId(req, tenantId);
      const parsed = setTenantUserPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return setTenantUserPassword(tenantId, userId, parsed.data, req.user!.id, clientIp(req));
    }),
  );

  router.put(
    '/tenants/:tenantId/users/:userId/features',
    ...writeGuard,
    jsonHandler(async (req) => {
      const { tenantId, userId } = req.params as { tenantId: string; userId: string };
      resolveTenantId(req, tenantId);
      const parsed = setStaffFeaturesSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateUserFeatures(
        tenantId,
        userId,
        parsed.data.featureKeys as FeatureKey[],
        req.user!.id,
        clientIp(req),
      );
    }),
  );

  router.delete(
    '/tenants/:tenantId/users/:userId',
    ...writeGuard,
    jsonHandler(async (req) => {
      const { tenantId, userId } = req.params as { tenantId: string; userId: string };
      resolveTenantId(req, tenantId);
      await deleteTenantUser(tenantId, userId, req.user!.id, clientIp(req));
      return { success: true };
    }),
  );

  return router;
}
