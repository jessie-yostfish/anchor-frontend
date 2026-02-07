/*
  # Fix Timeline Stage Keys Mismatch
  
  ## Problem
  Timeline stages are being created with keys like "six-month", "twelve-month", "eighteen-month"
  but the migration code expects "6_month_review", "12_month_review", "18_month_permanency"
  
  ## Changes
  
  1. Update existing stages with wrong keys:
    - Rename "six-month" → "6_month_review"
    - Rename "twelve-month" → "12_month_review" 
    - Rename "eighteen-month" → "18_month_permanency"
  
  2. Populate missing data for these stages
  
  3. Update initialize_user_timeline function to add case-opening stage
  
  ## Security
  - Maintains existing RLS policies
*/

-- Fix the stage_key mismatches
UPDATE timeline_stages SET stage_key = '6_month_review' WHERE stage_key = 'six-month';
UPDATE timeline_stages SET stage_key = '12_month_review' WHERE stage_key = 'twelve-month';
UPDATE timeline_stages SET stage_key = '18_month_permanency' WHERE stage_key = 'eighteen-month';

-- Now update the data for these fixed stages
UPDATE timeline_stages SET
  stage_name = '6-Month Review Hearing',
  what_happens = 'The court reviews your progress on the case plan and decides if your child can safely return home or if more time and services are needed.',
  your_rights = ARRAY['Right to report your progress', 'Right to request additional services', 'Right to request return of your child if you''ve made sufficient progress'],
  tasks = '[
    {"task": "Bring all completion certificates to court", "completed": false},
    {"task": "Document all visits attended", "completed": false},
    {"task": "Prepare to discuss your progress", "completed": false},
    {"task": "Ask attorney about requesting return of child", "completed": false}
  ]'::jsonb,
  icon_name = 'Calendar',
  color = 'gray',
  stage_order = 5
WHERE stage_key = '6_month_review' AND (what_happens IS NULL OR stage_name = 'Unknown Stage');

UPDATE timeline_stages SET
  stage_name = '12-Month Review Hearing',
  what_happens = 'The court reviews continued progress and may set a permanency hearing if reunification is not successful. This is a critical hearing for maintaining reunification services.',
  your_rights = ARRAY['Right to continued reunification services (if making progress)', 'Right to present evidence of progress', 'Right to request extended services'],
  tasks = '[
    {"task": "Show substantial progress on case plan", "completed": false},
    {"task": "Document consistent visitation", "completed": false},
    {"task": "Prepare to explain any setbacks", "completed": false},
    {"task": "Discuss strategy with attorney", "completed": false}
  ]'::jsonb,
  icon_name = 'Clock',
  color = 'gray',
  stage_order = 6
WHERE stage_key = '12_month_review' AND (what_happens IS NULL OR stage_name = 'Unknown Stage');

UPDATE timeline_stages SET
  stage_name = '18-Month Permanency Hearing',
  what_happens = 'The court determines a permanent plan for your child. Options include reunification, adoption, legal guardianship, or long-term foster care.',
  your_rights = ARRAY['Right to advocate for reunification', 'Right to present evidence supporting your case', 'Right to appeal the court''s decision'],
  tasks = '[
    {"task": "Demonstrate full case plan compliance", "completed": false},
    {"task": "Show stable housing and income", "completed": false},
    {"task": "Present evidence of bond with child", "completed": false},
    {"task": "Prepare for all possible outcomes", "completed": false}
  ]'::jsonb,
  icon_name = 'Home',
  color = 'gray',
  stage_order = 7
WHERE stage_key = '18_month_permanency' AND (what_happens IS NULL OR stage_name = 'Unknown Stage');

-- Update the initialize_user_timeline function to include case-opening
DROP FUNCTION IF EXISTS initialize_user_timeline(uuid);

CREATE FUNCTION initialize_user_timeline(p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Delete any existing stages for this user (in case of re-initialization)
  DELETE FROM timeline_stages WHERE user_id = p_user_id;
  
  -- Insert all California dependency court stages
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
    1,
    1,
    'FolderOpen',
    'purple'
  ),
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
    2,
    2,
    'Shield',
    'gray'
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
    3,
    3,
    'Gavel',
    'gray'
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
    4,
    4,
    'ClipboardList',
    'gray'
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
    5,
    5,
    'Calendar',
    'gray'
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
    6,
    6,
    'Clock',
    'gray'
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
    7,
    7,
    'Home',
    'gray'
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
    8,
    8,
    'CheckCircle',
    'gray'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION initialize_user_timeline(uuid) TO authenticated;
