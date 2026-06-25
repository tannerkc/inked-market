-- Studios table: unified for both Google-seeded and organic listings
CREATE TABLE studios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,

  -- Source tracking
  source          text NOT NULL CHECK (source IN ('google', 'organic')),
  google_place_id text UNIQUE,
  claimed_by      uuid REFERENCES auth.users(id),
  claimed_at      timestamptz,

  -- Location
  address         text,
  city            text NOT NULL,
  state           text NOT NULL,
  zip_code        text,
  latitude        float8,
  longitude       float8,

  -- Contact
  phone           text,
  email           text,
  website         text,

  -- Business data
  hours           jsonb,
  specialties     text[] DEFAULT '{}',
  rating          float4,
  review_count    int DEFAULT 0,

  -- Media
  profile_image   text,
  cover_image     text,
  images          text[],

  -- Visibility
  is_visible      boolean DEFAULT true,

  -- Timestamps
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_studios_source ON studios(source);
CREATE INDEX idx_studios_city_state ON studios(city, state);
CREATE INDEX idx_studios_claimed_by ON studios(claimed_by);
CREATE INDEX idx_studios_slug ON studios(slug);
CREATE INDEX idx_studios_listing_query ON studios(source, city, state, is_visible);
CREATE INDEX idx_studios_rating ON studios(rating DESC NULLS LAST);

-- Seed config: feature flag toggles
CREATE TABLE seed_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  enabled    boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_seed_config_key ON seed_config(key);

-- Initial global toggle
INSERT INTO seed_config (key, enabled) VALUES ('global_seeded_visible', true);

-- RLS policies
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_config ENABLE ROW LEVEL SECURITY;

-- Studios: public read for visible listings
CREATE POLICY "Public can read visible studios"
  ON studios FOR SELECT
  USING (is_visible = true);

-- Studios: owners can update their claimed studio
CREATE POLICY "Owners can update their studio"
  ON studios FOR UPDATE
  USING (claimed_by = auth.uid())
  WITH CHECK (claimed_by = auth.uid());

-- Studios: authenticated users can insert (for organic signups)
CREATE POLICY "Authenticated users can insert studios"
  ON studios FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed config: public read (flags need to be readable by server components)
CREATE POLICY "Public can read seed config"
  ON seed_config FOR SELECT
  USING (true);

-- Seed config: only service role can modify (handled by default, no policy needed for service role)

-- Storage bucket for studio images
INSERT INTO storage.buckets (id, name, public) VALUES ('studio-images', 'studio-images', true);

-- Storage policy: public read
CREATE POLICY "Public can read studio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'studio-images');

-- Storage policy: service role can upload (for seeding script)
CREATE POLICY "Service role can upload studio images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'studio-images');

-- Storage policy: authenticated users can upload to their own studio folder
CREATE POLICY "Studio owners can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'studio-images');
