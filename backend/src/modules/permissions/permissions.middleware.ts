import type { Request, RequestHandler } from 'express';

import type { FeatureKey, UserRole } from '../../constants/index.js';
import { USER_ROLES } from '../../constants/index.js';

import { readAccessToken } from '../auth/auth-cookies.js';
import { verifyAccessToken } from '../auth/auth.service.js';
import { ForbiddenError, UnauthorizedError } from '../core/errors.js';
import { prisma } from '../core/prisma.js';
import { applyRlsSession } from '../core/rls.js';
import { enterTenantContext } from '../core/tenant-context.js';
import { assertTenantPortalAccess } from '../tenants/subscription.service.js';
import { asyncGuard } from '../../middleware/async-handler.js';
import {
  getCachedPortalAccess,
  getCachedUserFeatures,
  setCachedPortalAccessError,
  setCachedPortalAccessOk,
  setCachedUserFeatures,
} from './access-cache.js';
import { userHasFeature } from './permissions.service.js';

const PASSWORD_CHANGE_ALLOWED_PATHS = new Set([
  '/auth/change-password',
  '/auth/logout',
  '/auth/refresh',
]);

async function assertTenantPortalAccessCached(tenantId: string): Promise<void> {
  const cached = getCachedPortalAccess(tenantId);
  if (cached) {
    if (!cached.ok) throw cached.error;
    return;
  }
  try {
    await assertTenantPortalAccess(tenantId);
    setCachedPortalAccessOk(tenantId);
  } catch (error) {
    setCachedPortalAccessError(tenantId, error);
    throw error;
  }
}

export const authenticate: RequestHandler = asyncGuard(async (req) => {
  const token = readAccessToken(req);
  if (!token) {
    throw new UnauthorizedError('Missing or invalid session');
  }

  req.user = verifyAccessToken(token);

  const bypass = req.user.role === USER_ROLES.SUPER_ADMIN;
  const tenantCtx = { tenantId: req.user.tenantId, bypass };
  enterTenantContext(tenantCtx);
  await applyRlsSession(tenantCtx);

  if (req.user.tenantId) {
    const [, dbUser] = await Promise.all([
      assertTenantPortalAccessCached(req.user.tenantId),
      prisma.user.findFirst({
        where: { id: req.user.id, deletedAt: null },
        select: { isActive: true },
      }),
    ]);
    if (!dbUser?.isActive) {
      throw new UnauthorizedError(
        'Your account has been deactivated. Contact your shop administrator.',
        'USER_DEACTIVATED',
      );
    }
  }

  const path = req.path;
  if (req.user.mustChangePassword && !PASSWORD_CHANGE_ALLOWED_PATHS.has(path)) {
    throw new ForbiddenError(
      'Password change required before accessing this resource',
      'PASSWORD_CHANGE_REQUIRED',
    );
  }
});

export function requirePlatformAdmin(): RequestHandler {
  return asyncGuard(async (req) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (req.user.role !== USER_ROLES.SUPER_ADMIN || req.user.tenantId !== null) {
      throw new ForbiddenError('Platform administrator access required');
    }
  });
}

/** Stricter guard for routes that mutate platform data (not sales-rep accounts). */
export function requirePlatformOwner(): RequestHandler {
  return asyncGuard(async (req) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (req.user.role !== USER_ROLES.SUPER_ADMIN || req.user.tenantId !== null) {
      throw new ForbiddenError('Platform administrator access required');
    }

    const dbUser = await prisma.user.findFirst({
      where: { id: req.user.id, deletedAt: null, isActive: true },
      select: { isSalesRep: true },
    });

    if (!dbUser || dbUser.isSalesRep) {
      throw new ForbiddenError('This action requires a platform owner account');
    }
  });
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return asyncGuard(async (req) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient role');
    }
  });
}

export function requireFeature(...features: FeatureKey[]): RequestHandler {
  return asyncGuard(async (req) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (req.user.role === USER_ROLES.SUPER_ADMIN) {
      return;
    }

    const { resolveUserFeatures } = await import('./permissions.service.js');
    const cacheKey = `${req.user.tenantId ?? 'none'}:${req.user.id}:${req.user.role}`;
    let liveFeatures = getCachedUserFeatures(cacheKey);
    if (!liveFeatures) {
      liveFeatures = await resolveUserFeatures(req.user.id, req.user.role, req.user.tenantId);
      setCachedUserFeatures(cacheKey, liveFeatures);
    }
    req.user.features = liveFeatures;

    const allowed = features.some((f) => userHasFeature(liveFeatures, f));
    if (!allowed) {
      throw new ForbiddenError(
        'This feature requires a plan upgrade. Contact SaleChat to unlock it.',
        'UPGRADE_REQUIRED',
      );
    }
  });
}

/** @deprecated Use resolveTenantId from core/tenant.ts — Client Admin must not trust URL params. */
export function requireTenantAccess(req: Request, tenantId: string): void {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  if (req.user.role === USER_ROLES.SUPER_ADMIN) {
    return;
  }

  if (req.user.tenantId !== tenantId) {
    throw new ForbiddenError('Access denied to this tenant');
  }
}
