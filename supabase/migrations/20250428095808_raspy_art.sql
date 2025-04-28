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

-- Temporarily allow null in base column
ALTER TABLE meetings ALTER COLUMN base DROP NOT NULL;

-- Set performance_rating to NULL where it shouldn't exist
UPDATE meetings 
SET performance_rating = NULL 
WHERE base NOT IN ('home');

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

-- Add constraint for performance rating range
ALTER TABLE meetings
  DROP CONSTRAINT IF EXISTS meetings_performance_rating_check,
  ADD CONSTRAINT meetings_performance_rating_check 
  CHECK (performance_rating >= 1 AND performance_rating <= 10);