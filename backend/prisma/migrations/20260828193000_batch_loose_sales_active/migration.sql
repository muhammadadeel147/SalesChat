ALTER TABLE batches ADD COLUMN loose_sales_active BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX batches_loose_sales_active_idx ON batches(tenant_id, product_id, loose_sales_active)
  WHERE loose_sales_active = true;
