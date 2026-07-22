-- Go-live model: is_visible is the single "listed on the marketplace" switch.
-- RLS public-read already keys on it (001), and owners can always read their
-- own row (003), so a draft studio 404s publicly while staying editable.
--
--   · Organic studios are created as drafts (is_visible = false). They 404
--     publicly until the owner has an active plan, completes the required
--     profile steps, and explicitly goes live — or publishes a custom site,
--     which implies going live.
--   · Google-seeded listings stay visible by default: they are the
--     marketplace supply and are governed by the seed_config flag system.
ALTER TABLE studios ALTER COLUMN is_visible SET DEFAULT false;

-- Backfill: organic studios without a live published site were created under
-- the old always-visible default — reset them to draft. Studios with a
-- published custom site have already earned their listing and stay live.
UPDATE studios
SET is_visible = false
WHERE source = 'organic'
  AND published_theme_config IS NULL;
