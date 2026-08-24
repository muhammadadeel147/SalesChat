import { Router } from 'express';

import { UnauthorizedError, ValidationError } from '../core/errors.js';
import { jsonHandler } from '../../middleware/async-handler.js';
import { loginRateLimit } from '../../middleware/rate-limits.js';
import { authenticate } from '../permissions/permissions.middleware.js';
import { prisma } from '../core/prisma.js';
import { resolveUserFeatures } from '../permissions/permissions.service.js';
import { serializeSubscriptionFields } from '../tenants/subscription.service.js';
import { appConfig } from '../../config.js';
import { changePassword, login, logout, refreshAccessToken } from './auth.service.js';
import { changePasswordSchema, loginSchema, refreshSchema } from './auth.schemas.js';
import { clearAuthCookies, readRefreshToken, setAuthCookies } from './auth-cookies.js';

function publicUser(user: {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string | null;
  features: string[];
  mustChangePassword: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    tenantId: user.tenantId,
    features: user.features,
    mustChangePassword: user.mustChangePassword,
  };
}

export function createAuthRouter(): Router {
  const router = Router();

  router.post(
    '/auth/login',
    loginRateLimit,
    jsonHandler(async (req, res) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }

      const result = await login(parsed.data.email, parsed.data.password);
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return {
        mustChangePassword: result.mustChangePassword,
        user: publicUser(result.user),
      };
    }),
  );

  router.post(
    '/auth/refresh',
    jsonHandler(async (req, res) => {
      const parsed = refreshSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }

      const refreshToken = readRefreshToken(req, parsed.data.refreshToken);
      if (!refreshToken) {
        throw new UnauthorizedError('Missing refresh session');
      }

      const result = await refreshAccessToken(refreshToken);
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return { success: true };
    }),
  );

  router.post(
    '/auth/logout',
    jsonHandler(async (req, res) => {
      const body = (req.body ?? {}) as { refreshToken?: string };
      const refreshToken = readRefreshToken(req, body.refreshToken);
      if (refreshToken) {
        await logout(refreshToken);
      }
      clearAuthCookies(res);
      return { success: true };
    }),
  );

  router.post(
    '/auth/change-password',
    authenticate,
    jsonHandler(async (req, res) => {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }

      const result = await changePassword(
        req.user!.id,
        parsed.data.currentPassword,
        parsed.data.newPassword,
      );

      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return {
        mustChangePassword: false,
        user: publicUser({ ...result.user, mustChangePassword: false }),
      };
    }),
  );

  router.get(
    '/auth/me',
    authenticate,
    jsonHandler(async (req) => {
      const jwtUser = req.user!;

      const [dbUser, features, tenant] = await Promise.all([
        prisma.user.findFirst({
          where: { id: jwtUser.id, deletedAt: null, isActive: true },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            tenantId: true,
            mustChangePassword: true,
          },
        }),
        resolveUserFeatures(jwtUser.id, jwtUser.role, jwtUser.tenantId),
        jwtUser.tenantId
          ? prisma.tenant.findFirst({ where: { id: jwtUser.tenantId, deletedAt: null } })
          : Promise.resolve(null),
      ]);

      if (!dbUser) {
        throw new UnauthorizedError('User not found or inactive');
      }

      const planEntitlement = tenant
        ? {
            ...serializeSubscriptionFields(tenant),
            upgradeUrl: appConfig.upgradeWhatsappUrl,
          }
        : null;

      return {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        role: dbUser.role,
        tenantId: dbUser.tenantId,
        features,
        mustChangePassword: dbUser.mustChangePassword,
        planEntitlement,
      };
    }),
  );

  return router;
}
