/*
  # Remove vibe field and update profiles table

  1. Changes
    - Remove vibe column from profiles table
    - Make user_id NOT NULL to ensure data integrity
*/

-- Remove vibe column and make user_id NOT NULL
ALTER TABLE profiles 
  DROP COLUMN vibe,
  ALTER COLUMN user_id SET NOT NULL;