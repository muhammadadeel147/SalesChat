import type { Request, RequestHandler } from 'express';
import { Router } from 'express';

import { FEATURES } from '../../constants/index.js';

import { jsonHandler } from '../../middleware/async-handler.js';
import { ValidationError, ForbiddenError } from '../core/errors.js';
import { resolveTenantId } from '../core/tenant.js';
import { authenticate, requireFeature } from '../permissions/permissions.middleware.js';
import { resolveUserFeatures, userHasFeature } from '../permissions/permissions.service.js';
import { USER_ROLES } from '../../constants/index.js';
import {
  adjustStock,
  categorySchema,
  createCategory,
  createProduct,
  createShopPart,
  deleteCategory,
  deleteProduct,
  deleteShopPart,
  bulkAssignProductsToPart,
  bulkAssignPartSchema,
  getInventorySummary,
  getProductByBarcode,
  importProducts,
  importProductsSchema,
  listCategories,
  listShopParts,
  listProducts,
  getMiscOpenProduct,
  productSchema,
  purgeAllProducts,
  shopPartSchema,
  stockAdjustSchema,
  updateCategory,
  updateProduct,
  updateShopPart,
} from './inventory.service.js';
import {
  openBatchForLoose,
  adjustBatch,
  adjustBatchSchema,
  closeOutBatch,
  closeOutBatchSchema,
  getBatchSummary,
  getBatchStockCounts,
  listOpenBatches,
  listProductBatches,
  receiveBatch,
  receiveBatchSchema,
} from './batch.service.js';

const requireProductImages = requireFeature(FEATURES.INVENTORY_PRODUCT_IMAGES);
const requireShopParts = requireFeature(FEATURES.INVENTORY_SHOP_PARTS);

const requireProductImagesForWrite: RequestHandler = (req, res, next) => {
  const body = req.body as Record<string, unknown> | null | undefined;
  if (body && Object.prototype.hasOwnProperty.call(body, 'imageUrl')) {
    requireProductImages(req, res, next);
    return;
  }
  next();
};

/** Product create/update may include partId — require shop-parts feature when present. */
const requireShopPartsForPartIdWrite: RequestHandler = (req, res, next) => {
  const body = req.body as Record<string, unknown> | null | undefined;
  if (body && Object.prototype.hasOwnProperty.call(body, 'partId')) {
    requireShopParts(req, res, next);
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
    '/shop-parts',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SHOP_PARTS),
    jsonHandler(async (req) => {
      const q = req.query as { search?: string };
      return listShopParts(resolveTenantId(req), q.search);
    }),
  );

  router.post(
    '/shop-parts',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SHOP_PARTS),
    jsonHandler(async (req) => {
      const parsed = shopPartSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return createShopPart(resolveTenantId(req), parsed.data);
    }),
  );

  router.patch(
    '/shop-parts/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SHOP_PARTS),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const parsed = shopPartSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return updateShopPart(resolveTenantId(req), id, parsed.data);
    }),
  );

  router.delete(
    '/shop-parts/:id',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SHOP_PARTS),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      return deleteShopPart(resolveTenantId(req), id);
    }),
  );

  router.patch(
    '/products/bulk-assign-part',
    authenticate,
    requireFeature(FEATURES.INVENTORY_SHOP_PARTS),
    jsonHandler(async (req) => {
      const parsed = bulkAssignPartSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return bulkAssignProductsToPart(resolveTenantId(req), parsed.data);
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
    '/products/batch-stock-counts',
    authenticate,
    requireFeature(FEATURES.INVENTORY_VIEW),
    jsonHandler(async (req) => {
      const counts = await getBatchStockCounts(resolveTenantId(req));
      return Object.fromEntries(counts);
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
        partId?: string;
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
      const partId =
        q.partId === 'none' || q.partId === '__unassigned__'
          ? '__unassigned__'
          : q.partId || undefined;
      return listProducts(resolveTenantId(req), {
        search: q.search,
        categoryId: q.categoryId,
        partId,
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
    requireShopPartsForPartIdWrite,
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
    requireShopPartsForPartIdWrite,
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
      const assignsParts = parsed.data.rows.some((row) => Boolean(row.partName?.trim()));
      if (assignsParts) {
        const user = req.user!;
        if (user.role !== USER_ROLES.SUPER_ADMIN) {
          const liveFeatures = await resolveUserFeatures(user.id, user.role, user.tenantId);
          if (!userHasFeature(liveFeatures, FEATURES.INVENTORY_SHOP_PARTS)) {
            throw new ForbiddenError(
              'This feature requires a plan upgrade. Contact SaleChat to unlock it.',
              'UPGRADE_REQUIRED',
            );
          }
        }
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

  router.get(
    '/batches',
    authenticate,
    requireFeature(FEATURES.INVENTORY_VIEW),
    jsonHandler(async (req) => {
      const q = req.query as { productId?: string; openOnly?: string };
      if (q.openOnly === 'false' && q.productId) {
        return listProductBatches(resolveTenantId(req), q.productId, { status: 'all' });
      }
      return listOpenBatches(resolveTenantId(req), q.productId);
    }),
  );

  router.get(
    '/products/:id/batches',
    authenticate,
    requireFeature(FEATURES.INVENTORY_VIEW),
    jsonHandler(async (req) => {
      const { id } = req.params as { id: string };
      const q = req.query as { status?: string };
      const status =
        q.status === 'WAREHOUSE' ||
        q.status === 'OPEN' ||
        q.status === 'CLOSED' ||
        q.status === 'DAMAGED' ||
        q.status === 'all'
          ? q.status
          : 'all';
      return listProductBatches(resolveTenantId(req), id, { status });
    }),
  );

  router.post(
    '/products/:id/batches',
    authenticate,
    requireFeature(FEATURES.INVENTORY_STOCK_ADJUST),
    jsonHandler(async (req: Request) => {
      const { id } = req.params as { id: string };
      const parsed = receiveBatchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return receiveBatch(resolveTenantId(req), id, parsed.data, req.user!.id);
    }),
  );

  router.post(
    '/batches/:batchId/adjust',
    authenticate,
    requireFeature(FEATURES.INVENTORY_STOCK_ADJUST),
    jsonHandler(async (req: Request) => {
      const { batchId } = req.params as { batchId: string };
      const parsed = adjustBatchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return adjustBatch(resolveTenantId(req), batchId, parsed.data, req.user!.id);
    }),
  );

  router.post(
    '/batches/:batchId/open-for-loose',
    authenticate,
    requireFeature(FEATURES.INVENTORY_STOCK_ADJUST),
    jsonHandler(async (req: Request) => {
      const { batchId } = req.params as { batchId: string };
      return openBatchForLoose(resolveTenantId(req), batchId);
    }),
  );

  router.post(
    '/batches/:batchId/close-out',
    authenticate,
    requireFeature(FEATURES.INVENTORY_STOCK_ADJUST),
    jsonHandler(async (req: Request) => {
      const { batchId } = req.params as { batchId: string };
      const parsed = closeOutBatchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', parsed.error.flatten());
      }
      return closeOutBatch(resolveTenantId(req), batchId, parsed.data, req.user!.id);
    }),
  );

  router.get(
    '/batches/:batchId/summary',
    authenticate,
    requireFeature(FEATURES.INVENTORY_VIEW),
    jsonHandler(async (req) => {
      const { batchId } = req.params as { batchId: string };
      return getBatchSummary(resolveTenantId(req), batchId);
    }),
  );

  return router;
}
