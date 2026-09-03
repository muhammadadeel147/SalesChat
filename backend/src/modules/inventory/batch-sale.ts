import type { Batch, BatchStatus, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { ConflictError, ValidationError } from '../core/errors.js';
import { toDecimal } from '../core/money.js';
import type { TransactionClient } from '../core/prisma.js';

export function roundQtySold(value: Decimal | number): Decimal {
  return toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export type BatchAllocation = {
  batchId: string;
  sourceStatus: BatchStatus;
  quantitySold: Decimal;
  quantityDeducted: Decimal;
  unitCostAtSale: Decimal;
  remainingAfter: Decimal;
  closed: boolean;
};

/**
 * Allocate a billed quantity across OPEN (counter) batches.
 * Throws ConflictError(BATCH_SPLIT_REQUIRED) when one batch is short but others can cover
 * and allowSplit is false.
 */
export async function allocateLooseBatchSale(
  tx: TransactionClient,
  params: {
    tenantId: string;
    product: Product;
    quantitySold: Decimal;
    preferredBatchId?: string | null;
    allowSplit: boolean;
    closeTolerance: Decimal;
  },
): Promise<BatchAllocation[]> {
  const { tenantId, product, preferredBatchId, allowSplit, closeTolerance } = params;
  const quantitySold = roundQtySold(params.quantitySold);
  if (quantitySold.lte(0)) {
    throw new ValidationError('Quantity must be greater than zero');
  }

  const openBatches = await tx.batch.findMany({
    where: { tenantId, productId: product.id, status: 'OPEN' },
    orderBy: [{ purchaseDate: 'asc' }, { createdAt: 'asc' }],
  });

  if (openBatches.length === 0) {
    throw new ConflictError(
      `No open counter batch for ${product.name}. Open a warehouse batch for loose sales in Inventory.`,
      'NO_OPEN_BATCH',
    );
  }

  let ordered: Batch[] = openBatches;
  if (preferredBatchId) {
    const preferred = openBatches.find((b) => b.id === preferredBatchId);
    if (!preferred) {
      throw new ValidationError('Selected batch is not open on the counter for this product');
    }
    ordered = [preferred, ...openBatches.filter((b) => b.id !== preferredBatchId)];
  }

  const totalRemaining = ordered.reduce((sum, b) => sum.plus(b.remainingQuantity), toDecimal(0));
  if (totalRemaining.lt(quantitySold)) {
    throw new ConflictError(
      `Insufficient batch stock for ${product.name}: need ${quantitySold.toFixed(3)} ${product.unit}, have ${totalRemaining.toFixed(3)}`,
      'INSUFFICIENT_BATCH_STOCK',
    );
  }

  const primary = ordered[0]!;
  if (primary.remainingQuantity.lt(quantitySold) && !allowSplit) {
    throw new ConflictError(
      `Batch only has ${primary.remainingQuantity.toFixed(3)} ${product.unit} remaining (need ${quantitySold.toFixed(3)}). Confirm to split across other open batches.`,
      'BATCH_SPLIT_REQUIRED',
    );
  }

  const allocations: BatchAllocation[] = [];
  let neededLeft = quantitySold;

  for (let i = 0; i < ordered.length && neededLeft.gt(0); i++) {
    const batch = ordered[i]!;
    const take = Decimal.min(batch.remainingQuantity, neededLeft);
    const remainingAfter = batch.remainingQuantity.minus(take);
    const closed = remainingAfter.lte(closeTolerance);

    allocations.push({
      batchId: batch.id,
      sourceStatus: 'OPEN',
      quantitySold: take,
      quantityDeducted: take,
      unitCostAtSale: batch.costPerUnit,
      remainingAfter: closed ? toDecimal(0) : remainingAfter,
      closed,
    });

    neededLeft = neededLeft.minus(take);
  }

  if (neededLeft.gt(0.0005)) {
    throw new ConflictError(`Could not allocate batch stock for ${product.name}`, 'BATCH_ALLOCATION_FAILED');
  }

  return allocations;
}

/** Sell an entire WAREHOUSE batch at the whole-batch rate. */
export async function allocateWholeBatchSale(
  tx: TransactionClient,
  params: {
    tenantId: string;
    product: Product;
    preferredBatchId?: string | null;
    closeTolerance: Decimal;
  },
): Promise<BatchAllocation[]> {
  const { tenantId, product, preferredBatchId, closeTolerance } = params;

  const warehouseBatches = await tx.batch.findMany({
    where: { tenantId, productId: product.id, status: 'WAREHOUSE' },
    orderBy: [{ purchaseDate: 'asc' }, { createdAt: 'asc' }],
  });

  if (warehouseBatches.length === 0) {
    throw new ConflictError(
      `No warehouse batch for ${product.name}. Receive stock in Inventory first.`,
      'NO_WAREHOUSE_BATCH',
    );
  }

  let batch = warehouseBatches[0]!;
  if (preferredBatchId) {
    const preferred = warehouseBatches.find((b) => b.id === preferredBatchId);
    if (!preferred) {
      throw new ValidationError('Selected batch is not in warehouse for this product');
    }
    batch = preferred;
  }

  const remaining = batch.remainingQuantity;
  if (remaining.lte(closeTolerance)) {
    throw new ConflictError(
      `Batch has no sellable quantity remaining (${remaining.toFixed(3)} ${product.unit})`,
      'INSUFFICIENT_BATCH_STOCK',
    );
  }

  return [
    {
      batchId: batch.id,
      sourceStatus: 'WAREHOUSE',
      quantitySold: toDecimal(1),
      quantityDeducted: remaining,
      unitCostAtSale: batch.costPerUnit,
      remainingAfter: toDecimal(0),
      closed: true,
    },
  ];
}

/** Atomically apply allocations to batches; returns movement rows (caller persists). */
export async function applyBatchAllocations(
  tx: TransactionClient,
  params: {
    tenantId: string;
    productId: string;
    productName: string;
    unit: string;
    allocations: BatchAllocation[];
    saleId: string;
    recordedById: string;
    branchId?: string;
  },
): Promise<{
  productStockAfter: Decimal;
  movements: Array<{
    tenantId: string;
    productId: string;
    batchId: string;
    movementType: 'SALE';
    quantityDelta: Decimal;
    quantityAfter: Decimal;
    referenceType: string;
    referenceId: string;
    notes: string | null;
    recordedById: string;
    branchId?: string;
  }>;
}> {
  const movements: Array<{
    tenantId: string;
    productId: string;
    batchId: string;
    movementType: 'SALE';
    quantityDelta: Decimal;
    quantityAfter: Decimal;
    referenceType: string;
    referenceId: string;
    notes: string | null;
    recordedById: string;
    branchId?: string;
  }> = [];

  let totalDeducted = toDecimal(0);

  for (const alloc of params.allocations) {
    const remainingAfter = alloc.remainingAfter.toFixed(3);
    const qtyDeducted = alloc.quantityDeducted.toFixed(3);
    const nextStatus = alloc.closed ? 'CLOSED' : alloc.sourceStatus;

    const rows = await tx.$queryRaw<{ remaining_quantity: Decimal }[]>`
      UPDATE batches
      SET remaining_quantity = ${remainingAfter}::numeric,
          status = ${nextStatus}::"BatchStatus",
          updated_at = NOW()
      WHERE id = ${alloc.batchId}::uuid
        AND tenant_id = ${params.tenantId}::uuid
        AND status = ${alloc.sourceStatus}::"BatchStatus"
        AND remaining_quantity >= ${qtyDeducted}::numeric
      RETURNING remaining_quantity
    `;
    if (!rows[0]) {
      throw new ConflictError(
        `Concurrent update: insufficient remaining on batch for ${params.productName}`,
        'BATCH_CONFLICT',
      );
    }

    totalDeducted = totalDeducted.plus(alloc.quantityDeducted);

    movements.push({
      tenantId: params.tenantId,
      productId: params.productId,
      batchId: alloc.batchId,
      movementType: 'SALE',
      quantityDelta: alloc.quantityDeducted.negated(),
      quantityAfter: rows[0].remaining_quantity,
      referenceType: 'sale',
      referenceId: params.saleId,
      notes: null,
      recordedById: params.recordedById,
      branchId: params.branchId,
    });
  }

  const totalDeductedStr = totalDeducted.toFixed(3);
  const productRows = await tx.$queryRaw<{ stock_quantity: Decimal }[]>`
    UPDATE products
    SET stock_quantity = stock_quantity - ${totalDeductedStr}::numeric,
        updated_at = NOW(),
        version = version + 1
    WHERE id = ${params.productId}::uuid
      AND tenant_id = ${params.tenantId}::uuid
      AND deleted_at IS NULL
      AND track_stock = true
      AND stock_quantity >= ${totalDeductedStr}::numeric
    RETURNING stock_quantity
  `;
  if (!productRows[0]) {
    throw new ConflictError(`Insufficient stock for ${params.productName}`, 'INSUFFICIENT_STOCK');
  }

  return { productStockAfter: productRows[0].stock_quantity, movements };
}
