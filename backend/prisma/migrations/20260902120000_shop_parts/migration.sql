-- Shop Parts: logical divisions within one tenant for separate P&L tracking

CREATE TABLE IF NOT EXISTS shop_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS shop_parts_tenant_id_idx ON shop_parts(tenant_id);

ALTER TABLE shop_parts ADD COLUMN IF NOT EXISTS name_compact text
  GENERATED ALWAYS AS (regexp_replace(lower(name), '[[:space:]]+', '', 'g')) STORED;

CREATE INDEX IF NOT EXISTS shop_parts_tenant_name_compact_idx ON shop_parts(tenant_id, name_compact);

ALTER TABLE products ADD COLUMN IF NOT EXISTS part_id UUID REFERENCES shop_parts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS products_tenant_part_id_idx ON products(tenant_id, part_id);

ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS part_id UUID REFERENCES shop_parts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS sale_items_part_id_idx ON sale_items(part_id);
