/*
  # Notes Table for Personal Notes Management

  ## Overview
  Creates a table for users to store and manage private notes with categories.

  ## New Tables
  
  ### `notes`
  Stores user notes with categorization and search functionality.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `title` (text) - Note title
  - `content` (text) - Note content/body
  - `category` (text) - Category tag (Court, Visit, Meeting, Personal, Other)
  - `is_pinned` (boolean) - Whether note is pinned to top
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on notes table
  - Users can only access their own notes
  - Policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Indexes
  - Index on user_id for fast user queries
  - Index on category for filtering
  - Index on created_at for sorting
*/

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Personal',
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('Court', 'Visit', 'Meeting', 'Personal', 'Other'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(user_id, category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(user_id, is_pinned, created_at DESC);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notes
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();