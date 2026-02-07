/*
  # Update Timeline Stages Structure

  ## Changes
  
  1. Add New Columns to timeline_stages:
    - `stage_key` (text) - Unique key for each stage type (detention, jurisdiction, etc.)
    - `what_happens` (text) - Description of what happens at this stage
    - `your_rights` (text[]) - Array of rights at this stage
    - `tasks` (jsonb) - Task checklist as JSON
    - `order_index` (integer) - Renamed from stage_order for clarity
  
  2. Create Function:
    - `initialize_user_timeline()` - Populates timeline stages for new users
  
  3. Security:
    - Maintain existing RLS policies
*/

-- Add new columns to timeline_stages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'stage_key'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN stage_key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'what_happens'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN what_happens text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'your_rights'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN your_rights text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'tasks'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN tasks jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN order_index integer;
    UPDATE timeline_stages SET order_index = stage_order WHERE order_index IS NULL;
  END IF;
END $$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS initialize_user_timeline(uuid);

-- Create function to initialize user timeline with California dependency court stages
CREATE FUNCTION initialize_user_timeline(p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Delete any existing stages for this user (in case of re-initialization)
  DELETE FROM timeline_stages WHERE user_id = p_user_id;
  
  -- Insert all California dependency court stages
  INSERT INTO timeline_stages (
    user_id, stage_key, stage_name, status, what_happens, your_rights, tasks, order_index, icon_name, color
  ) VALUES
  (
    p_user_id, 
    'detention', 
    'Detention Hearing', 
    'not_started',
    'The court decides if your child can stay with you or must be placed in protective custody while the case is ongoing. This hearing happens within 48-72 hours of removal.',
    ARRAY['Right to an attorney', 'Right to be present', 'Right to speak to the judge', 'Right to have visits with your child'],
    '[
      {"task": "Contact your attorney immediately", "completed": false},
      {"task": "Gather evidence of safe housing", "completed": false},
      {"task": "Prepare to explain your situation to the judge", "completed": false}
    ]'::jsonb,
    1,
    'Shield',
    'red'
  ),
  (
    p_user_id,
    'jurisdiction',
    'Jurisdiction/Adjudication Hearing',
    'not_started',
    'The court determines if the allegations in the petition are true and if your child comes under juvenile court jurisdiction. This is similar to a trial.',
    ARRAY['Right to a trial', 'Right to present evidence', 'Right to cross-examine witnesses', 'Right to testify on your own behalf'],
    '[
      {"task": "Review the petition carefully with your attorney", "completed": false},
      {"task": "Gather evidence that contradicts allegations", "completed": false},
      {"task": "Prepare your testimony", "completed": false},
      {"task": "Identify witnesses who can support your case", "completed": false}
    ]'::jsonb,
    2,
    'Gavel',
    'orange'
  ),
  (
    p_user_id,
    'disposition',
    'Disposition Hearing',
    'not_started',
    'After jurisdiction is established, the court creates a case plan with specific services and goals you must complete. The judge decides where your child will live during the case.',
    ARRAY['Right to participate in creating your case plan', 'Right to request reasonable services', 'Right to visitation with your child'],
    '[
      {"task": "Discuss proposed case plan with attorney", "completed": false},
      {"task": "Enroll in all required services immediately", "completed": false},
      {"task": "Request services that will help you succeed", "completed": false},
      {"task": "Establish a regular visitation schedule", "completed": false}
    ]'::jsonb,
    3,
    'ClipboardList',
    'yellow'
  ),
  (
    p_user_id,
    '6_month_review',
    '6-Month Review Hearing',
    'not_started',
    'The court reviews your progress on the case plan and decides if your child can safely return home or if more time and services are needed.',
    ARRAY['Right to report your progress', 'Right to request additional services', 'Right to request return of your child if you''ve made sufficient progress'],
    '[
      {"task": "Bring all completion certificates to court", "completed": false},
      {"task": "Document all visits attended", "completed": false},
      {"task": "Prepare to discuss your progress", "completed": false},
      {"task": "Ask attorney about requesting return of child", "completed": false}
    ]'::jsonb,
    4,
    'Calendar',
    'blue'
  ),
  (
    p_user_id,
    '12_month_review',
    '12-Month Review Hearing',
    'not_started',
    'The court reviews continued progress and may set a permanency hearing if reunification is not successful. This is a critical hearing for maintaining reunification services.',
    ARRAY['Right to continued reunification services (if making progress)', 'Right to present evidence of progress', 'Right to request extended services'],
    '[
      {"task": "Show substantial progress on case plan", "completed": false},
      {"task": "Document consistent visitation", "completed": false},
      {"task": "Prepare to explain any setbacks", "completed": false},
      {"task": "Discuss strategy with attorney", "completed": false}
    ]'::jsonb,
    5,
    'Clock',
    'indigo'
  ),
  (
    p_user_id,
    '18_month_permanency',
    '18-Month Permanency Hearing',
    'not_started',
    'The court determines a permanent plan for your child. Options include reunification, adoption, legal guardianship, or long-term foster care.',
    ARRAY['Right to advocate for reunification', 'Right to present evidence supporting your case', 'Right to appeal the court''s decision'],
    '[
      {"task": "Demonstrate full case plan compliance", "completed": false},
      {"task": "Show stable housing and income", "completed": false},
      {"task": "Present evidence of bond with child", "completed": false},
      {"task": "Prepare for all possible outcomes", "completed": false}
    ]'::jsonb,
    6,
    'Home',
    'purple'
  ),
  (
    p_user_id,
    'post_permanency',
    'Post-Permanency Reviews',
    'not_started',
    'If reunification is successful, the court may conduct follow-up hearings. If another permanency option was chosen, the court monitors that plan.',
    ARRAY['Right to request modification of orders', 'Right to seek additional support services', 'Right to maintain contact (if appropriate)'],
    '[
      {"task": "Complete any remaining court requirements", "completed": false},
      {"task": "Maintain services and support", "completed": false},
      {"task": "Stay in contact with social worker", "completed": false}
    ]'::jsonb,
    7,
    'CheckCircle',
    'green'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION initialize_user_timeline(uuid) TO authenticated;
