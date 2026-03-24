-- ============================================================
-- Threshold — Initial Database Schema
-- ============================================================

-- ---------- ENUMS ----------

CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'portfolio');
CREATE TYPE property_type AS ENUM ('single_family', 'condo', 'townhouse', 'apartment');
CREATE TYPE occupancy_status AS ENUM ('rental', 'primary', 'vacation');
CREATE TYPE appliance_status AS ENUM ('good', 'needs_attention', 'replace_soon');
CREATE TYPE service_type AS ENUM ('repair', 'maintenance', 'inspection', 'installation');
CREATE TYPE document_category AS ENUM ('warranty', 'manual', 'receipt', 'inspection', 'insurance', 'lease', 'permit', 'other');
CREATE TYPE maintenance_type AS ENUM ('scheduled', 'completed', 'upcoming');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- ---------- PROFILES ----------

CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name    text,
  avatar_url   text,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ---------- PROPERTIES ----------

CREATE TABLE properties (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             text NOT NULL,
  address_line1    text NOT NULL,
  address_line2    text,
  city             text NOT NULL,
  state            text NOT NULL,
  zip              text NOT NULL,
  property_type    property_type NOT NULL,
  occupancy_status occupancy_status NOT NULL,
  beds             int,
  baths            numeric,
  sqft             int,
  year_built       int,
  photo_url        text,
  rent_amount      numeric,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_user_id ON properties(user_id);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- ---------- ROOMS ----------

CREATE TABLE rooms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name         text NOT NULL,
  type         text,
  photo_url    text,
  paint_colors jsonb DEFAULT '[]'::jsonb,
  fixtures     jsonb DEFAULT '[]'::jsonb,
  features     text[] DEFAULT '{}',
  light_bulbs  jsonb DEFAULT '[]'::jsonb,
  notes        text,
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rooms_property_id ON rooms(property_id);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rooms"
  ON rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = rooms.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own rooms"
  ON rooms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = rooms.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own rooms"
  ON rooms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = rooms.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own rooms"
  ON rooms FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = rooms.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ---------- APPLIANCES ----------

CREATE TABLE appliances (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id             uuid REFERENCES rooms(id) ON DELETE SET NULL,
  name                text NOT NULL,
  brand               text,
  model               text,
  serial_number       text,
  photo_url           text,
  purchase_date       date,
  warranty_expiration date,
  manual_url          text,
  status              appliance_status NOT NULL DEFAULT 'good',
  location            text,
  operating_tips      text[] DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_appliances_property_id ON appliances(property_id);
CREATE INDEX idx_appliances_room_id ON appliances(room_id);

ALTER TABLE appliances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appliances"
  ON appliances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = appliances.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own appliances"
  ON appliances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = appliances.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own appliances"
  ON appliances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = appliances.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own appliances"
  ON appliances FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = appliances.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ---------- SERVICE HISTORY ----------

CREATE TABLE service_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appliance_id  uuid NOT NULL REFERENCES appliances(id) ON DELETE CASCADE,
  type          service_type NOT NULL,
  date          date NOT NULL,
  provider      text,
  description   text,
  cost          numeric,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_history_appliance_id ON service_history(appliance_id);

ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service history"
  ON service_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appliances
      JOIN properties ON properties.id = appliances.property_id
      WHERE appliances.id = service_history.appliance_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own service history"
  ON service_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appliances
      JOIN properties ON properties.id = appliances.property_id
      WHERE appliances.id = service_history.appliance_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own service history"
  ON service_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM appliances
      JOIN properties ON properties.id = appliances.property_id
      WHERE appliances.id = service_history.appliance_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own service history"
  ON service_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM appliances
      JOIN properties ON properties.id = appliances.property_id
      WHERE appliances.id = service_history.appliance_id
        AND properties.user_id = auth.uid()
    )
  );

-- ---------- DOCUMENTS ----------

CREATE TABLE documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name         text NOT NULL,
  category     document_category NOT NULL DEFAULT 'other',
  file_url     text,
  file_size    bigint,
  uploaded_at  timestamptz NOT NULL DEFAULT now(),
  notes        text
);

CREATE INDEX idx_documents_property_id ON documents(property_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = documents.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = documents.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = documents.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = documents.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ---------- MAINTENANCE EVENTS ----------

CREATE TABLE maintenance_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type         maintenance_type NOT NULL,
  category     text,
  title        text NOT NULL,
  description  text,
  date         date,
  cost         numeric,
  provider     text,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_events_property_id ON maintenance_events(property_id);

ALTER TABLE maintenance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maintenance events"
  ON maintenance_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = maintenance_events.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own maintenance events"
  ON maintenance_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = maintenance_events.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own maintenance events"
  ON maintenance_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = maintenance_events.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own maintenance events"
  ON maintenance_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = maintenance_events.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ---------- EMERGENCY INFO ----------

CREATE TABLE emergency_info (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  water_shutoff         jsonb,
  electric_shutoff      jsonb,
  gas_shutoff           jsonb,
  fire_extinguishers    jsonb,
  emergency_contacts    jsonb DEFAULT '[]'::jsonb,
  emergency_procedures  jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT uq_emergency_info_property UNIQUE (property_id)
);

CREATE INDEX idx_emergency_info_property_id ON emergency_info(property_id);

ALTER TABLE emergency_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency info"
  ON emergency_info FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = emergency_info.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own emergency info"
  ON emergency_info FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = emergency_info.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own emergency info"
  ON emergency_info FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = emergency_info.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own emergency info"
  ON emergency_info FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = emergency_info.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ---------- HANDBOOK CONFIGS ----------

CREATE TABLE handbook_configs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  share_id         text UNIQUE,
  published        boolean NOT NULL DEFAULT false,
  password_hash    text,
  welcome_message  text,
  wifi             jsonb,
  parking          text,
  trash            text,
  house_rules      text[] DEFAULT '{}',
  local_recommendations jsonb DEFAULT '[]'::jsonb,
  utility_info     jsonb DEFAULT '[]'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_handbook_configs_property UNIQUE (property_id)
);

CREATE INDEX idx_handbook_configs_property_id ON handbook_configs(property_id);
CREATE INDEX idx_handbook_configs_share_id ON handbook_configs(share_id);

ALTER TABLE handbook_configs ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own handbook configs
CREATE POLICY "Users can view own handbook configs"
  ON handbook_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = handbook_configs.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- Public access for published handbooks (for tenants / anyone with the link)
CREATE POLICY "Public can view published handbooks"
  ON handbook_configs FOR SELECT
  USING (published = true);

CREATE POLICY "Users can insert own handbook configs"
  ON handbook_configs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = handbook_configs.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own handbook configs"
  ON handbook_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = handbook_configs.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own handbook configs"
  ON handbook_configs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = handbook_configs.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ---------- SUBSCRIPTIONS ----------

CREATE TABLE subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id  text,
  stripe_price_id         text,
  status                  subscription_status NOT NULL DEFAULT 'trialing',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ---------- ACTIVITY LOG ----------

CREATE TABLE activity_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id  uuid REFERENCES properties(id) ON DELETE CASCADE,
  type         text NOT NULL,
  title        text NOT NULL,
  description  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_property_id ON activity_log(property_id);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
  ON activity_log FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
  ON activity_log FOR DELETE
  USING (auth.uid() = user_id);

-- ---------- AUTO-CREATE PROFILE TRIGGER ----------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------- UPDATED_AT TRIGGER ----------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_appliances_updated_at
  BEFORE UPDATE ON appliances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_handbook_configs_updated_at
  BEFORE UPDATE ON handbook_configs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
