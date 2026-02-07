/*
  # Legal Content Library Table

  ## Overview
  Creates a table for storing legal information, statutes, rights, procedures, and forms
  for the California dependency court system.

  ## New Tables
  
  ### `legal_content`
  Stores legal information organized by category.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Title of the legal content
  - `category` (text) - Category classification (Statutes & Laws, Your Rights, Court Procedures, Forms & Templates)
  - `description` (text) - Brief description/summary
  - `full_content` (text) - Complete content/explanation
  - `plain_language` (text) - Simplified explanation in plain language
  - `legal_reference` (text) - Legal citation (e.g., "Cal. Welf. & Inst. Code § 300")
  - `related_topics` (text array) - Array of related topic titles
  - `external_link` (text) - External URL if applicable
  - `subsections` (jsonb) - Structured subsections (for statutes with multiple sections)
  - `view_count` (integer) - Track how many times viewed
  - `search_vector` (tsvector) - Full-text search vector
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on legal_content table
  - All authenticated users can read legal content
  - Only system can write (no user modifications)

  ## Indexes
  - Index on title for fast lookups
  - Index on category for filtering
  - GIN index on search_vector for full-text search
  - GIN index on related_topics array

  ## Functions
  - Trigger to automatically update search_vector on insert/update
  - Function to increment view count
*/

-- Create legal_content table
CREATE TABLE IF NOT EXISTS legal_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  full_content text NOT NULL,
  plain_language text DEFAULT '',
  legal_reference text DEFAULT '',
  related_topics text[] DEFAULT '{}',
  external_link text DEFAULT '',
  subsections jsonb DEFAULT '[]'::jsonb,
  view_count integer DEFAULT 0,
  search_vector tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('Statutes & Laws', 'Your Rights', 'Court Procedures', 'Forms & Templates'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_legal_content_title ON legal_content(title);
CREATE INDEX IF NOT EXISTS idx_legal_content_category ON legal_content(category);
CREATE INDEX IF NOT EXISTS idx_legal_content_search_vector ON legal_content USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_legal_content_related ON legal_content USING GIN(related_topics);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_legal_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.full_content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.plain_language, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector
DROP TRIGGER IF EXISTS update_legal_search_vector_trigger ON legal_content;
CREATE TRIGGER update_legal_search_vector_trigger
  BEFORE INSERT OR UPDATE ON legal_content
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_search_vector();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_legal_content_updated_at ON legal_content;
CREATE TRIGGER update_legal_content_updated_at
  BEFORE UPDATE ON legal_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE legal_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view legal content"
  ON legal_content FOR SELECT
  TO authenticated
  USING (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_legal_view_count(content_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE legal_content
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample legal content
INSERT INTO legal_content (title, category, description, full_content, plain_language, legal_reference, related_topics, subsections) VALUES

('California Welfare and Institutions Code (WIC)', 'Statutes & Laws', 'The primary California law governing dependency proceedings', 
'The California Welfare and Institutions Code (WIC) is the main body of law that governs juvenile dependency proceedings in California. These laws establish the grounds for dependency, the rights of parents and children, court procedures, and timelines for hearings. Understanding key WIC sections is essential for navigating the dependency system.',
'This is the main set of laws that control how dependency court works in California. It covers everything from why a case can start, to what happens at each hearing, to what rights you have as a parent.',
'Cal. Welf. & Inst. Code §§ 200-395',
ARRAY['Your Rights at Hearings', 'Timeline for Court Hearings', 'Grounds for Dependency'],
'[
  {"section": "WIC § 300", "title": "Grounds for Dependency", "summary": "Defines the circumstances under which a child may be declared a dependent of the court (abuse, neglect, etc.)"},
  {"section": "WIC § 315", "title": "Right to Counsel", "summary": "Every parent has the right to be represented by an attorney in dependency proceedings"},
  {"section": "WIC § 316.2", "title": "Educational Rights Holder", "summary": "Designates who makes educational decisions for the child"},
  {"section": "WIC § 319", "title": "Detention Hearing", "summary": "First hearing, must be held within 48-72 hours of removal"},
  {"section": "WIC § 334", "title": "Jurisdiction Hearing", "summary": "Hearing where allegations are proven or dismissed"},
  {"section": "WIC § 358", "title": "Disposition Hearing", "summary": "Hearing where court decides case plan and services"},
  {"section": "WIC § 361.5", "title": "Reunification Services", "summary": "Services provided to help parents reunify with their children"},
  {"section": "WIC § 366.21", "title": "Six and Twelve Month Review Hearings", "summary": "Regular hearings to review progress on case plan"},
  {"section": "WIC § 366.26", "title": "Permanency Planning Hearing", "summary": "Hearing to establish permanent plan if reunification fails"}
]'::jsonb),

('Your Rights at the Detention Hearing', 'Your Rights', 'What you are entitled to at the first court hearing',
'At the detention hearing (the first hearing after your child is removed), you have specific rights:

1. Right to be present: You have the right to attend the hearing and be heard by the judge.

2. Right to an attorney: If you cannot afford an attorney, one will be appointed for you at no cost.

3. Right to be heard: You can tell the judge your side of the story and present evidence.

4. Right to know the allegations: The county must tell you what they are alleging and why they removed your child.

5. Right to visitation: Unless there are safety concerns, you have the right to visit with your child.

6. Right to request relatives: You can ask that your child be placed with family members instead of foster care.

7. Right to contest detention: You can disagree with keeping your child in foster care and ask the judge to return them home.

8. Right to Indian Child Welfare Act (ICWA) protections: If you or your child has Native American heritage, special protections apply.',
'At your first court hearing, you have important rights: You can be there, you get a free lawyer if you need one, you can tell your side of the story, you can ask for your child to stay with family, and you can ask the judge to send your child home. Make sure you go to this hearing - it is very important.',
'Cal. Welf. & Inst. Code § 319',
ARRAY['California Welfare and Institutions Code (WIC)', 'Timeline for Court Hearings', 'Right to an Attorney'],
'[]'::jsonb),

('Right to an Attorney', 'Your Rights', 'Your right to free legal representation in dependency court',
'Every parent in a dependency case has the constitutional and statutory right to be represented by an attorney. This is one of your most important rights.

What this means:
- If you cannot afford an attorney, the court will appoint one for you at no cost
- You should receive appointment of counsel at the detention hearing
- Your attorney must represent your interests and wishes
- Your attorney should communicate with you regularly
- Your attorney can help you understand the legal process and your options

Your responsibilities:
- Stay in contact with your attorney
- Be honest with your attorney (what you tell them is confidential)
- Attend all meetings and court hearings
- Let your attorney know if you disagree with their recommendations

If you have concerns:
- You have the right to request a new attorney if there is a breakdown in communication
- You can file a Marsden motion to request substitute counsel

Your attorney is your advocate and voice in court. Use them.',
'You have the right to a free lawyer if you cannot afford one. Your lawyer is there to help you and fight for what you want. Stay in touch with your lawyer, be honest with them, and go to all your meetings and court dates. If you have problems with your lawyer, you can ask for a different one.',
'Cal. Welf. & Inst. Code § 317',
ARRAY['Your Rights at the Detention Hearing', 'How to Work With Your Attorney'],
'[]'::jsonb),

('Parental Rights in Dependency Court', 'Your Rights', 'Your fundamental rights throughout the dependency process',
'As a parent in dependency court, you have fundamental constitutional and statutory rights:

Right to Reunification Services
Unless there are aggravated circumstances, you are entitled to services to help you reunify with your child (typically 12-18 months).

Right to Visitation
You have the right to visit with your child unless the court finds it would be detrimental. Visits may be supervised initially but should progress as you make progress on your case plan.

Right to Notice
You must receive proper notice of all court hearings and have the opportunity to be present.

Right to Be Heard
You have the right to testify, present evidence, and call witnesses on your behalf.

Right to Appeal
You have the right to appeal court decisions you disagree with.

Right to a Court-Appointed Attorney
If you cannot afford one, an attorney will be provided at no cost.

Right to Decline Services
While not recommended, you have the right to decline reunification services, though this will likely result in termination of your parental rights.

Right to Request Relative Placement
You can identify relatives for your child to stay with during the case.

Right to Be Free from Discrimination
Your case must be handled without discrimination based on race, ethnicity, language, disability, sexual orientation, or gender identity.',
'As a parent in dependency court, you have many important rights including: free services to help you get your kids back, visits with your children, a free lawyer, the right to speak in court, and the right to ask that your child stay with family members. You also have the right to appeal if you disagree with what the judge decides.',
'Cal. Welf. & Inst. Code §§ 317, 361.5, 395',
ARRAY['Right to an Attorney', 'Your Rights at the Detention Hearing', 'Timeline for Court Hearings'],
'[]'::jsonb),

('Timeline for Court Hearings', 'Court Procedures', 'When each hearing must occur in a dependency case',
'Dependency cases follow strict timelines set by California law:

Detention Hearing
- Must be held within 48-72 hours (excluding weekends and holidays) after the child is taken into protective custody
- Judge decides if child can return home or must stay in foster care during the case

Jurisdiction Hearing
- Must be held within 15 court days of the detention hearing (can be continued for up to 30 days)
- Judge determines if the allegations are true and if the child should be declared a dependent

Disposition Hearing
- Can be combined with jurisdiction hearing or held separately
- Must be held within 60 days of the detention hearing
- Judge decides case plan, services, and placement

Six-Month Review Hearing (WIC § 366.21(e))
- Held approximately 6 months after the child entered foster care
- Judge reviews progress on case plan

Twelve-Month Review Hearing (WIC § 366.21(f))
- Held approximately 12 months after the child entered foster care
- Critical hearing where judge may set a WIC § 366.26 hearing if reunification is not progressing

Eighteen-Month Review Hearing (WIC § 366.22)
- If services were extended, held around 18 months
- Last chance for reunification in most cases

Permanency Planning Hearing (WIC § 366.26)
- If reunification fails, this hearing establishes a permanent plan (adoption, guardianship, or long-term foster care)
- Must be held within 120 days of the order setting the hearing',
'Dependency cases move on a strict schedule: The first hearing (detention) happens within 2-3 days. The jurisdiction hearing is within about 2 weeks. Then you have review hearings every 6 months where the judge checks your progress. You usually get 12-18 months to complete your case plan and get your kids back. Do not miss any hearings - they are all important.',
'Cal. Welf. & Inst. Code §§ 313, 334, 358, 366.21, 366.22, 366.26',
ARRAY['Your Rights at the Detention Hearing', 'California Welfare and Institutions Code (WIC)', 'Understanding the Case Plan'],
'[]'::jsonb),

('Understanding the Case Plan', 'Court Procedures', 'What a case plan is and why it matters',
'Your case plan is the roadmap to getting your children back. It is a written document that outlines:

What the case plan includes:
- Specific services you must complete (parenting classes, therapy, drug treatment, etc.)
- Visitation schedule with your children
- Goals you must achieve (stable housing, employment, sobriety, etc.)
- Timeline for completion
- Progress expectations

Why it matters:
- Completing your case plan is the key to reunification
- The judge will review your progress at every hearing
- Your compliance affects whether your children come home
- Failure to comply can result in termination of your parental rights

Your responsibilities:
- Understand what is required - ask questions if anything is unclear
- Attend all scheduled services and appointments
- Complete services on time
- Stay in regular contact with your social worker
- Maintain consistent visitation with your children
- Keep your attorney informed of your progress

If you disagree:
- You can object to services through your attorney
- You can request modifications if circumstances change
- Document any barriers to completing services

Tips for success:
- Start services immediately - do not wait
- Keep copies of all completion certificates
- Maintain a calendar of all appointments
- Communicate proactively with your social worker
- Ask for help when you need it',
'Your case plan is a list of things you must do to get your children back - like parenting classes, therapy, or drug testing. You need to complete everything on your case plan, go to all your appointments, and visit your kids regularly. This is the most important thing you can do. Do not wait to start - begin right away and ask for help if you need it.',
'Cal. Welf. & Inst. Code § 358',
ARRAY['Timeline for Court Hearings', 'Parental Rights in Dependency Court', 'Types of Services You May Be Ordered'],
'[]'::jsonb),

('Grounds for Dependency (WIC Section 300)', 'Statutes & Laws', 'The legal reasons a child can be declared a dependent of the court',
'California Welfare and Institutions Code Section 300 defines the specific circumstances under which a child can be declared a dependent of the juvenile court. The petition must allege at least one of these grounds:

Section 300(a) - Physical Abuse
The child has suffered, or there is substantial risk of suffering, serious physical harm inflicted nonaccidentally by the parent.

Section 300(b) - Failure to Protect
The child has suffered, or there is substantial risk of suffering, serious physical harm or illness due to the parent''s failure to supervise or protect, or the parent''s substance abuse.

Section 300(c) - Serious Emotional Damage
The child is suffering serious emotional damage, evidenced by severe anxiety, depression, withdrawal, or aggressive behavior toward self or others.

Section 300(d) - Sexual Abuse
The child has been sexually abused, or there is substantial risk of sexual abuse, by parent or household member.

Section 300(e) - Physical Abuse (Under 5)
The child is under age 5 and has suffered severe physical abuse by a parent, or sibling was abused and parent failed to protect.

Section 300(f) - Death of Sibling
The child''s parent caused the death of another child through abuse or neglect.

Section 300(g) - No Parental Custody
The child has been left without provision for support and the parent cannot be located.

Section 300(h) - Freed for Adoption
The child has been freed for adoption but placement has not been finalized.

Section 300(i) - Cruelty (Criminal)
The child has been subjected to an act of cruelty by the parent.

Section 300(j) - Sibling Abuse
The child''s sibling has been abused and parent failed to protect this child.',
'Section 300 is the law that explains why CPS can take your child or start a court case. The main reasons include: physical abuse, not protecting your child from harm, your substance abuse putting your child at risk, sexual abuse, or serious emotional harm to your child. The county must prove at least one of these reasons is true at the jurisdiction hearing.',
'Cal. Welf. & Inst. Code § 300',
ARRAY['California Welfare and Institutions Code (WIC)', 'Timeline for Court Hearings', 'Your Rights at the Detention Hearing'],
'[]'::jsonb)

ON CONFLICT DO NOTHING;