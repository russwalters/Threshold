-- ============================================================
-- Threshold — Migration 003: Consumables, Photos, Breaker Panel
-- ============================================================

-- ---------- CONSUMABLES ----------

CREATE TABLE consumables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  appliance_id uuid REFERENCES appliances(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other', -- 'air_filter', 'water_filter', 'light_bulb', 'battery', 'cleaning', 'other'
  brand text,
  model text,
  size text, -- e.g., "20x25x1", "GE MWF"
  photo_url text,
  purchase_url text, -- Amazon or other link
  last_replaced date,
  replacement_interval_days integer, -- how often to replace
  next_replacement date, -- computed or manual
  notes text,
  quantity_on_hand integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consumables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consumables" ON consumables
FOR ALL TO authenticated
USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()))
WITH CHECK (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

CREATE INDEX idx_consumables_property ON consumables(property_id);
CREATE INDEX idx_consumables_appliance ON consumables(appliance_id);

-- ---------- BREAKER PANEL ON EMERGENCY_INFO ----------

ALTER TABLE emergency_info ADD COLUMN IF NOT EXISTS breaker_panel jsonb DEFAULT '[]'::jsonb;
-- breaker_panel stores array of: { position: number, label: string, amperage: number, type: 'single'|'double', rooms: string[], isMain: boolean, photo_url?: string }

-- ---------- PHOTO ARRAYS FOR DETAILED ITEMS ----------

-- Add photo_urls array columns for rooms (to store multiple photos of paint, fixtures, etc.)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';
-- Add photo_urls array for appliances (multiple angles)
ALTER TABLE appliances ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';

-- ---------- TRIGGER FOR UPDATED_AT ON CONSUMABLES ----------

CREATE TRIGGER set_consumables_updated_at
  BEFORE UPDATE ON consumables
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
