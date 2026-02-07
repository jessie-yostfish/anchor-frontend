/*
  # Fix Timeline Stages - Add Missing Columns

  ## Changes
  
  1. Add Missing Columns:
    - `stage_name` (text) - Display name for the stage
    - `stage_order` (integer) - Legacy column for ordering
    - `icon_name` (text) - Icon identifier for UI
    - `color` (text) - Status color for UI
  
  2. Update Existing Data:
    - Populate missing columns for existing stages based on stage_key
  
  3. Update Initialize Function:
    - Ensure all required columns are populated
*/

-- Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'stage_name'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN stage_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'stage_order'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN stage_order integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'icon_name'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN icon_name text DEFAULT 'FolderOpen';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_stages' AND column_name = 'color'
  ) THEN
    ALTER TABLE timeline_stages ADD COLUMN color text DEFAULT 'gray';
  END IF;
END $$;

-- Update existing stages with proper data based on stage_key
UPDATE timeline_stages SET
  stage_name = CASE stage_key
    WHEN 'case-opening' THEN 'Case Opening'
    WHEN 'detention' THEN 'Detention Hearing'
    WHEN 'jurisdiction' THEN 'Jurisdiction/Adjudication Hearing'
    WHEN 'disposition' THEN 'Disposition Hearing'
    WHEN '6_month_review' THEN '6-Month Review Hearing'
    WHEN '12_month_review' THEN '12-Month Review Hearing'
    WHEN '18_month_permanency' THEN '18-Month Permanency Hearing'
    WHEN 'post_permanency' THEN 'Post-Permanency Reviews'
    ELSE 'Unknown Stage'
  END,
  icon_name = CASE stage_key
    WHEN 'case-opening' THEN 'FolderOpen'
    WHEN 'detention' THEN 'Shield'
    WHEN 'jurisdiction' THEN 'Gavel'
    WHEN 'disposition' THEN 'ClipboardList'
    WHEN '6_month_review' THEN 'Calendar'
    WHEN '12_month_review' THEN 'Clock'
    WHEN '18_month_permanency' THEN 'Home'
    WHEN 'post_permanency' THEN 'CheckCircle'
    ELSE 'FolderOpen'
  END,
  color = CASE 
    WHEN status = 'completed' THEN 'green'
    WHEN status = 'in_progress' THEN 'purple'
    ELSE 'gray'
  END,
  stage_order = order_index
WHERE stage_name IS NULL OR icon_name IS NULL;

-- Update what_happens descriptions for existing stages
UPDATE timeline_stages SET
  what_happens = CASE stage_key
    WHEN 'case-opening' THEN 'Your case has been opened with Child Protective Services. This is the beginning of the dependency court process.'
    WHEN 'detention' THEN 'The court decides if your child can stay with you or must be placed in protective custody while the case is ongoing. This hearing happens within 48-72 hours of removal.'
    WHEN 'jurisdiction' THEN 'The court determines if the allegations in the petition are true and if your child comes under juvenile court jurisdiction. This is similar to a trial.'
    WHEN 'disposition' THEN 'After jurisdiction is established, the court creates a case plan with specific services and goals you must complete. The judge decides where your child will live during the case.'
    WHEN '6_month_review' THEN 'The court reviews your progress on the case plan and decides if your child can safely return home or if more time and services are needed.'
    WHEN '12_month_review' THEN 'The court reviews continued progress and may set a permanency hearing if reunification is not successful. This is a critical hearing for maintaining reunification services.'
    WHEN '18_month_permanency' THEN 'The court determines a permanent plan for your child. Options include reunification, adoption, legal guardianship, or long-term foster care.'
    WHEN 'post_permanency' THEN 'If reunification is successful, the court may conduct follow-up hearings. If another permanency option was chosen, the court monitors that plan.'
    ELSE NULL
  END
WHERE what_happens IS NULL;

-- Update your_rights for existing stages
UPDATE timeline_stages SET
  your_rights = CASE stage_key
    WHEN 'detention' THEN ARRAY['Right to an attorney', 'Right to be present', 'Right to speak to the judge', 'Right to have visits with your child']
    WHEN 'jurisdiction' THEN ARRAY['Right to a trial', 'Right to present evidence', 'Right to cross-examine witnesses', 'Right to testify on your own behalf']
    WHEN 'disposition' THEN ARRAY['Right to participate in creating your case plan', 'Right to request reasonable services', 'Right to visitation with your child']
    WHEN '6_month_review' THEN ARRAY['Right to report your progress', 'Right to request additional services', 'Right to request return of your child if you''ve made sufficient progress']
    WHEN '12_month_review' THEN ARRAY['Right to continued reunification services (if making progress)', 'Right to present evidence of progress', 'Right to request extended services']
    WHEN '18_month_permanency' THEN ARRAY['Right to advocate for reunification', 'Right to present evidence supporting your case', 'Right to appeal the court''s decision']
    WHEN 'post_permanency' THEN ARRAY['Right to request modification of orders', 'Right to seek additional support services', 'Right to maintain contact (if appropriate)']
    ELSE ARRAY[]::text[]
  END
WHERE your_rights IS NULL;

-- Update tasks for existing stages
UPDATE timeline_stages SET
  tasks = CASE stage_key
    WHEN 'case-opening' THEN '[
      {"task": "Contact your attorney if you have one", "completed": false},
      {"task": "Gather important documents", "completed": false},
      {"task": "Make a list of potential support contacts", "completed": false}
    ]'::jsonb
    WHEN 'detention' THEN '[
      {"task": "Contact your attorney immediately", "completed": false},
      {"task": "Gather evidence of safe housing", "completed": false},
      {"task": "Prepare to explain your situation to the judge", "completed": false}
    ]'::jsonb
    WHEN 'jurisdiction' THEN '[
      {"task": "Review the petition carefully with your attorney", "completed": false},
      {"task": "Gather evidence that contradicts allegations", "completed": false},
      {"task": "Prepare your testimony", "completed": false},
      {"task": "Identify witnesses who can support your case", "completed": false}
    ]'::jsonb
    WHEN 'disposition' THEN '[
      {"task": "Discuss proposed case plan with attorney", "completed": false},
      {"task": "Enroll in all required services immediately", "completed": false},
      {"task": "Request services that will help you succeed", "completed": false},
      {"task": "Establish a regular visitation schedule", "completed": false}
    ]'::jsonb
    WHEN '6_month_review' THEN '[
      {"task": "Bring all completion certificates to court", "completed": false},
      {"task": "Document all visits attended", "completed": false},
      {"task": "Prepare to discuss your progress", "completed": false},
      {"task": "Ask attorney about requesting return of child", "completed": false}
    ]'::jsonb
    WHEN '12_month_review' THEN '[
      {"task": "Show substantial progress on case plan", "completed": false},
      {"task": "Document consistent visitation", "completed": false},
      {"task": "Prepare to explain any setbacks", "completed": false},
      {"task": "Discuss strategy with attorney", "completed": false}
    ]'::jsonb
    WHEN '18_month_permanency' THEN '[
      {"task": "Demonstrate full case plan compliance", "completed": false},
      {"task": "Show stable housing and income", "completed": false},
      {"task": "Present evidence of bond with child", "completed": false},
      {"task": "Prepare for all possible outcomes", "completed": false}
    ]'::jsonb
    WHEN 'post_permanency' THEN '[
      {"task": "Complete any remaining court requirements", "completed": false},
      {"task": "Maintain services and support", "completed": false},
      {"task": "Stay in contact with social worker", "completed": false}
    ]'::jsonb
    ELSE '[]'::jsonb
  END
WHERE tasks = '[]'::jsonb OR tasks IS NULL;

-- Make columns NOT NULL now that they have data
ALTER TABLE timeline_stages ALTER COLUMN stage_name SET NOT NULL;
ALTER TABLE timeline_stages ALTER COLUMN icon_name SET NOT NULL;
ALTER TABLE timeline_stages ALTER COLUMN color SET NOT NULL;
