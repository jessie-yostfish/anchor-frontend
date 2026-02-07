/*
  # Create Preparation Notes Table

  ## Overview
  Creates a table for storing preparation notes and reflections for hearings,
  meetings, and post-hearing summaries.

  ## New Tables
  
  ### `preparation_notes`
  Stores preparation notes, concerns, and generated guides for court hearings
  and meetings.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `prep_type` (text) - Type of preparation (hearing, meeting, after_hearing)
  - `concerns` (text) - User's specific concerns or questions
  - `generated_guide` (jsonb) - Generated preparation guide content
  - `exported` (boolean) - Whether guide was exported
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on preparation_notes table
  - Users can only access their own preparation notes
  - Users can create, read, update, and delete their own notes

  ## Indexes
  - Index on user_id for fast queries
  - Index on prep_type
  - Index on created_at for chronological sorting
*/

-- Create preparation_notes table
CREATE TABLE IF NOT EXISTS preparation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prep_type text NOT NULL,
  concerns text NOT NULL DEFAULT '',
  generated_guide jsonb DEFAULT '{}'::jsonb,
  exported boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_prep_type CHECK (prep_type IN (
    'hearing',
    'meeting',
    'after_hearing'
  ))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_preparation_notes_user_id ON preparation_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_preparation_notes_prep_type ON preparation_notes(prep_type);
CREATE INDEX IF NOT EXISTS idx_preparation_notes_created_at ON preparation_notes(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_preparation_notes_updated_at ON preparation_notes;
CREATE TRIGGER update_preparation_notes_updated_at
  BEFORE UPDATE ON preparation_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE preparation_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preparation notes"
  ON preparation_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preparation notes"
  ON preparation_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preparation notes"
  ON preparation_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preparation notes"
  ON preparation_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);