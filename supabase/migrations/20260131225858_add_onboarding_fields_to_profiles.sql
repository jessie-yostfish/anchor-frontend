/*
  # Add Onboarding Fields to Profiles Table

  1. Changes
    - Add username field (unique, from signup)
    - Add first_name field (from signup)
    - Add children_status field (for parents: at_home, removed, with_family)
    - Add has_lawyer boolean
    - Add lawyer_name and lawyer_phone fields
    - Add has_case_manager boolean
    - Add case_manager_name and case_manager_phone fields
    - Add court_history field (not_yet, been_to_court, scheduled)
    - Add current_stage field (detention, jurisdiction, disposition, review, permanency)
    - Add next_court_date field
    - Add primary_concerns text field
    - Add text_reminders_enabled boolean
    - Add phone_number field
    - Add reminder_settings JSONB field
    - Add intake_completed boolean
    - Add intake_step integer (to track progress)
    
  2. Security
    - All fields are nullable to allow gradual completion
    - RLS policies remain unchanged (users can only access their own data)
*/

-- Add username with unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text UNIQUE;
  END IF;
END $$;

-- Add first_name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text;
  END IF;
END $$;

-- Add children_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'children_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN children_status text;
  END IF;
END $$;

-- Add lawyer information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_lawyer'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_lawyer text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'lawyer_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN lawyer_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'lawyer_phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN lawyer_phone text;
  END IF;
END $$;

-- Add case manager information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_case_manager'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_case_manager text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'case_manager_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN case_manager_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'case_manager_phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN case_manager_phone text;
  END IF;
END $$;

-- Add court history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'court_history'
  ) THEN
    ALTER TABLE profiles ADD COLUMN court_history text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_stage'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_stage text;
  END IF;
END $$;

-- Add next court date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'next_court_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN next_court_date date;
  END IF;
END $$;

-- Add primary concerns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'primary_concerns'
  ) THEN
    ALTER TABLE profiles ADD COLUMN primary_concerns text;
  END IF;
END $$;

-- Add text reminders fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'text_reminders_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN text_reminders_enabled boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Add reminder settings (JSONB for flexible structure)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'reminder_settings'
  ) THEN
    ALTER TABLE profiles ADD COLUMN reminder_settings jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add intake tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'intake_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN intake_completed boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'intake_step'
  ) THEN
    ALTER TABLE profiles ADD COLUMN intake_step integer DEFAULT 1;
  END IF;
END $$;
