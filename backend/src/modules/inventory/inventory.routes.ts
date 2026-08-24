import type { Request, RequestHandler } from 'express';
import { Router } from 'express';

import { FEATURES } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { ValidationError } from '../core/errors.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate, requireFeature } from '../permissions/permissions.middleware.js';
import {
  adjustStock,
  categorySchema,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getInventorySummary,
  getProductByBarcode,
  importProducts,
  importProductsSchema,
  listCategories,
  listProducts,
  getMiscOpenProduct,
  productSchema,
  purgeAllProducts,
  stockAdjustSchema,
  updateCategory,
  updateProduct,
} from './inventory.service.js';

const requireProductImages = requireFeature(FEATURES.INVENTORY_PRODUCT_IMAGES);

const requireProductImagesForWrite: RequestHandler = (req, res, next) => {
  const body = req.body as Record<string, unknown> | null | undefined;
  if (body && Object.prototype.hasOwnProperty.call(body, 'imageUrl')) {
    requireProductImages(req, res, next);
    return;
  }
  next();
};

export function createInventoryRouter(): Router {
  const router = Router();

  router.get(
    '/categories',
    authenticate,
    requireFeature(FEATURES.INVENTORY_CATEGORIES),
    jsonHandler(async (req) => {
      const q = req.query as { search?: string };
      return listCategories(resolveTenantId(req), q.search);
    }),
  );

  router.post(
    '/categories',
    authenticate,
    requireFeature(FEATURES.INVENTORY_CATEGORIES),
    jsonHandler(async (req) => {
      const parsed = categorySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createCategory(resolveTenantId(req), parsed.data);
    }),
  );

  router.patch(
    '/categories/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_CATEGORIES),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const parsed = categorySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateCategory(resolveTenantId(req), id, parsed.data);
    }),
  );

  router.delete(
    '/categories/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_CATEGORIES),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return deleteCategory(resolveTenantId(req), id);
    }),
  );

  router.get(
    '/products/summary',
    authenticate,
    requireFeature(FEATURES.INVENTORY_VIEW),
    jsonHandler(async (req) => {
      return getInventorySummary(resolveTenantId(req));
    }),
  );

  router.get(
    '/products/misc-open',
    authenticate,
    requireFeature(FEATURES.BILLING_CREATE_SALE),
    jsonHandler(async (req) => {
      return getMiscOpenProduct(resolveTenantId(req));
    }),
  );

  router.get(
    '/products',
    authenticate,
    requireFeature(FEATURES.INVENTORY_VIEW),
    jsonHandler(async (req) => {
      const q = req.query as {
        search?: string;
        categoryId?: string;
        brandId?: string;
        stockStatus?: 'all' | 'healthy' | 'low' | 'out';
        page?: string;
        pageSize?: string;
        activeOnly?: string;
        skipCount?: string;
        ids?: string;
      };
      const ids = q.ids
        ? q.ids
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 40)
        : undefined;
      return listProducts(resolveTenantId(req), {
        search: q.search,
        categoryId: q.categoryId,
        brandId: q.brandId,
        stockStatus: q.stockStatus,
        page: q.page ? Number(q.page) : 1,
        pageSize: q.pageSize ? Number(q.pageSize) : 50,
        activeOnly: q.activeOnly === 'true' || q.activeOnly === '1',
        skipCount: q.skipCount === 'true' || q.skipCount === '1',
        ids,
      });
    }),
  );

  router.get(
    '/products/barcode/:barcode',
    authenticate,
    requireFeature(FEATURES.INVENTORY_VIEW),
    jsonHandler(async (req) => {
      const { barcode } = req.params as { barcode: string };
      return getProductByBarcode(resolveTenantId(req), decodeURIComponent(barcode));
    }),
  );

  router.post(
    '/products',
    authenticate,
    requireFeature(FEATURES.INVENTORY_EDIT),
    requireProductImagesForWrite,
    jsonHandler(async (req) => {
      const parsed = productSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createProduct(resolveTenantId(req), parsed.data);
    }),
  );

  router.patch(
    '/products/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_EDIT),
    requireProductImagesForWrite,
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const parsed = productSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateProduct(resolveTenantId(req), id, parsed.data);
    }),
  );

  router.delete(
    '/products/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_EDIT),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return deleteProduct(resolveTenantId(req), id);
    }),
  );

  router.post(
    '/products/import',
    authenticate,
    requireFeature(FEATURES.INVENTORY_EDIT),
    jsonHandler(async (req) => {
      const parsed = importProductsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return importProducts(resolveTenantId(req), parsed.data);
    }),
  );

  router.delete(
    '/products',
    authenticate,
    requireFeature(FEATURES.INVENTORY_EDIT),
    jsonHandler(async (req) => {
      const q = req.query as { confirm?: string };
      if (q.confirm !== 'true') {
        throw new ValidationError('Add ?confirm=true to purge all inventory');
      }
      return purgeAllProducts(resolveTenantId(req));
    }),
  );

  router.post(
    '/products/:id/stock',
    authenticate,
    requireFeature(FEATURES.INVENTORY_STOCK_ADJUST),
    jsonHandler(async (req: Request) => {
      const { id } = req.params as { id: string };
      const parsed = stockAdjustSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return adjustStock(resolveTenantId(req), id, parsed.data, req.user!.id);
    }),
  );

  return router;
}
