-- Cover photo framing: the displayed cover_image becomes a derived (cropped)
-- asset; the pristine upload is kept for non-destructive re-editing, along
-- with the crop rect (normalized against the original) and the focal point
-- (normalized within the displayed cover, drives background-position).

alter table public.studios
  add column if not exists cover_image_original text,
  add column if not exists cover_crop jsonb,
  add column if not exists cover_focal jsonb;
