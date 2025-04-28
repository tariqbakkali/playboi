/*
  # Update base options and performance rating

  1. Changes
    - Modify base column to only allow 'strikeout' or 'home'
    - Make performance_rating only required when base is 'home'
*/

-- Create type for base options
CREATE TYPE base_type AS ENUM ('strikeout', 'home');

-- Temporarily allow null in base column
ALTER TABLE meetings ALTER COLUMN base DROP NOT NULL;

-- Update existing data
UPDATE meetings 
SET base = CASE 
  WHEN base IN ('first', 'second', 'third') THEN 'strikeout'
  WHEN base = 'home' THEN 'home'
  ELSE NULL 
END;

-- Change base column type
ALTER TABLE meetings 
  ALTER COLUMN base TYPE base_type 
  USING base::base_type;

-- Add constraint to ensure performance_rating is set only when base is 'home'
ALTER TABLE meetings
  ADD CONSTRAINT performance_rating_home_only
  CHECK (
    (base = 'home' AND performance_rating IS NOT NULL) OR
    (base != 'home' AND performance_rating IS NULL) OR
    (base IS NULL)
  );