-- Warehouse vs counter batch model data + column changes.

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "batch_sell_price" DECIMAL(12, 2);

UPDATE "batches"
SET "status" = 'WAREHOUSE'
WHERE "status" = 'OPEN'
  AND COALESCE("loose_sales_active", false) = false;

UPDATE "products"
SET "batch_sell_price" = "sell_price"
WHERE "track_type" = 'BATCH'
  AND "batch_sell_price" IS NULL;

UPDATE "products"
SET "deleted_at" = NOW(),
    "is_active" = false
WHERE "batch_source_product_id" IS NOT NULL
  AND "deleted_at" IS NULL;

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_batch_source_product_id_fkey";
ALTER TABLE "products" DROP COLUMN IF EXISTS "batch_source_product_id";

DROP INDEX IF EXISTS "batches_loose_sales_active_idx";
ALTER TABLE "batches" DROP COLUMN IF EXISTS "loose_sales_active";
