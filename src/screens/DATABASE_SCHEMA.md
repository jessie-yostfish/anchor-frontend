# Anchor App - Database Schema Reference

## Overview
All tables are in Supabase PostgreSQL database for the California Child Welfare App.
**Date Created:** February 16, 2026  
**Last Updated:** February 16, 2026  
**Location:** Supabase project at supabase.com

---

## Table 1: legal_content
**Purpose:** California dependency law, statutes, procedures, forms, and rights  
**Accessibility:** Public READ (anyone can view)  
**Screen:** Legal.tsx (Legal Library)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| title | text | Form/law/procedure name |
| category | text | MUST BE: 'statutes', 'rights', 'procedures', 'forms' |
| description | text | Short summary (1-2 sentences) |
| full_content | text | Complete explanation |
| plain_language | text | Simplified version for 6-8th grade reading level |
| legal_reference | text | WIC section (e.g., "WIC § 300") |
| related_topics | jsonb array | Related keywords ["topic1", "topic2"] |
| subsections | jsonb array | Objects: {section, title, summary} |
| external_link | text | URL to California courts/resources (NEEDS POPULATION) |
| view_count | integer | Tracking metric |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

**Current Data:** ~15 records  
**Needs:** External links populated with real California court resource URLs

---

## Table 2: rights_duties
**Purpose:** Parent, youth, and duty information for California dependency court  
**Accessibility:** Public READ (anyone can view)  
**Screen:** RightsScreen.tsx (Your Rights & Responsibilities)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| title | text | Right/duty name |
| role | text | MUST BE: 'Parents', 'Youth', 'Duties' |
| state | text | Always 'California' |
| description | text | Brief overview |
| full_content | text | Complete explanation |
| plain_language | text | Simplified version |
| legal_reference | text | WIC section reference |
| practical_tips | text | How to apply/exercise this right |
| sort_order | integer | Display order (1, 2, 3...) |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

**Current Data:** ~30+ records (10+ per role)  
**Tabs:** Parents | Youth | Duties  
**Feature:** Show Legal Basis toggle displays legal_reference + plain_language

---

## Table 3: resources
**Purpose:** Local California resources (classes, housing, counseling, legal aid, parenting)  
**Accessibility:** Public READ (anyone can view)  
**Screen:** Resources.tsx (Local Resources)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Organization/resource name |
| description | text | What they provide |
| category | text | MUST BE: 'Classes & Workshops', 'Housing Assistance', 'Counseling & Support', 'Legal Services', 'Parenting Programs' |
| type | text | MUST BE: 'Parenting Education', 'Family Counseling', 'Substance Abuse Treatment', 'Domestic Violence Services', 'Housing Search', 'Legal Aid', 'Anger Management', 'Job Training', 'Food Assistance', 'Transportation', 'Peer Support' |
| county | text | California county (MUST match CA_COUNTIES list exactly) |
| address | text | Street address |
| phone | text | Contact phone number |
| hours | text | Operating hours |
| website | text | Organization website URL |
| languages | jsonb array | ['English', 'Spanish', 'Vietnamese'] etc. |
| cost | text | MUST BE: 'Free', 'Sliding Scale', or '$XX-$XXX' |
| availability_note | text | Important notes (hours, restrictions, etc.) |
| is_example | boolean | If true, shows "Example resource" warning |
| click_count | integer | Tracking metric |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

**Current Data:** ~50+ records across California counties  
**Filtering Logic:** County (primary) → Type → Category → Search  
**Feature:** County-scoped filtering shows only resources for selected county

**California Counties:**
All Counties, Los Angeles, Orange County, San Diego, Sacramento, Alameda, Contra Costa, Fresno, Kern, Riverside, San Bernardino, San Francisco, San Joaquin, Santa Clara, Stanislaus, Ventura

---

## Table 4: notes
**Purpose:** User's personal notes (encrypted, private)  
**Accessibility:** User-private (only owner can read/edit/delete)  
**Screens:** Notes.tsx, Preparation.tsx, RightsScreen.tsx

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users (REQUIRED) |
| title | text | User-provided title |
| content | text | Full note text (can be very long) |
| category | text | 'Other', 'Preparation', 'Legal', 'Resources' |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

**Current Data:** User-generated (private)  
**RLS Policy:** Users can only see/edit/delete their own notes  
**Saved By:** 
- Preparation.tsx (saves chat conversations)
- RightsScreen.tsx (can save legal basis)
- Notes.tsx (manual note creation)

---

## Table 5: preparation_notes
**Purpose:** AI-generated preparation guides and multi-turn chat conversations  
**Accessibility:** User-private (only owner can read/edit/delete)  
**Screen:** Preparation.tsx (Preparation & Reflection)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users (REQUIRED) |
| prep_type | text | MUST BE: 'hearing', 'meeting', 'after_hearing' |
| concerns | text | Initial user question/concern |
| generated_guide | jsonb | Contains full chat history + responses |
| exported | boolean | If user saved conversation to notes |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

**Current Data:** EMPTY (0 records) - user-generated during app use  
**RLS Policy:** Users can only see/edit their own records  
**API Integration:** https://anchor-ap1c.onrender.com/prepare (Claude AI backend)  
**Feature:** Multi-turn conversation with AI, saves entire chat as note

---

## Table 6: glossary_terms
**Purpose:** Legal terminology definitions with plain language explanations  
**Accessibility:** Public READ (anyone can view)  
**Screen:** Glossary.tsx (accessible from Legal Library)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| term | text | Legal term (alphabetically sorted) |
| definition | text | Legal/formal definition |
| plain_language | text | Simple explanation for general public |
| category | text | Term category |
| related_terms | jsonb array | Related terms ["term1", "term2"] |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

**Current Data:** NEEDS POPULATION (should have 50+ terms)  
**Alphabetical:** Sorted A-Z by term  
**Search:** Full text search on term and definition

---

## Table 7: contacts
**Purpose:** Support contact information (211, warmlines, crisis resources)  
**Accessibility:** Public READ (anyone can view)  
**Screen:** Not yet integrated (planned for Resources screen)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Organization/service name |
| type | text | Contact type (warmline, crisis, legal, etc.) |
| phone | text | Phone number |
| email | text | Email address (optional) |
| website | text | Website URL (optional) |
| description | text | What they provide |
| hours | text | Operating hours |
| languages | jsonb array | Languages supported |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

**Current Data:** EMPTY (0 records) - NEEDS POPULATION  
**Examples to Add:**
- 211 California
- CA Parent & Caregiver Warmline
- Crisis Text Line
- National Suicide Prevention Lifeline (988)
- Domestic Violence hotline

---

## Naming Conventions & Standards

### Category Values (CASE SENSITIVE - Must Match Exactly)

**legal_content.category:**
```
'statutes'
'rights'
'procedures'
'forms'
```

**rights_duties.role:**
```
'Parents'
'Youth'
'Duties'
```

**resources.category:**
```
'Classes & Workshops'
'Housing Assistance'
'Counseling & Support'
'Legal Services'
'Parenting Programs'
```

**resources.type:**
```
'Parenting Education'
'Family Counseling'
'Substance Abuse Treatment'
'Domestic Violence Services'
'Housing Search'
'Legal Aid'
'Anger Management'
'Job Training'
'Food Assistance'
'Transportation'
'Peer Support'
```

**resources.county (California):**
```
All Counties
Los Angeles
Orange County
San Diego
Sacramento
Alameda
Contra Costa
Fresno
Kern
Riverside
San Bernardino
San Francisco
San Joaquin
Santa Clara
Stanislaus
Ventura
```

**resources.cost:**
```
'Free'
'Sliding Scale'
'$50-$100'
'$100-$500'
```

---

## Data Quality Rules

1. ✅ **Reading Level** - All public content must be readable at 6-8th grade level (max 12-15 word sentences)
2. ✅ **Legal References** - Must cite California Welfare & Institutions Code (WIC §)
3. ✅ **Plain Language** - Every legal term needs simplified explanation
4. ✅ **Trauma-Informed** - Language supportive, non-judgmental, empowering
5. ✅ **Mobile-First** - All content must display clearly on small screens
6. ✅ **Bilingual** - Spanish translations required for all public content (future phase)
7. ✅ **Accuracy** - All legal content verified against official CA courts or CDSS

---

## Row Level Security (RLS) Policies

### Public Tables (No Authentication Required)
```sql
-- legal_content
CREATE POLICY "public_select" ON legal_content 
  FOR SELECT USING (true);

-- rights_duties  
CREATE POLICY "public_select" ON rights_duties 
  FOR SELECT USING (true);

-- resources
CREATE POLICY "public_select" ON resources 
  FOR SELECT USING (true);

-- glossary_terms
CREATE POLICY "public_select" ON glossary_terms 
  FOR SELECT USING (true);

-- contacts
CREATE POLICY "public_select" ON contacts 
  FOR SELECT USING (true);
```

### User-Scoped Tables (Authentication Required - Users See Only Own Data)
```sql
-- notes
CREATE POLICY "user_select" ON notes 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert" ON notes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update" ON notes 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_delete" ON notes 
  FOR DELETE USING (auth.uid() = user_id);

-- preparation_notes
CREATE POLICY "user_select" ON preparation_notes 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert" ON preparation_notes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update" ON preparation_notes 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_delete" ON preparation_notes 
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Data Sync Status

| Table | Records | Status | Next Action |
|-------|---------|--------|-------------|
| legal_content | ~15 | ✅ Has data | **POPULATE external_link column** |
| rights_duties | ~30+ | ✅ Has data | None - complete |
| resources | ~50+ | ✅ Has data | None - complete |
| glossary_terms | 0 | ❌ EMPTY | **POPULATE with 50+ legal terms** |
| notes | User-generated | ✅ Ready | None - works |
| preparation_notes | 0 | ❌ EMPTY | Works (data added during app use) |
| contacts | 0 | ❌ EMPTY | **POPULATE with CA crisis/support hotlines** |

---

## API Integrations

**Preparation & Reflection Feature:**
- Endpoint: https://anchor-ap1c.onrender.com/prepare
- Method: POST
- Sends: prompt, role, context, conversationHistory
- Returns: Claude AI-generated response
- Saves to: preparation_notes table

---

## Screen-to-Table Mapping

| Screen | Component | Tables Used | Read/Write |
|--------|-----------|-------------|-----------|
| Legal Library | Legal.tsx | legal_content | READ |
| Rights & Responsibilities | RightsScreen.tsx | rights_duties, notes | READ + WRITE |
| Local Resources | Resources.tsx | resources | READ |
| Glossary | Glossary.tsx | glossary_terms | READ |
| Preparation & Reflection | Preparation.tsx | preparation_notes, notes | READ + WRITE |
| Notes | Notes.tsx | notes | READ + WRITE |
| Dashboard | Dashboard.tsx | Multiple (varies) | READ |

---

## For Next Chat Sessions

Copy and paste the relevant sections of this document into new chats so Claude has consistent reference to:
- Exact table names and column names
- Category value options (must match exactly)
- California county names
- RLS policies
- Data quality standards
- Screen-to-table mappings

This ensures consistency across all development and debugging sessions.

---

**Created:** February 16, 2026  
**By:** Development team  
**Last Updated:** February 16, 2026
