/*
  # Rights and Duties Content Table

  ## Overview
  Creates a table for storing rights and responsibilities information for parents and youth
  in dependency court proceedings.

  ## New Tables
  
  ### `rights_duties`
  Stores rights and duties organized by role and state.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Title of the right or duty
  - `role` (text) - Role this applies to (Parents, Youth, Duties)
  - `state` (text) - State jurisdiction (e.g., California)
  - `description` (text) - Brief summary
  - `full_content` (text) - Complete explanation
  - `legal_reference` (text) - Legal citation
  - `plain_language` (text) - Simplified explanation
  - `practical_tips` (text) - Practical advice
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on rights_duties table
  - All authenticated users can read content
  - Only system can write (no user modifications)

  ## Indexes
  - Index on role and state for filtering
  - Index on sort_order
*/

-- Create rights_duties table
CREATE TABLE IF NOT EXISTS rights_duties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  role text NOT NULL,
  state text DEFAULT 'California',
  description text NOT NULL,
  full_content text DEFAULT '',
  legal_reference text DEFAULT '',
  plain_language text DEFAULT '',
  practical_tips text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('Parents', 'Youth', 'Duties'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rights_duties_role_state ON rights_duties(role, state);
CREATE INDEX IF NOT EXISTS idx_rights_duties_sort_order ON rights_duties(sort_order);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_rights_duties_updated_at ON rights_duties;
CREATE TRIGGER update_rights_duties_updated_at
  BEFORE UPDATE ON rights_duties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE rights_duties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view rights and duties"
  ON rights_duties FOR SELECT
  TO authenticated
  USING (true);

-- Insert Parents Rights
INSERT INTO rights_duties (title, role, description, full_content, legal_reference, plain_language, practical_tips, sort_order) VALUES

('Right to Legal Representation', 'Parents', 'You have the right to an attorney at every stage of your case',
'Every parent in a dependency case has the constitutional and statutory right to be represented by an attorney throughout the entire case. If you cannot afford an attorney, the court will appoint one for you at no cost.

Your attorney must:
- Represent your interests and wishes
- Communicate with you regularly about your case
- Explain your options and the legal process
- Advocate for you in court
- Help you understand court documents and orders

You have the right to meet with your attorney before each hearing and discuss your case strategy. Your attorney-client communications are confidential.

If you have serious concerns about your attorney, you may request substitute counsel through a Marsden motion.',
'Cal. Welf. & Inst. Code § 317',
'You get a free lawyer if you cannot afford one. Your lawyer works for you, explains what is happening, and speaks for you in court. What you tell your lawyer is private.',
'Stay in regular contact with your attorney. Return their calls promptly. Be honest with them about your situation. Attend all meetings they schedule. If you disagree with their approach, discuss it with them directly first.',
1),

('Right to Visit Your Child', 'Parents', 'You have the right to visit with your child unless the court finds it harmful',
'Unless the court specifically finds that visitation would be detrimental to your child, you have the right to visit with your child while they are in foster care.

Visits typically start as supervised but should progress to less restrictive settings as you make progress on your case plan. The frequency and duration of visits should be as frequent as possible to maintain your parent-child bond.

Visit rules:
- The social worker arranges the visits
- You must attend visits consistently
- Visits may be supervised initially
- Visit rules must be followed
- Cancelled visits should be rescheduled
- You can bring age-appropriate items

Visits are extremely important. They maintain your bond with your child and demonstrate to the court your commitment to reunification. Consistent, quality visits are one of the most important factors in getting your child back.',
'Cal. Welf. & Inst. Code § 362.1',
'You can visit your child while they are in foster care. At first, someone will watch your visits. As you do well in your case, visits can become less supervised. Going to all your visits shows the court you want your child back.',
'Never miss a visit unless absolutely necessary. Arrive on time. Follow all visit rules. Focus on your child during visits. Bring age-appropriate activities. If you must cancel, call ahead and reschedule immediately. Document any problems with visits and tell your attorney.',
2),

('Right to Reunification Services', 'Parents', 'You have the right to receive services to help you reunify with your child',
'Unless there are aggravated circumstances (such as severe abuse, murder of another child, or previous termination of parental rights), you are entitled to reunification services for 12-18 months.

Reunification services typically include:
- Parenting classes
- Individual therapy or counseling
- Substance abuse treatment (if needed)
- Domestic violence services (if needed)
- Mental health services
- Housing assistance
- Employment assistance
- Transportation assistance

The court orders specific services based on the issues in your case. These services are provided at no cost to you. The goal is to help you address the problems that led to your child being removed so you can safely reunify.

You have the right to appropriate services that match your needs and circumstances.',
'Cal. Welf. & Inst. Code § 361.5',
'The county must offer you free classes and services to help you fix the problems so you can get your child back. This usually lasts 12-18 months. The services should fit your specific situation.',
'Start services immediately - do not wait. Attend every session and be on time. Actively participate and apply what you learn. Keep all completion certificates. If a service is not helpful or you cannot access it, tell your attorney right away. Complete services early if possible.',
3),

('Right to Attend Court Hearings', 'Parents', 'You have the right to be present at all court hearings about your case',
'You have the right to be present at every court hearing involving your child. This includes:
- Detention hearing
- Jurisdiction hearing
- Disposition hearing
- Review hearings
- Permanency planning hearings
- All other hearings

You also have the right to:
- Be heard by the judge
- Present evidence
- Call witnesses
- Testify on your own behalf
- Contest allegations or recommendations
- Ask questions through your attorney

The court must give you proper notice of all hearings. If you do not receive notice, tell your attorney immediately.

Attending hearings is critically important. It shows the court you are engaged in your case and care about your child.',
'Cal. Welf. & Inst. Code § 349',
'You have the right to go to every court hearing about your child and to speak to the judge. The court must tell you when hearings are scheduled.',
'Attend every single hearing. Arrive early. Dress appropriately (business casual is best). Turn off your phone. Be respectful to everyone in the courtroom. Listen carefully. Take notes. Ask your attorney to explain anything you do not understand.',
4),

('Right to Appeal Court Orders', 'Parents', 'You have the right to appeal decisions you believe are wrong',
'You have the right to appeal most court orders in your dependency case. This means a higher court will review the decision to determine if the judge made an error.

Common orders that can be appealed:
- Jurisdictional findings
- Dispositional orders
- Orders terminating reunification services
- Orders setting a permanency planning hearing
- Orders terminating parental rights

Time limits are strict - typically you must file a notice of appeal within 60 days of the order. Your attorney can help you determine if an appeal is appropriate and handle the appeal process.

An appeal does not automatically stop the case from moving forward, though you can request a stay in certain circumstances.',
'Cal. Welf. & Inst. Code § 395',
'If you think the judge made a wrong decision, you can ask a higher court to review it. You must act quickly - usually within 60 days.',
'Discuss appeal options with your attorney immediately after any unfavorable ruling. Understand that appeals take time. Continuing to work your case plan during an appeal is important.',
5),

('Right to Privacy', 'Parents', 'Your case information is confidential with some exceptions',
'Dependency court proceedings and records are generally confidential. Only parties to the case and authorized individuals can access case information.

However, there are important exceptions:
- Information can be shared between agencies working on your case
- The court can release information if required by law
- Information may be disclosed to provide services
- Certain reports go to multiple parties

What you tell your attorney is privileged and confidential. The attorney cannot share this information without your permission, with limited exceptions (such as preventing serious harm).

Social worker notes and court reports are shared with all parties in the case.',
'Cal. Welf. & Inst. Code § 827',
'Your case is private and confidential. Only people involved in your case can see your records. What you tell your lawyer is protected and cannot be shared.',
'Be aware that social workers document everything, and their reports are shared with all parties. Be honest but thoughtful in your communications. Never assume something is off the record.',
6),

('Rights Under ICWA', 'Parents', 'Additional protections if you or your child has Native American heritage',
'If you or your child is a member of or eligible for membership in a federally recognized tribe, the Indian Child Welfare Act (ICWA) provides additional protections:

Higher burden of proof:
- The county must prove by clear and convincing evidence (higher standard) that removal is necessary
- Qualified expert witness must testify

Active efforts:
- The county must make active efforts (more than reasonable efforts) to prevent removal and reunify your family

Placement preferences:
- Strong preference for placement with relatives or tribal members
- Tribe can request placement with tribal families

Tribal involvement:
- Your tribe must be notified of all hearings
- Tribe has right to intervene and participate
- Case may be transferred to tribal court

Tell the court immediately if you or your child has any Native American ancestry, even if you are unsure about tribal membership.',
'25 U.S.C. §§ 1901-1963; Cal. Welf. & Inst. Code § 224',
'If you or your child has any Native American heritage, federal law gives you extra protections. The county must work harder to keep your family together. Your tribe must be told about the case and can help you.',
'Disclose any Native American heritage immediately, even if you are unsure. Contact the tribe - they may provide support and resources. Understand that ICWA makes it harder for the county to keep your child or terminate your rights.',
7),

('Right to Participate in Your Case Plan', 'Parents', 'You have the right to participate in developing your case plan',
'Your case plan is developed by the social worker, but you have the right to provide input. You should be involved in:
- Identifying the services you need
- Discussing service providers
- Setting realistic goals
- Identifying barriers to services

If you disagree with services in your case plan, you can object through your attorney at the disposition hearing. You can also request modifications if your circumstances change or if services are not appropriate.

While you have input, the court makes the final decision about what services are ordered.',
'Cal. Welf. & Inst. Code § 358',
'You should have a say in what services you are ordered to do. If you disagree with your case plan, your lawyer can object in court.',
'Communicate with your social worker about what services would be helpful. Be honest about barriers (transportation, work schedule, language, etc.). Suggest alternatives if a service is not working. Use your attorney to formally object if needed.',
8);

-- Insert Youth Rights
INSERT INTO rights_duties (title, role, description, full_content, legal_reference, plain_language, practical_tips, sort_order) VALUES

('Right to Be Heard', 'Youth', 'You have the right to have your opinion heard in court',
'If you are capable of expressing yourself, the court must consider your wishes and opinions. This includes:
- Where you want to live
- What services you want
- Whether you want contact with your parents
- Your educational and medical preferences

For youth 10 and older, the court must consult with you about your case plan. For youth 14 and older, you have additional rights to participate in your case.

The judge may speak with you directly in court or in chambers (private meeting). You can also submit a letter to the judge through your attorney.

Your voice matters. The court wants to know what you think and how you feel.',
'Cal. Welf. & Inst. Code § 349',
'The judge must listen to what you want and think about your case. You can tell the judge where you want to live and what you want to happen.',
'Be honest about your feelings and wishes. Write down what you want to say before court. Ask your attorney to help you communicate with the judge. Understand that the judge will consider your wishes but may not always agree.',
1),

('Right to Be Safe', 'Youth', 'You have the right to be safe in your placement',
'You have the right to live in a safe environment free from abuse, neglect, and exploitation. This includes:
- Physical safety
- Emotional safety
- Protection from bullying or harassment
- Safe sleeping arrangements
- Adequate food and clothing

If you do not feel safe in your placement, tell someone immediately:
- Your social worker
- Your attorney
- Your CASA volunteer (if you have one)
- A trusted teacher or counselor
- Call the Child Abuse Hotline: 1-800-4-A-CHILD

You should never be hit, threatened, or mistreated. You have the right to report problems without fear of retaliation.',
'Cal. Welf. & Inst. Code § 16001.9',
'You have the right to be safe where you live. No one should hurt you, threaten you, or make you feel unsafe. If you do not feel safe, tell an adult you trust right away.',
'Trust your instincts. If something feels wrong, speak up. Keep phone numbers for your social worker and attorney where you can access them. Document any safety concerns. Do not worry about getting in trouble for reporting - your safety comes first.',
2),

('Right to Contact with Siblings', 'Youth', 'You have the right to maintain relationships with your siblings',
'If you have brothers or sisters in foster care, you have the right to maintain contact with them, including:
- Living together when possible
- Regular visits if not living together
- Phone calls and video chats
- Attending important events together

The county must make reasonable efforts to place siblings together unless it would be harmful. If siblings cannot be placed together, the social worker must arrange frequent visits.

If you are not seeing your siblings as much as you want, tell your attorney or social worker.',
'Cal. Welf. & Inst. Code § 16002',
'You have the right to see and talk to your brothers and sisters. The county should try to keep siblings together. If you cannot live together, you should still have visits.',
'Stay in contact with your siblings as much as possible. Ask for more visits if you want them. Use video calls between visits. Tell your attorney if visits are not happening or if you want to live with your siblings.',
3),

('Right to Education', 'Youth', 'You have the right to attend school and receive educational support',
'You have the right to:
- Attend school regularly
- Stay in your school of origin (your original school) even if you move placements
- Immediate enrollment in school
- Transportation to school
- Educational stability
- Special education services if needed
- Participate in extracurricular activities
- Tutoring and academic support

You also have an education rights holder - someone who makes educational decisions on your behalf. For youth 14 and older, this might be you.

No one can prevent you from going to school or participating in normal school activities as a punishment.',
'Cal. Educ. Code § 48853',
'You have the right to go to school, get help with your schoolwork, join activities, and stay at your current school even if you move foster homes.',
'Take school seriously - education is your path forward. Communicate with your teachers about your situation if you are comfortable. Ask for tutoring if you need it. Participate in activities that interest you. Know who your education rights holder is.',
4),

('Right to an Attorney', 'Youth', 'You have the right to your own attorney in your case',
'You have the right to be represented by your own attorney throughout your dependency case. Your attorney is different from your parents attorney and represents only your interests.

Your attorney should:
- Meet with you regularly
- Explain what is happening in your case
- Listen to what you want
- Advocate for your wishes (in most cases)
- Help you understand your options

For youth 12 and older, your attorney must advocate for what you want unless it would cause substantial harm. For younger children, the attorney advocates for what is in your best interest.

Contact your attorney anytime you have questions, concerns, or if your situation changes.',
'Cal. Welf. & Inst. Code § 317',
'You have your own lawyer who works just for you. Your lawyer should listen to what you want and fight for you in court.',
'Build a relationship with your attorney. Call or text them when you have concerns. Be honest about what you want. Ask questions if you do not understand something. Keep their contact information with you.',
5),

('Right to Medical Care', 'Youth', 'You have the right to receive necessary medical and mental health care',
'You have the right to:
- Regular medical checkups
- Dental care
- Vision care
- Mental health services
- Treatment for any medical conditions
- Emergency medical care
- Information about your health

For youth 12 and older, you may be able to consent to certain medical care yourself, including mental health treatment and substance abuse services.

You should be informed about any medications you are taking and why. You have the right to participate in decisions about your health care.',
'Cal. Welf. & Inst. Code § 369',
'You have the right to see doctors and dentists, get mental health help, and receive any medical care you need. You should know what medications you are taking and why.',
'Keep track of your medical appointments. Ask questions about any medications or treatments. Tell your caregiver or social worker if you are having health problems. Request therapy if you think it would help.',
6),

('Right to Privacy', 'Youth', 'You have the right to privacy in appropriate circumstances',
'You have the right to reasonable privacy, including:
- Private time and space
- Privacy when dressing or bathing
- Privacy for phone calls with your attorney
- Confidential communications with therapists and doctors
- Privacy of your personal belongings

However, for your safety, caregivers may need to supervise your activities and monitor your belongings in some circumstances. This should be done respectfully.

Your case information is confidential, though it is shared among people working on your case.',
'Cal. Welf. & Inst. Code § 16001.9',
'You have the right to privacy when appropriate, including private space, time alone, and keeping your personal things private. Conversations with your lawyer and therapist are confidential.',
'Understand the difference between privacy and secrecy. Caregivers need to keep you safe, which may involve some supervision. Talk to your attorney if you feel your privacy is not being respected.',
7),

('Right to Personal Possessions', 'Youth', 'You have the right to have and keep personal items',
'You have the right to:
- Have your own belongings
- Keep items that are important to you
- Take your belongings when you move placements
- Have age-appropriate clothing
- Receive a reasonable allowance

When you move to a new placement, you should be able to take your belongings with you. Foster parents cannot take your belongings as punishment.

If your belongings are lost or taken when you move placements, tell your social worker and attorney.',
'Cal. Welf. & Inst. Code § 16001.9',
'You have the right to have your own things and take them with you if you move. Your belongings should not be taken away as punishment.',
'Keep a list of your important belongings. Pack your own things when moving if possible. Speak up if belongings go missing during placement changes. Ask for items you need.',
8);

-- Insert Duties
INSERT INTO rights_duties (title, role, description, full_content, legal_reference, plain_language, practical_tips, sort_order) VALUES

('Be Honest', 'Duties', 'Be truthful with your attorney, social worker, and the court',
'Honesty is essential in dependency court. Being truthful, even about difficult topics, helps everyone understand your situation and provide appropriate help.

Be honest with:
- Your attorney about your circumstances and challenges
- Your social worker about your progress and setbacks
- The court when testifying
- Service providers about your needs

Lying or hiding information can:
- Damage your credibility
- Result in inappropriate services
- Delay reunification
- Lead to loss of custody

If you make a mistake or have a setback, being honest about it and showing how you will address it is better than hiding it.',
'',
'Tell the truth even when it is hard. Being honest about your challenges helps people help you better.',
'Remember that your attorney is on your side and what you tell them is confidential. Social workers document everything, so be truthful but thoughtful. If you relapse or have a setback, tell your attorney first so they can help you address it strategically.',
1),

('Be Respectful', 'Duties', 'Treat everyone involved in your case with respect, even when you disagree',
'Treat all parties with respect:
- Judges and court staff
- Social workers
- Attorneys
- Foster parents
- Service providers
- Other parents

Being respectful means:
- Listening when others speak
- Controlling your emotions in court
- Following courtroom rules
- Avoiding confrontations
- Using appropriate language

You can disagree with decisions or recommendations while still being respectful. Express disagreement through proper channels (your attorney) rather than arguing directly.',
'',
'Treat everyone with respect even if you disagree with them or are upset. How you act affects how people see your case.',
'If you feel angry or frustrated, take a deep breath before responding. Step outside if you need to compose yourself. Remember that everyone in the courtroom is watching how you behave. Channel disagreements through your attorney.',
2),

('Participate in Services', 'Duties', 'Attend your classes, therapy, and other required services consistently',
'Active participation in services is crucial:

Attend consistently:
- Go to all scheduled appointments
- Arrive on time
- Stay for the full session
- Complete homework or assignments

Participate actively:
- Engage in discussions
- Apply what you learn
- Ask questions
- Practice new skills

Services are not just boxes to check. The goal is to address the issues that led to your case and develop new skills. How you participate matters as much as whether you attend.',
'',
'Go to all your classes and appointments on time. Really try to learn and use what they teach you, not just show up.',
'Treat services as an opportunity, not a punishment. Take notes during sessions. Apply what you learn to your daily life. Get completion certificates immediately. If a service is not helpful, discuss alternatives with your attorney.',
3),

('Communicate', 'Duties', 'Tell your attorney or social worker if something changes or you need help',
'Keep key people informed:
- Return calls promptly
- Report changes in your situation
- Ask for help when you need it
- Update contact information
- Notify of barriers to services

Communicate about:
- Changes in housing or employment
- Health issues
- Problems with services
- Financial difficulties
- Family emergencies

Proactive communication shows responsibility and allows people to help you before small problems become big ones.',
'',
'Stay in touch with your lawyer and social worker. Tell them if something changes or you need help. Return their calls and messages.',
'Save contact information for your attorney and social worker in your phone. Set reminders for important deadlines. Email updates rather than waiting for scheduled meetings. Document communication attempts if you are having trouble reaching someone.',
4),

('Follow Court Orders', 'Duties', 'Follow the rules set by the court, even if you do not agree with them',
'You must follow all court orders, including:
- Attending hearings
- Completing ordered services
- Following visit rules
- Submitting to drug testing
- Maintaining safe housing
- Any other specific orders

If you disagree with a court order:
- Your attorney can object in court
- You can request modifications
- You can appeal

However, while appealing or seeking modification, you must still follow the current order. Violating court orders can result in:
- Termination of services
- Restricted visitation
- Loss of custody',
'',
'Do what the judge orders you to do, even if you think it is unfair. If you disagree, your lawyer can help you challenge it the right way.',
'Keep a copy of all court orders. Read them carefully and ask your attorney to explain anything unclear. Set up systems to comply (calendars, reminders, transportation). If you cannot comply with an order due to barriers, tell your attorney immediately.',
5),

('Stay Connected', 'Duties', 'Keep in touch with your attorney and respond when they reach out to you',
'Maintain regular contact with your attorney:
- Answer calls and messages promptly
- Keep your contact information current
- Attend scheduled meetings
- Inform them of important developments
- Respond to requests for information

Your attorney needs to be able to reach you to:
- Prepare for hearings
- Respond to court filings
- Advise you of developments
- Coordinate strategy

If you change your phone number, address, or email, tell your attorney immediately. Missing communication from your attorney can result in missed deadlines or opportunities.',
'',
'Answer when your lawyer calls or texts. Tell them right away if your phone number or address changes.',
'Check your messages regularly. If you miss a call from your attorney, call back the same day. Keep their business card with you. Add their number to your phone contacts. Set up voicemail so they can leave messages.',
6);

-- Verify successful insertion
SELECT COUNT(*) as total_count FROM rights_duties;