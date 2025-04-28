/*
  # Add Status Field to Profiles

  1. Changes
    - Add status field to profiles table with enum type
    - Set default status to 'prospect'
*/

-- Create enum type for profile status
CREATE TYPE profile_status AS ENUM ('prospect', 'dating', 'situationship', 'side_piece', 'wifey');

-- Add status column to profiles
ALTER TABLE profiles 
ADD COLUMN status profile_status DEFAULT 'prospect';