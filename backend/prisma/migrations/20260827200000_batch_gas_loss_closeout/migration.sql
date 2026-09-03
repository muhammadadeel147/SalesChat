-- Batch close-out settlement fields (gas loss write-off at cylinder end)
ALTER TABLE batches
  ADD COLUMN closed_at TIMESTAMPTZ,
  ADD COLUMN gas_loss_quantity DECIMAL(12, 3),
  ADD COLUMN gas_loss_cost DECIMAL(12, 4);

-- Retire per-sale dispensing loss (replaced by end-of-cylinder write-off)
UPDATE products SET dispensing_loss_percent = 0 WHERE dispensing_loss_percent <> 0;
