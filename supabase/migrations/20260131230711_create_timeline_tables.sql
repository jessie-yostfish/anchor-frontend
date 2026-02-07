/*
  # Timeline Tables for Dependency Court Process

  ## Overview
  Creates tables to track user progress through dependency court stages and associated tasks.

  ## New Tables
  
  ### `timeline_stages`
  Stores court process stages for each user.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `stage_name` (text) - Name of the stage (e.g., "Jurisdiction Hearing")
  - `stage_order` (integer) - Ordering of stages (1-7)
  - `status` (text) - "not_started", "in_progress", "completed"
  - `court_date` (date, nullable) - Scheduled court date
  - `icon_name` (text) - Icon identifier for UI
  - `color` (text) - Status color (gray/purple/green)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `timeline_tasks`
  Stores tasks/checklist items for each stage.
  - `id` (uuid, primary key) - Unique identifier
  - `stage_id` (uuid, foreign key) - Links to timeline_stages
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `task_text` (text) - Task description
  - `task_order` (integer) - Order within stage
  - `is_completed` (boolean) - Completion status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on both tables
  - Users can only access their own stages and tasks
  - Policies for SELECT, INSERT, UPDATE operations
*/

-- Create timeline_stages table
CREATE TABLE IF NOT EXISTS timeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stage_name text NOT NULL,
  stage_order integer NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  court_date date,
  icon_name text NOT NULL DEFAULT 'FolderOpen',
  color text NOT NULL DEFAULT 'gray',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('not_started', 'in_progress', 'completed'))
);

-- Create timeline_tasks table
CREATE TABLE IF NOT EXISTS timeline_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid REFERENCES timeline_stages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_text text NOT NULL,
  task_order integer NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_timeline_stages_user_id ON timeline_stages(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_stages_order ON timeline_stages(user_id, stage_order);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_stage_id ON timeline_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_user_id ON timeline_tasks(user_id);

-- Enable RLS
ALTER TABLE timeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timeline_stages
CREATE POLICY "Users can view own timeline stages"
  ON timeline_stages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline stages"
  ON timeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline stages"
  ON timeline_stages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline stages"
  ON timeline_stages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for timeline_tasks
CREATE POLICY "Users can view own timeline tasks"
  ON timeline_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline tasks"
  ON timeline_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline tasks"
  ON timeline_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline tasks"
  ON timeline_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_timeline_stages_updated_at ON timeline_stages;
CREATE TRIGGER update_timeline_stages_updated_at
  BEFORE UPDATE ON timeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_tasks_updated_at ON timeline_tasks;
CREATE TRIGGER update_timeline_tasks_updated_at
  BEFORE UPDATE ON timeline_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();