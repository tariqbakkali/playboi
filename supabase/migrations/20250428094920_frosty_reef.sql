/*
  # Add Performance Rating to Meetings

  1. Changes
    - Add performance_rating column to meetings table
    - Add check constraint to ensure rating is between 1 and 10
*/

-- Add performance_rating column with check constraint
ALTER TABLE meetings 
ADD COLUMN performance_rating integer CHECK (performance_rating >= 1 AND performance_rating <= 10);