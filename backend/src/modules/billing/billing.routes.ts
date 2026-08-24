import { Router } from 'express';

import { FEATURES } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { ValidationError } from '../core/errors.js';
import { resolveBranchId } from '../core/branch.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate, requireFeature } from '../permissions/permissions.middleware.js';
import { printSaleSlip } from '../printer/printer.service.js';
import { getSettings } from '../settings/settings.service.js';
import {
  createSale,
  createSaleSchema,
  getSaleDetail,
  listSales,
  partialReturn,
  partialReturnSchema,
  voidSale,
} from './billing.service.js';
import {
  createDiscount,
  discountSchema,
  getDiscountUsageReport,
  listDiscounts,
  updateDiscount,
} from './discounts.service.js';
import {
  createGiftCard,
  giftCardSchema,
  listGiftCards,
  lookupGiftCard,
} from './gift-cards.service.js';
import {
  deleteHeldCart,
  heldCartSchema,
  listHeldCarts,
  saveHeldCart,
} from './held-carts.service.js';

export function createBillingRouter(): Router {
  const router = Router();

  router.get(
    '/sales',
    authenticate,
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const q = req.query as {
        page?: string;
        pageSize?: string;
        search?: string;
        from?: string;
        to?: string;
      };
      return listSales(
        tenantId,
        q.page ? Number(q.page) : 1,
        q.pageSize ? Number(q.pageSize) : 20,
        undefined,
        q.search,
        q.from,
        q.to,
      );
    }),
  );

  router.get(
    '/sales/:saleId',
    authenticate,
    jsonHandler(async (req) => {
      const { saleId } = req.params as { saleId: string };
      return getSaleDetail(resolveTenantId(req), saleId);
    }),
  );

  router.post(
    '/sales/:saleId/print-slip',
    authenticate,
    requireFeature(FEATURES.BILLING_CREATE_SALE),
    requireFeature(FEATURES.BILLING_PRINT_RECEIPT),
    jsonHandler(async (req) => {
      const { saleId } = req.params as { saleId: string };
      return printSaleSlip(resolveTenantId(req), saleId);
    }),
  );

  router.post(
    '/sales',
    authenticate,
    requireFeature(FEATURES.BILLING_CREATE_SALE),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const parsed = createSaleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }

      const settings = await getSettings(tenantId);
      const canUnlimited = req.user!.features.includes(FEATURES.BILLING_DISCOUNT_UNLIMITED);
      const branchId = await resolveBranchId(req, tenantId);

      const hasDiscount =
        (parsed.data.billDiscountAmount ?? 0) > 0 ||
        parsed.data.items.some((i) => (i.discountAmount ?? 0) > 0);

      if (hasDiscount && !req.user!.features.includes(FEATURES.BILLING_DISCOUNT)) {
        throw new ValidationError('Discount feature not enabled');
      }

      return createSale(tenantId, req.user!.id, parsed.data, {
        canDiscountUnlimited: canUnlimited,
        maxDiscountPercent: settings.maxDiscountPercentStaff
          ? Number(settings.maxDiscountPercentStaff)
          : null,
        branchId,
      });
    }),
  );

  router.post(
    '/sales/:saleId/void',
    authenticate,
    requireFeature(FEATURES.BILLING_VOID_SALE),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const { saleId } = req.params as { saleId: string };
      const body = req.body as { reason?: string };
      if (!body?.reason) throw new ValidationError('Void reason is required');
      return voidSale(tenantId, saleId, req.user!.id, body.reason, req.ip);
    }),
  );

  router.post(
    '/sales/:saleId/return',
    authenticate,
    requireFeature(FEATURES.BILLING_CREATE_SALE),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const { saleId } = req.params as { saleId: string };
      const parsed = partialReturnSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return partialReturn(tenantId, saleId, req.user!.id, parsed.data);
    }),
  );

  router.get(
    '/held-carts',
    authenticate,
    requireFeature(FEATURES.BILLING_HELD_CARTS),
    jsonHandler(async (req) => {
      return listHeldCarts(resolveTenantId(req), req.user!.id);
    }),
  );

  router.post(
    '/held-carts',
    authenticate,
    requireFeature(FEATURES.BILLING_HELD_CARTS),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const parsed = heldCartSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      const branchId = await resolveBranchId(req, tenantId).catch(() => undefined);
      return saveHeldCart(tenantId, req.user!.id, parsed.data, branchId);
    }),
  );

  router.delete(
    '/held-carts/:id',
    authenticate,
    requireFeature(FEATURES.BILLING_HELD_CARTS),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return deleteHeldCart(resolveTenantId(req), id, req.user!.id);
    }),
  );

  router.get(
    '/gift-cards',
    authenticate,
    requireFeature(FEATURES.BILLING_CREATE_SALE),
    jsonHandler(async (req) => {
      return listGiftCards(resolveTenantId(req));
    }),
  );

  router.post(
    '/gift-cards',
    authenticate,
    requireFeature(FEATURES.BILLING_CREATE_SALE),
    jsonHandler(async (req) => {
      const parsed = giftCardSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createGiftCard(resolveTenantId(req), parsed.data);
    }),
  );

  router.get(
    '/gift-cards/lookup/:code',
    authenticate,
    requireFeature(FEATURES.BILLING_CREATE_SALE),
    jsonHandler(async (req) => {
      const { code } = req.params as { code: string };
      return lookupGiftCard(resolveTenantId(req), decodeURIComponent(code));
    }),
  );

  router.get(
    '/discounts',
    authenticate,
    requireFeature(FEATURES.BILLING_DISCOUNT),
    jsonHandler(async (req) => {
      const q = req.query as { includeInactive?: string };
      return listDiscounts(resolveTenantId(req), q.includeInactive === 'true');
    }),
  );

  router.post(
    '/discounts',
    authenticate,
    requireFeature(FEATURES.BILLING_DISCOUNT),
    jsonHandler(async (req) => {
      const parsed = discountSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createDiscount(resolveTenantId(req), parsed.data);
    }),
  );

  router.patch(
    '/discounts/:id',
    authenticate,
    requireFeature(FEATURES.BILLING_DISCOUNT),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const parsed = discountSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateDiscount(resolveTenantId(req), id, parsed.data);
    }),
  );

  router.get(
    '/discounts/usage-report',
    authenticate,
    requireFeature(FEATURES.BILLING_DISCOUNT),
    jsonHandler(async (req) => {
      const q = req.query as { from?: string; to?: string };
      return getDiscountUsageReport(resolveTenantId(req), q.from, q.to);
    }),
  );

  return router;
}
