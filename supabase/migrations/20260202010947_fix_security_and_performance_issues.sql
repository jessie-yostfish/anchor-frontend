/*
  # Fix Security and Performance Issues

  ## Changes
  
  ### 1. Add Missing Indexes for Foreign Keys
  - Add indexes for all unindexed foreign keys to improve query performance
  - Tables: contacts, court_info, notes, preparation_notes, timeline_tasks
  
  ### 2. Optimize RLS Policies
  - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies
  - This prevents re-evaluation for each row, improving query performance at scale
  - Tables: profiles, court_info, contacts, notes, timeline_stages, timeline_tasks, preparation_notes
  
  ### 3. Remove Unused Indexes
  - Drop indexes that are not being used
  - Tables: resources, legal_content
  
  ### 4. Fix Function Search Paths
  - Add SECURITY INVOKER and set search_path for all functions
  - Functions: update_legal_search_vector, increment_legal_view_count, initialize_user_timeline, handle_new_user
  
  ## Security
  - All changes maintain existing RLS policies
  - Improves security by fixing function search paths
  - Enhances performance without compromising security
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================================================

-- Contacts table
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);

-- Court info table
CREATE INDEX IF NOT EXISTS idx_court_info_user_id ON court_info(user_id);

-- Notes table
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- Preparation notes table
CREATE INDEX IF NOT EXISTS idx_preparation_notes_user_id ON preparation_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_preparation_notes_related_stage_id ON preparation_notes(related_stage_id);

-- Timeline tasks table (indexes already exist based on migration, but let's ensure)
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_stage_id ON timeline_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_user_id ON timeline_tasks(user_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - Use (select auth.uid()) instead of auth.uid()
-- ============================================================================

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- COURT INFO TABLE
DROP POLICY IF EXISTS "Users can manage own court info" ON court_info;
CREATE POLICY "Users can view own court info"
  ON court_info FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own court info"
  ON court_info FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own court info"
  ON court_info FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own court info"
  ON court_info FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- CONTACTS TABLE
DROP POLICY IF EXISTS "Users can manage own contacts" ON contacts;
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- NOTES TABLE
DROP POLICY IF EXISTS "Users can manage own notes" ON notes;
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- TIMELINE STAGES TABLE
DROP POLICY IF EXISTS "Users can manage own timeline stages" ON timeline_stages;
DROP POLICY IF EXISTS "Users can view own timeline stages" ON timeline_stages;
DROP POLICY IF EXISTS "Users can insert own timeline stages" ON timeline_stages;
DROP POLICY IF EXISTS "Users can update own timeline stages" ON timeline_stages;
DROP POLICY IF EXISTS "Users can delete own timeline stages" ON timeline_stages;

CREATE POLICY "Users can view own timeline stages"
  ON timeline_stages FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own timeline stages"
  ON timeline_stages FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own timeline stages"
  ON timeline_stages FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own timeline stages"
  ON timeline_stages FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- TIMELINE TASKS TABLE
DROP POLICY IF EXISTS "Users can manage own timeline tasks" ON timeline_tasks;
DROP POLICY IF EXISTS "Users can view own timeline tasks" ON timeline_tasks;
DROP POLICY IF EXISTS "Users can insert own timeline tasks" ON timeline_tasks;
DROP POLICY IF EXISTS "Users can update own timeline tasks" ON timeline_tasks;
DROP POLICY IF EXISTS "Users can delete own timeline tasks" ON timeline_tasks;

CREATE POLICY "Users can view own timeline tasks"
  ON timeline_tasks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own timeline tasks"
  ON timeline_tasks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own timeline tasks"
  ON timeline_tasks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own timeline tasks"
  ON timeline_tasks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- PREPARATION NOTES TABLE
DROP POLICY IF EXISTS "Users can manage own prep notes" ON preparation_notes;
CREATE POLICY "Users can view own prep notes"
  ON preparation_notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own prep notes"
  ON preparation_notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own prep notes"
  ON preparation_notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own prep notes"
  ON preparation_notes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_resources_type;
DROP INDEX IF EXISTS idx_legal_content_category;
DROP INDEX IF EXISTS idx_legal_content_search_vector;
DROP INDEX IF EXISTS idx_legal_content_related;

-- ============================================================================
-- 4. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Fix update_legal_search_vector function
CREATE OR REPLACE FUNCTION update_legal_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.title, '') || ' ' || 
    coalesce(NEW.content, '') || ' ' ||
    coalesce(NEW.category, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public, pg_temp;

-- Fix increment_legal_view_count function
CREATE OR REPLACE FUNCTION increment_legal_view_count(content_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE legal_content 
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public, pg_temp;

-- Fix initialize_user_timeline function
CREATE OR REPLACE FUNCTION initialize_user_timeline(p_user_id uuid)
RETURNS void AS $$
BEGIN
  DELETE FROM timeline_stages WHERE user_id = p_user_id;
  
  INSERT INTO timeline_stages (
    user_id, stage_key, stage_name, status, what_happens, your_rights, tasks, order_index, stage_order, icon_name, color
  ) VALUES
  (
    p_user_id, 
    'case-opening', 
    'Case Opening', 
    'in_progress',
    'Your case has been opened with Child Protective Services. This is the beginning of the dependency court process.',
    ARRAY['Right to an attorney', 'Right to read the petition', 'Right to present evidence', 'Right to cross-examine witnesses'],
    '[
      {"task": "Contact your attorney if you have one", "completed": false},
      {"task": "Gather important documents", "completed": false},
      {"task": "Make a list of potential support contacts", "completed": false}
    ]'::jsonb,
    1, 1, 'FolderOpen', 'purple'
  ),
  (
    p_user_id, 'detention', 'Detention Hearing', 'not_started',
    'The court decides if your child can stay with you or must be placed in protective custody while the case is ongoing. This hearing happens within 48-72 hours of removal.',
    ARRAY['Right to an attorney', 'Right to be present', 'Right to speak to the judge', 'Right to have visits with your child'],
    '[
      {"task": "Contact your attorney immediately", "completed": false},
      {"task": "Gather evidence of safe housing", "completed": false},
      {"task": "Prepare to explain your situation to the judge", "completed": false}
    ]'::jsonb,
    2, 2, 'Shield', 'gray'
  ),
  (
    p_user_id, 'jurisdiction', 'Jurisdiction/Adjudication Hearing', 'not_started',
    'The court determines if the allegations in the petition are true and if your child comes under juvenile court jurisdiction. This is similar to a trial.',
    ARRAY['Right to a trial', 'Right to present evidence', 'Right to cross-examine witnesses', 'Right to testify on your own behalf'],
    '[
      {"task": "Review the petition carefully with your attorney", "completed": false},
      {"task": "Gather evidence that contradicts allegations", "completed": false},
      {"task": "Prepare your testimony", "completed": false},
      {"task": "Identify witnesses who can support your case", "completed": false}
    ]'::jsonb,
    3, 3, 'Gavel', 'gray'
  ),
  (
    p_user_id, 'disposition', 'Disposition Hearing', 'not_started',
    'After jurisdiction is established, the court creates a case plan with specific services and goals you must complete. The judge decides where your child will live during the case.',
    ARRAY['Right to participate in creating your case plan', 'Right to request reasonable services', 'Right to visitation with your child'],
    '[
      {"task": "Discuss proposed case plan with attorney", "completed": false},
      {"task": "Enroll in all required services immediately", "completed": false},
      {"task": "Request services that will help you succeed", "completed": false},
      {"task": "Establish a regular visitation schedule", "completed": false}
    ]'::jsonb,
    4, 4, 'ClipboardList', 'gray'
  ),
  (
    p_user_id, '6_month_review', '6-Month Review Hearing', 'not_started',
    'The court reviews your progress on the case plan and decides if your child can safely return home or if more time and services are needed.',
    ARRAY['Right to report your progress', 'Right to request additional services', 'Right to request return of your child if you''ve made sufficient progress'],
    '[
      {"task": "Bring all completion certificates to court", "completed": false},
      {"task": "Document all visits attended", "completed": false},
      {"task": "Prepare to discuss your progress", "completed": false},
      {"task": "Ask attorney about requesting return of child", "completed": false}
    ]'::jsonb,
    5, 5, 'Calendar', 'gray'
  ),
  (
    p_user_id, '12_month_review', '12-Month Review Hearing', 'not_started',
    'The court reviews continued progress and may set a permanency hearing if reunification is not successful. This is a critical hearing for maintaining reunification services.',
    ARRAY['Right to continued reunification services (if making progress)', 'Right to present evidence of progress', 'Right to request extended services'],
    '[
      {"task": "Show substantial progress on case plan", "completed": false},
      {"task": "Document consistent visitation", "completed": false},
      {"task": "Prepare to explain any setbacks", "completed": false},
      {"task": "Discuss strategy with attorney", "completed": false}
    ]'::jsonb,
    6, 6, 'Clock', 'gray'
  ),
  (
    p_user_id, '18_month_permanency', '18-Month Permanency Hearing', 'not_started',
    'The court determines a permanent plan for your child. Options include reunification, adoption, legal guardianship, or long-term foster care.',
    ARRAY['Right to advocate for reunification', 'Right to present evidence supporting your case', 'Right to appeal the court''s decision'],
    '[
      {"task": "Demonstrate full case plan compliance", "completed": false},
      {"task": "Show stable housing and income", "completed": false},
      {"task": "Present evidence of bond with child", "completed": false},
      {"task": "Prepare for all possible outcomes", "completed": false}
    ]'::jsonb,
    7, 7, 'Home', 'gray'
  ),
  (
    p_user_id, 'post_permanency', 'Post-Permanency Reviews', 'not_started',
    'If reunification is successful, the court may conduct follow-up hearings. If another permanency option was chosen, the court monitors that plan.',
    ARRAY['Right to request modification of orders', 'Right to seek additional support services', 'Right to maintain contact (if appropriate)'],
    '[
      {"task": "Complete any remaining court requirements", "completed": false},
      {"task": "Maintain services and support", "completed": false},
      {"task": "Stay in contact with social worker", "completed": false}
    ]'::jsonb,
    8, 8, 'CheckCircle', 'gray'
  );
END;
$$ LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION initialize_user_timeline(uuid) TO authenticated;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, now(), now());
  
  PERFORM initialize_user_timeline(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public, pg_temp;
