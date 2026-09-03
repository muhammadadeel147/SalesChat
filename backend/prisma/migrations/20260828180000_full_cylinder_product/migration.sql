-- Full-cylinder sale product links to a batch-tracked loose product for stock.
ALTER TABLE products
  ADD COLUMN batch_source_product_id UUID REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX products_batch_source_product_id_idx ON products(batch_source_product_id);
