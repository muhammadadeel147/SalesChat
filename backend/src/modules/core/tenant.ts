import type { Request } from 'express';

import { USER_ROLES } from '../../constants/index.js';

import { ForbiddenError, UnauthorizedError } from './errors.js';

/**
 * For Client Admin / Staff: tenant is always from JWT — URL params are ignored.
 * For Super Admin: tenant comes from the explicit route param.
 */
export function resolveTenantId(req: Request, paramTenantId?: string): string {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  if (req.user.role === USER_ROLES.SUPER_ADMIN) {
    if (!paramTenantId) {
      throw new ForbiddenError('Tenant ID required');
    }
    return paramTenantId;
  }

  if (!req.user.tenantId) {
    throw new ForbiddenError('No tenant context — please sign in again');
  }

  return req.user.tenantId;
}
