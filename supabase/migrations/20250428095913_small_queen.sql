/*
  # Update base options and performance rating

  1. Changes
    - Create new enum type for base options
    - Update base column to use new type
    - Add performance rating constraint
    - Handle existing data properly
*/

-- Create type for base options
CREATE TYPE base_type AS ENUM ('strikeout', 'home');

-- Temporarily allow null in base column and performance_rating
ALTER TABLE meetings 
  ALTER COLUMN base DROP NOT NULL,
  ALTER COLUMN performance_rating DROP NOT NULL;

-- First, set all performance ratings to NULL
UPDATE meetings 
SET performance_rating = NULL;

-- Then update the base values
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

-- Add constraint for performance rating range
ALTER TABLE meetings
  DROP CONSTRAINT IF EXISTS meetings_performance_rating_check,
  ADD CONSTRAINT meetings_performance_rating_check 
  CHECK (
    performance_rating IS NULL OR 
    (performance_rating >= 1 AND performance_rating <= 10)
  );

-- Finally, add the constraint for performance rating with base
ALTER TABLE meetings
  ADD CONSTRAINT performance_rating_home_only
  CHECK (
    (base = 'home' AND performance_rating IS NOT NULL) OR
    (base != 'home' AND performance_rating IS NULL) OR
    (base IS NULL)
  );