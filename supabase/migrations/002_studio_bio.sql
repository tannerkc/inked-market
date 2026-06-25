-- About / story text for the studio builder's About section.
-- Code (mapStudioDataToDbStudio / mapDbStudioToStudioData) already references bio;
-- this adds the column it was always meant to write to.
ALTER TABLE studios ADD COLUMN IF NOT EXISTS bio text;
