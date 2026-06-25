-- Studio owners must always read their own studio, even when it is not publicly
-- visible (unpublished drafts in the freemium flow). The 001 policy only exposes
-- is_visible = true rows, which would hide an owner's own draft from their
-- dashboard/builder get() once publishing toggles is_visible off.
CREATE POLICY "Owners can read their studio"
  ON studios FOR SELECT
  USING (claimed_by = auth.uid());
