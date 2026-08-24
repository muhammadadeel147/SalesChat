import { Router } from 'express';

import { FEATURES, USER_ROLES } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { ForbiddenError, ValidationError } from '../core/errors.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate, requireFeature } from '../permissions/permissions.middleware.js';
import { testNetworkPrinter } from '../printer/printer.service.js';
import {
  exportTenantData,
  getSettings,
  settingsPatchTouchesLayout,
  settingsSchema,
  updateSettings,
} from './settings.service.js';

export function createSettingsRouter(): Router {
  const router = Router();

  router.get(
    '/settings',
    authenticate,
    requireFeature(FEATURES.SETTINGS_VIEW),
    jsonHandler(async (req) => {
      return getSettings(resolveTenantId(req));
    }),
  );

  router.patch(
    '/settings',
    authenticate,
    requireFeature(FEATURES.SETTINGS_EDIT),
    jsonHandler(async (req) => {
      const parsed = settingsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }

      const allowLayout =
        req.user?.role === USER_ROLES.SUPER_ADMIN ||
        Boolean(req.user?.features?.includes(FEATURES.UI_CUSTOMIZE));

      if (settingsPatchTouchesLayout(parsed.data) && !allowLayout) {
        throw new ForbiddenError(
          'This feature requires a plan upgrade. Contact Raunaq to unlock it.',
          'UPGRADE_REQUIRED',
        );
      }

      return updateSettings(resolveTenantId(req), parsed.data, { allowLayout });
    }),
  );

  router.get(
    '/settings/export',
    authenticate,
    requireFeature(FEATURES.SETTINGS_EDIT),
    jsonHandler(async (req) => {
      return exportTenantData(resolveTenantId(req));
    }),
  );

  router.post(
    '/settings/printer-test',
    authenticate,
    requireFeature(FEATURES.SETTINGS_EDIT),
    requireFeature(FEATURES.BILLING_PRINT_RECEIPT),
    jsonHandler(async (req) => {
      return testNetworkPrinter(resolveTenantId(req));
    }),
  );

  return router;
}
