/*
  # Fix RLS Performance and Function Security Issues

  ## Overview
  This migration addresses critical security and performance issues:
  1. Optimizes RLS policies by wrapping auth.uid() in SELECT statements
  2. Fixes mutable search_path vulnerabilities in functions

  ## RLS Performance Optimization
  
  Replaces `auth.uid()` with `(select auth.uid())` in all RLS policies.
  This prevents re-evaluation of the auth function for each row, significantly
  improving query performance at scale.
  
  ### Affected Tables and Policies
  
  **profiles** (3 policies)
  - Users can view own profile
  - Users can insert own profile  
  - Users can update own profile
  
  **timeline_stages** (4 policies)
  - Users can view own timeline stages
  - Users can insert own timeline stages
  - Users can update own timeline stages
  - Users can delete own timeline stages
  
  **timeline_tasks** (4 policies)
  - Users can view own timeline tasks
  - Users can insert own timeline tasks
  - Users can update own timeline tasks
  - Users can delete own timeline tasks
  
  **notes** (4 policies)
  - Users can view own notes
  - Users can insert own notes
  - Users can update own notes
  - Users can delete own notes
  
  **court_info** (4 policies)
  - Users can view own court info
  - Users can insert own court info
  - Users can update own court info
  - Users can delete own court info
  
  **contacts** (4 policies)
  - Users can view own contacts
  - Users can insert own contacts
  - Users can update own contacts
  - Users can delete own contacts
  
  **preparation_notes** (4 policies)
  - Users can view own preparation notes
  - Users can create own preparation notes
  - Users can update own preparation notes
  - Users can delete own preparation notes
  
  ## Function Security Fixes
  
  Sets secure search_path for all functions to prevent search_path manipulation attacks:
  - update_updated_at_column
  - update_glossary_search_vector
  - update_legal_search_vector
  - increment_legal_view_count
  - handle_new_user (if exists)
  - handle_updated_at (if exists)
  
  ## Security Impact
  
  1. **Performance**: Prevents auth.uid() re-evaluation for each row
  2. **Security**: Eliminates search_path manipulation vulnerabilities
  3. **Compatibility**: No breaking changes - policies function identically
*/

-- ============================================================================
-- PART 1: Fix RLS Policies - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES TABLE
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ----------------------------------------------------------------------------
-- TIMELINE_STAGES TABLE
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own timeline stages" ON timeline_stages;
CREATE POLICY "Users can view own timeline stages"
  ON timeline_stages FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own timeline stages" ON timeline_stages;
CREATE POLICY "Users can insert own timeline stages"
  ON timeline_stages FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own timeline stages" ON timeline_stages;
CREATE POLICY "Users can update own timeline stages"
  ON timeline_stages FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own timeline stages" ON timeline_stages;
CREATE POLICY "Users can delete own timeline stages"
  ON timeline_stages FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- TIMELINE_TASKS TABLE
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own timeline tasks" ON timeline_tasks;
CREATE POLICY "Users can view own timeline tasks"
  ON timeline_tasks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own timeline tasks" ON timeline_tasks;
CREATE POLICY "Users can insert own timeline tasks"
  ON timeline_tasks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own timeline tasks" ON timeline_tasks;
CREATE POLICY "Users can update own timeline tasks"
  ON timeline_tasks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own timeline tasks" ON timeline_tasks;
CREATE POLICY "Users can delete own timeline tasks"
  ON timeline_tasks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- NOTES TABLE
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- COURT_INFO TABLE
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own court info" ON court_info;
CREATE POLICY "Users can view own court info"
  ON court_info FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own court info" ON court_info;
CREATE POLICY "Users can insert own court info"
  ON court_info FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own court info" ON court_info;
CREATE POLICY "Users can update own court info"
  ON court_info FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own court info" ON court_info;
CREATE POLICY "Users can delete own court info"
  ON court_info FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- CONTACTS TABLE
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own contacts" ON contacts;
CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;
CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- PREPARATION_NOTES TABLE
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own preparation notes" ON preparation_notes;
CREATE POLICY "Users can view own preparation notes"
  ON preparation_notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own preparation notes" ON preparation_notes;
CREATE POLICY "Users can create own preparation notes"
  ON preparation_notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own preparation notes" ON preparation_notes;
CREATE POLICY "Users can update own preparation notes"
  ON preparation_notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own preparation notes" ON preparation_notes;
CREATE POLICY "Users can delete own preparation notes"
  ON preparation_notes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- PART 2: Fix Function Security - Set Secure search_path
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Fix update_updated_at_column function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- Fix update_glossary_search_vector function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_glossary_search_vector()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.term, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.definition, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.spanish_term, '')), 'C');
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- Fix update_legal_search_vector function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_legal_search_vector()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.full_content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.plain_language, '')), 'C');
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- Fix increment_legal_view_count function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_legal_view_count(content_id uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE legal_content
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- Fix handle_new_user function (if exists)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER 
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $func$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>''full_name'');
        RETURN NEW;
      END;
      $func$;
    ';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Fix handle_updated_at function (if exists)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION handle_updated_at()
      RETURNS TRIGGER 
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $func$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $func$;
    ';
  END IF;
END $$;