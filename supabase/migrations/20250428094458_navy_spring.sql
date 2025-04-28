/*
  # Add Looks Rating to Profiles

  1. Changes
    - Add looks_rating column to profiles table
    - Add check constraint to ensure rating is between 1 and 10
*/

-- Add looks_rating column with check constraint
ALTER TABLE profiles 
ADD COLUMN looks_rating integer CHECK (looks_rating >= 1 AND looks_rating <= 10);