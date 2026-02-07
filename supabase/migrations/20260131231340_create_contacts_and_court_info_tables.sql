/*
  # Contacts and Court Information Tables

  ## Overview
  Creates tables for managing case contacts and court information.

  ## New Tables
  
  ### `court_info`
  Stores court case information for each user (one record per user).
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key, unique) - Links to auth.users (one per user)
  - `county` (text) - County where case is filed
  - `presiding_judge` (text) - Name of presiding judge
  - `next_court_date` (date) - Next scheduled court date
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `contacts`
  Stores important contacts related to the user's case.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `name` (text) - Contact's full name
  - `role` (text) - Contact's role (Attorney, Social Worker, etc.)
  - `phone` (text) - Phone number
  - `email` (text) - Email address
  - `notes` (text) - Additional notes about the contact
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on both tables
  - Users can only access their own data
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Indexes
  - Index on user_id for fast queries
  - Index on role for filtering contacts
*/

-- Create court_info table
CREATE TABLE IF NOT EXISTS court_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  county text DEFAULT '',
  presiding_judge text DEFAULT '',
  next_court_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('Attorney', 'Social Worker', 'Case Manager', 'CASA', 'Therapist', 'Supervisor', 'Judge', 'Other'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_court_info_user_id ON court_info(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(user_id, role);

-- Enable RLS
ALTER TABLE court_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for court_info
CREATE POLICY "Users can view own court info"
  ON court_info FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own court info"
  ON court_info FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own court info"
  ON court_info FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own court info"
  ON court_info FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for contacts
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at on court_info
DROP TRIGGER IF EXISTS update_court_info_updated_at ON court_info;
CREATE TRIGGER update_court_info_updated_at
  BEFORE UPDATE ON court_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on contacts
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();