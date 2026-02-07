/*
  # Create Resources Table

  ## Overview
  Creates a table for storing local community resources including classes, services,
  counseling, housing assistance, and legal services.

  ## New Tables
  
  ### `resources`
  Stores community resources and services available to families in dependency court.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Name of the resource/organization
  - `description` (text) - Description of services offered
  - `category` (text) - Resource category
  - `type` (text) - Specific type of service
  - `county` (text) - County where service is available
  - `address` (text) - Physical address
  - `phone` (text) - Contact phone number
  - `hours` (text) - Operating hours
  - `website` (text) - Website URL
  - `languages` (text[]) - Languages offered
  - `cost` (text) - Cost structure (Free, Sliding Scale, Paid)
  - `availability_note` (text) - Notes about availability
  - `is_example` (boolean) - Flag for example resources
  - `click_count` (integer) - Track resource usage
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on resources table
  - All authenticated users can read resources
  - Only system can write (no user modifications)

  ## Indexes
  - Index on category and county for filtering
  - Index on type
*/

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  county text NOT NULL,
  address text DEFAULT '',
  phone text DEFAULT '',
  hours text DEFAULT '',
  website text DEFAULT '',
  languages text[] DEFAULT ARRAY['English'],
  cost text DEFAULT 'Free',
  availability_note text DEFAULT '',
  is_example boolean DEFAULT false,
  click_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN (
    'Classes & Workshops',
    'Housing Assistance',
    'Counseling & Support',
    'Legal Services',
    'Parenting Programs',
    'Employment & Education',
    'Food & Basic Needs',
    'Childcare',
    'Transportation',
    'Other'
  )),
  CONSTRAINT valid_cost CHECK (cost IN ('Free', 'Sliding Scale', 'Paid'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resources_category_county ON resources(category, county);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample resources
INSERT INTO resources (name, description, category, type, county, address, phone, hours, website, languages, cost, is_example) VALUES

('Positive Parenting Program (Triple P)', 
'Evidence-based parenting classes that teach positive parenting strategies. Meets court requirements for parenting education. Topics include managing behavior, communication, and child development.',
'Classes & Workshops',
'Parenting Education',
'Los Angeles',
'1234 Main St, Los Angeles, CA 90012',
'(213) 555-0100',
'Mon-Thu 6:00pm-8:00pm, Sat 10:00am-2:00pm',
'https://example.com/triple-p',
ARRAY['English', 'Spanish'],
'Free',
true),

('Family Therapy Center',
'Individual and family counseling services. Specializes in trauma-informed care and family reunification. Licensed therapists with experience in dependency court cases.',
'Counseling & Support',
'Family Counseling',
'Los Angeles',
'5678 Sunset Blvd, Los Angeles, CA 90028',
'(323) 555-0200',
'Mon-Fri 9:00am-7:00pm, Sat 9:00am-3:00pm',
'https://example.com/family-therapy',
ARRAY['English', 'Spanish', 'Korean'],
'Sliding Scale',
true),

('Housing Rights Center',
'Free assistance finding safe, affordable housing. Help with applications, deposits, and landlord issues. Emergency housing referrals available.',
'Housing Assistance',
'Housing Search',
'Los Angeles',
'910 Fair Housing Ln, Los Angeles, CA 90015',
'(213) 555-0300',
'Mon-Fri 8:00am-5:00pm',
'https://example.com/housing-rights',
ARRAY['English', 'Spanish', 'Vietnamese'],
'Free',
true),

('Public Law Center - Family Defense',
'Free legal help for parents in dependency cases. Can assist with hearings, appeals, and understanding your rights. Attorney consultations available.',
'Legal Services',
'Legal Aid',
'Orange County',
'1111 Justice Way, Santa Ana, CA 92701',
'(714) 555-0400',
'Mon-Fri 9:00am-5:00pm',
'https://example.com/public-law',
ARRAY['English', 'Spanish', 'Vietnamese'],
'Free',
true),

('Substance Abuse Recovery Center',
'Outpatient and intensive outpatient programs. Court-approved substance abuse treatment. Individual and group counseling, relapse prevention, and family support.',
'Counseling & Support',
'Substance Abuse Treatment',
'Orange County',
'2222 Recovery Rd, Anaheim, CA 92805',
'(714) 555-0500',
'Mon-Sun 7:00am-9:00pm',
'https://example.com/recovery',
ARRAY['English', 'Spanish'],
'Sliding Scale',
true),

('Domestic Violence Support Services',
'Confidential support for survivors of domestic violence. Safety planning, counseling, legal advocacy, and emergency shelter referrals. 24/7 crisis line available.',
'Counseling & Support',
'Domestic Violence Services',
'San Diego',
'3333 Safe Harbor Dr, San Diego, CA 92101',
'(619) 555-0600',
'24/7 Crisis Line, Office Hours: Mon-Fri 9:00am-5:00pm',
'https://example.com/dv-support',
ARRAY['English', 'Spanish', 'Tagalog'],
'Free',
true),

('Parent Partner Program',
'Mentorship from parents who have successfully navigated the dependency court system. One-on-one support, court accompaniment, and resource navigation.',
'Parenting Programs',
'Peer Support',
'San Diego',
'4444 Hope St, San Diego, CA 92110',
'(619) 555-0700',
'By Appointment, Mon-Sat 8:00am-8:00pm',
'https://example.com/parent-partner',
ARRAY['English', 'Spanish'],
'Free',
true),

('WorkSource California',
'Job training, resume help, interview preparation, and job placement services. Computer classes and GED preparation also available.',
'Employment & Education',
'Job Training',
'Sacramento',
'5555 Career Blvd, Sacramento, CA 95814',
'(916) 555-0800',
'Mon-Fri 8:00am-5:00pm',
'https://example.com/worksource',
ARRAY['English', 'Spanish', 'Russian'],
'Free',
true),

('Family Preservation Services',
'In-home support services to help families stay together. Case management, parenting coaching, life skills training, and connection to community resources.',
'Parenting Programs',
'In-Home Services',
'Sacramento',
'6666 Family Way, Sacramento, CA 95825',
'(916) 555-0900',
'Mon-Fri 8:00am-6:00pm, Emergency On-Call 24/7',
'https://example.com/family-preservation',
ARRAY['English', 'Spanish', 'Hmong'],
'Free',
true),

('Anger Management Workshops',
'Court-approved anger management classes. Learn coping strategies, communication skills, and stress management. Individual and group sessions available.',
'Classes & Workshops',
'Anger Management',
'Los Angeles',
'7777 Peace St, Los Angeles, CA 90017',
'(213) 555-1000',
'Tue & Thu 6:00pm-8:00pm, Sat 10:00am-12:00pm',
'https://example.com/anger-management',
ARRAY['English', 'Spanish'],
'Sliding Scale',
true),

('Community Food Bank',
'Free groceries and hot meals. No appointment needed. CalFresh application assistance available.',
'Food & Basic Needs',
'Food Assistance',
'Los Angeles',
'8888 Harvest Ave, Los Angeles, CA 90021',
'(213) 555-1100',
'Mon, Wed, Fri 9:00am-2:00pm',
'https://example.com/food-bank',
ARRAY['English', 'Spanish', 'Armenian'],
'Free',
true),

('Safe Rides Transportation Program',
'Free transportation to court hearings, visitations, and service appointments. Must schedule 48 hours in advance.',
'Transportation',
'Court & Service Transportation',
'Orange County',
'9999 Transit Way, Santa Ana, CA 92704',
'(714) 555-1200',
'Mon-Sat 7:00am-7:00pm',
'https://example.com/safe-rides',
ARRAY['English', 'Spanish'],
'Free',
true);

-- Verify successful insertion
SELECT COUNT(*) as total_resources FROM resources;