import { Router } from 'express';

import { FEATURES } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { ValidationError } from '../core/errors.js';
import { resolveBranchId } from '../core/branch.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate, requireFeature } from '../permissions/permissions.middleware.js';
import {
  brandSchema,
  createBrand,
  createSupplier,
  deleteBrand,
  deleteSupplier,
  listBrands,
  listSuppliers,
  supplierPaymentSchema,
  supplierSchema,
  supplierStockIn,
  supplierStockInSchema,
  updateBrand,
  updateSupplier,
} from './catalog.service.js';
import {
  getSupplier,
  getSupplierLedger,
  recordSupplierPayment,
} from './supplier-ledger.service.js';

export function createCatalogRouter(): Router {
  const router = Router();

  router.get(
    '/brands',
    authenticate,
    requireFeature(FEATURES.INVENTORY_BRANDS),
    jsonHandler(async (req) => {
      const q = req.query as { search?: string };
      return listBrands(resolveTenantId(req), q.search);
    }),
  );

  router.post(
    '/brands',
    authenticate,
    requireFeature(FEATURES.INVENTORY_BRANDS),
    jsonHandler(async (req) => {
      const parsed = brandSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createBrand(resolveTenantId(req), parsed.data);
    }),
  );

  router.patch(
    '/brands/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_BRANDS),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const parsed = brandSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateBrand(resolveTenantId(req), id, parsed.data);
    }),
  );

  router.delete(
    '/brands/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_BRANDS),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return deleteBrand(resolveTenantId(req), id);
    }),
  );

  router.get(
    '/suppliers',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SUPPLIERS),
    jsonHandler(async (req) => {
      const q = req.query as { search?: string };
      return listSuppliers(resolveTenantId(req), q.search);
    }),
  );

  router.post(
    '/suppliers',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SUPPLIERS),
    jsonHandler(async (req) => {
      const parsed = supplierSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createSupplier(resolveTenantId(req), parsed.data);
    }),
  );

  router.patch(
    '/suppliers/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SUPPLIERS),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const parsed = supplierSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateSupplier(resolveTenantId(req), id, parsed.data);
    }),
  );

  router.delete(
    '/suppliers/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SUPPLIERS),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return deleteSupplier(resolveTenantId(req), id);
    }),
  );

  router.get(
    '/suppliers/:id/ledger',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SUPPLIERS),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return getSupplierLedger(resolveTenantId(req), id);
    }),
  );

  router.post(
    '/suppliers/:id/stock-in',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SUPPLIERS),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const { id } = req.params as { id: string };
      const parsed = supplierStockInSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      const branchId = await resolveBranchId(req, tenantId);
      return supplierStockIn(tenantId, id, parsed.data, req.user!.id, branchId);
    }),
  );

  router.post(
    '/suppliers/:id/payments',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SUPPLIERS),
    jsonHandler(async (req) => {
      const tenantId = resolveTenantId(req);
      const { id } = req.params as { id: string };
      const parsed = supplierPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      await recordSupplierPayment(
        tenantId,
        id,
        parsed.data.amount,
        parsed.data.paymentMethod,
        parsed.data.notes,
        req.user!.id,
      );
      return getSupplier(tenantId, id);
    }),
  );

  return router;
}
