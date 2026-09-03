import type { Request } from 'express';
import { Router } from 'express';

import { FEATURES } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { resolveBranchId } from '../core/branch.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate, requireFeature } from '../permissions/permissions.middleware.js';
import {
  getDailySalesReport,
  getDashboardSummary,
  getSalesSummary,
  getSalesTrend,
  getShopPartsSummary,
  getStaffPerformanceReport,
  getStockMovementReport,
  getUdhaarAgingReport,
} from './reports.service.js';

async function optionalBranchId(
  req: Request,
  tenantId: string,
  queryBranchId?: string,
): Promise<string | undefined> {
  if (queryBranchId) return queryBranchId;
  try {
    return await resolveBranchId(req, tenantId);
  } catch {
    return undefined;
  }
}

export function createReportRouter(): Router {
  const router = Router();

  router.get(
    '/reports/dashboard',
    authenticate,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as { branchId?: string; from?: string; to?: string };
      const branchId = await optionalBranchId(req, tenantId, q.branchId);
      return getDashboardSummary(tenantId, branchId, q.from, q.to);
    }),
  );

  router.get(
    '/reports/daily-sales',
    authenticate,
    requireFeature(FEATURES.REPORTS_VIEW),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as { date?: string; branchId?: string };
      const branchId = await optionalBranchId(req, tenantId, q.branchId);
      return getDailySalesReport(tenantId, q.date, branchId);
    }),
  );

  router.get(
    '/reports/udhaar-aging',
    authenticate,
    requireFeature(FEATURES.REPORTS_ADVANCED),
    jsonHandler(async (req) => {
      return getUdhaarAgingReport(resolveTenantId(req));
    }),
  );

  router.get(
    '/reports/sales-summary',
    authenticate,
    requireFeature(FEATURES.REPORTS_VIEW),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as { from?: string; to?: string; branchId?: string };
      const branchId = await optionalBranchId(req, tenantId, q.branchId);
      return getSalesSummary(tenantId, q.from, q.to, branchId);
    }),
  );

  router.get(
    '/reports/shop-parts-summary',
    authenticate,
    requireFeature(FEATURES.REPORTS_VIEW),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as { from?: string; to?: string; branchId?: string; partId?: string };
      const branchId = await optionalBranchId(req, tenantId, q.branchId);
      return getShopPartsSummary(tenantId, q.from, q.to, branchId, q.partId);
    }),
  );

  router.get(
    '/reports/sales-trend',
    authenticate,
    requireFeature(FEATURES.REPORTS_VIEW),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as { days?: string; branchId?: string };
      const branchId = await optionalBranchId(req, tenantId, q.branchId);
      const days = q.days ? Number(q.days) : 14;
      return getSalesTrend(tenantId, Number.isFinite(days) ? days : 14, branchId);
    }),
  );

  router.get(
    '/reports/stock-movement',
    authenticate,
    requireFeature(FEATURES.REPORTS_VIEW),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as { from?: string; to?: string; limit?: string };
      const limit = q.limit ? Number(q.limit) : 100;
      return getStockMovementReport(tenantId, q.from, q.to, Number.isFinite(limit) ? limit : 100);
    }),
  );

  router.get(
    '/reports/staff-performance',
    authenticate,
    requireFeature(FEATURES.REPORTS_ADVANCED),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as { from?: string; to?: string };
      return getStaffPerformanceReport(tenantId, q.from, q.to);
    }),
  );

  return router;
}
