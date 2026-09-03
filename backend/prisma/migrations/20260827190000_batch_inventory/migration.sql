-- Batch inventory: track_type + dispensing loss on products, batches table,
-- sale_items cost/qty snapshots, stock_movements.batch_id, close tolerance.

CREATE TYPE "ProductTrackType" AS ENUM ('SIMPLE', 'BATCH');
CREATE TYPE "BatchStatus" AS ENUM ('OPEN', 'CLOSED', 'DAMAGED');

ALTER TABLE "products"
  ADD COLUMN "track_type" "ProductTrackType" NOT NULL DEFAULT 'SIMPLE',
  ADD COLUMN "dispensing_loss_percent" DECIMAL(5, 2) NOT NULL DEFAULT 0;

CREATE INDEX "products_tenant_id_track_type_idx"
  ON "products" ("tenant_id", "track_type");

CREATE TABLE "batches" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "purchase_date" DATE NOT NULL,
  "supplier" VARCHAR(255),
  "purchase_reference" VARCHAR(100),
  "cost_per_unit" DECIMAL(12, 4) NOT NULL,
  "initial_quantity" DECIMAL(12, 3) NOT NULL,
  "remaining_quantity" DECIMAL(12, 3) NOT NULL,
  "status" "BatchStatus" NOT NULL DEFAULT 'OPEN',
  "notes" TEXT,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "batches_tenant_id_product_id_status_idx"
  ON "batches" ("tenant_id", "product_id", "status");

CREATE INDEX "batches_tenant_id_status_purchase_date_idx"
  ON "batches" ("tenant_id", "status", "purchase_date");

ALTER TABLE "batches"
  ADD CONSTRAINT "batches_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "batches"
  ADD CONSTRAINT "batches_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "batches"
  ADD CONSTRAINT "batches_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "stock_movements"
  ADD COLUMN "batch_id" UUID;

CREATE INDEX "stock_movements_tenant_id_batch_id_created_at_idx"
  ON "stock_movements" ("tenant_id", "batch_id", "created_at");

ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_batch_id_fkey"
  FOREIGN KEY ("batch_id") REFERENCES "batches"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sale_items"
  ADD COLUMN "batch_id" UUID,
  ADD COLUMN "quantity_deducted" DECIMAL(12, 3),
  ADD COLUMN "unit_cost_at_sale" DECIMAL(12, 4);

-- Legacy lines: billed qty == deducted qty; cost left null (reports fall back to live cost_price until backfilled).
UPDATE "sale_items"
SET "quantity_deducted" = "quantity"
WHERE "quantity_deducted" IS NULL;

CREATE INDEX "sale_items_batch_id_idx" ON "sale_items" ("batch_id");

ALTER TABLE "sale_items"
  ADD CONSTRAINT "sale_items_batch_id_fkey"
  FOREIGN KEY ("batch_id") REFERENCES "batches"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "business_settings"
  ADD COLUMN "batch_close_tolerance" DECIMAL(12, 3) NOT NULL DEFAULT 0.1;

-- RLS (same pattern as other tenant tables)
ALTER TABLE "batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "batches" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "batches";
CREATE POLICY tenant_isolation ON "batches"
  USING (app_bypass_rls() OR tenant_id = app_current_tenant_id())
  WITH CHECK (app_bypass_rls() OR tenant_id = app_current_tenant_id());
