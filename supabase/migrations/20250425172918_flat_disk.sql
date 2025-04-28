/*
  # Add Upcoming Dates Table

  1. New Tables
    - `upcoming_dates`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `type` (text)
      - `date` (timestamp)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create upcoming_dates table
CREATE TABLE IF NOT EXISTS upcoming_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  date timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE upcoming_dates ENABLE ROW LEVEL SECURITY;

-- Create policies for upcoming_dates
CREATE POLICY "Users can read their own upcoming dates"
  ON upcoming_dates
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own upcoming dates"
  ON upcoming_dates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own upcoming dates"
  ON upcoming_dates
  FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own upcoming dates"
  ON upcoming_dates
  FOR DELETE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_upcoming_dates_updated_at
  BEFORE UPDATE ON upcoming_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();