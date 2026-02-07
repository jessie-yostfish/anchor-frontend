/*
  # Glossary Terms Table

  ## Overview
  Creates a table for storing legal terms, acronyms, and definitions used in dependency court.

  ## New Tables
  
  ### `glossary_terms`
  Stores glossary terms with definitions, translations, and categorization.
  - `id` (uuid, primary key) - Unique identifier
  - `term` (text, unique) - The term or acronym
  - `category` (text) - Category classification (Legal Terms, Acronyms, Roles, Process, General)
  - `definition` (text) - English definition
  - `spanish_term` (text) - Spanish translation of the term
  - `spanish_definition` (text) - Spanish translation of the definition
  - `related_terms` (text array) - Array of related term names
  - `source` (text) - Reference source
  - `search_vector` (tsvector) - Full-text search vector
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on glossary_terms table
  - All authenticated users can read glossary terms
  - Only system can write (no user modifications)

  ## Indexes
  - Index on term for fast lookups
  - Index on category for filtering
  - GIN index on search_vector for full-text search
  - GIN index on related_terms array

  ## Functions
  - Trigger to automatically update search_vector on insert/update
*/

-- Create glossary_terms table
CREATE TABLE IF NOT EXISTS glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text UNIQUE NOT NULL,
  category text NOT NULL,
  definition text NOT NULL,
  spanish_term text DEFAULT '',
  spanish_definition text DEFAULT '',
  related_terms text[] DEFAULT '{}',
  source text DEFAULT '',
  search_vector tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('Legal Terms', 'Acronyms', 'Roles', 'Process', 'General'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_glossary_terms_term ON glossary_terms(term);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_category ON glossary_terms(category);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_search_vector ON glossary_terms USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_related ON glossary_terms USING GIN(related_terms);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_glossary_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.term, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.definition, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.spanish_term, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector
DROP TRIGGER IF EXISTS update_glossary_search_vector_trigger ON glossary_terms;
CREATE TRIGGER update_glossary_search_vector_trigger
  BEFORE INSERT OR UPDATE ON glossary_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_glossary_search_vector();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_glossary_terms_updated_at ON glossary_terms;
CREATE TRIGGER update_glossary_terms_updated_at
  BEFORE UPDATE ON glossary_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view glossary terms"
  ON glossary_terms FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample glossary terms
INSERT INTO glossary_terms (term, category, definition, spanish_term, spanish_definition, related_terms) VALUES
('CPS', 'Acronyms', 'Child Protective Services. The county agency responsible for investigating reports of child abuse or neglect and providing services to families. In California, this is often called CWS (Child Welfare Services) or DCFS (Department of Children and Family Services) depending on the county.', 'SPI', 'Servicios de Protección Infantil. La agencia del condado responsable de investigar reportes de abuso o negligencia infantil y proporcionar servicios a las familias.', ARRAY['CWS', 'DCFS', 'Social Worker']),

('DCFS', 'Acronyms', 'Department of Children and Family Services. The name used for child protective services in Los Angeles County and some other California counties. They investigate child abuse and neglect reports and work with families.', 'DCFS', 'Departamento de Servicios para Niños y Familias. El nombre usado para los servicios de protección infantil en el Condado de Los Ángeles y algunos otros condados de California.', ARRAY['CPS', 'CWS', 'Social Worker']),

('Detention Hearing', 'Process', 'The first court hearing in a dependency case, typically held within 48-72 hours after a child is removed from their home. The judge decides whether the child can safely return home or must remain in protective custody while the case proceeds.', 'Audiencia de Detención', 'La primera audiencia judicial en un caso de dependencia, generalmente realizada dentro de 48-72 horas después de que un niño es removido de su hogar. El juez decide si el niño puede regresar a casa de manera segura o debe permanecer bajo custodia protectora mientras el caso continúa.', ARRAY['Protective Custody', 'Removal', 'Jurisdiction Hearing']),

('Reunification', 'Legal Terms', 'The primary goal in most dependency cases: safely returning children to their parents'' care. Parents are typically given 12-18 months of reunification services (classes, therapy, etc.) to address the issues that led to removal.', 'Reunificación', 'El objetivo principal en la mayoría de los casos de dependencia: devolver a los niños de manera segura al cuidado de sus padres. A los padres generalmente se les dan 12-18 meses de servicios de reunificación (clases, terapia, etc.) para abordar los problemas que llevaron a la remoción.', ARRAY['Case Plan', 'Family Reunification Services', 'Bypass']),

('CASA', 'Acronyms', 'Court Appointed Special Advocate. A trained volunteer appointed by the judge to advocate for the best interests of children in dependency court. CASA volunteers get to know the child and make recommendations to the court.', 'CASA', 'Defensor Especial Designado por el Tribunal. Un voluntario capacitado designado por el juez para abogar por los mejores intereses de los niños en el tribunal de dependencia.', ARRAY['Guardian ad Litem', 'Child Advocate']),

('Social Worker', 'Roles', 'The county child welfare worker assigned to your case. They investigate the allegations, develop the case plan, provide services to the family, make recommendations to the court, and monitor progress toward case goals.', 'Trabajador Social', 'El trabajador de bienestar infantil del condado asignado a su caso. Investigan las alegaciones, desarrollan el plan del caso, proporcionan servicios a la familia, hacen recomendaciones al tribunal y monitorean el progreso hacia los objetivos del caso.', ARRAY['CPS', 'DCFS', 'Case Manager']),

('Case Plan', 'Legal Terms', 'A written plan that outlines what parents must do to have their children returned home. It typically includes requirements like parenting classes, therapy, drug testing, maintaining housing, and completing other services.', 'Plan del Caso', 'Un plan escrito que describe lo que los padres deben hacer para que sus hijos regresen a casa. Generalmente incluye requisitos como clases de crianza, terapia, pruebas de drogas, mantener vivienda y completar otros servicios.', ARRAY['Reunification', 'Family Reunification Services', 'Compliance']),

('Jurisdiction Hearing', 'Process', 'The court hearing where the judge decides whether the allegations of abuse or neglect are true. If the judge finds the allegations true ("sustains the petition"), the child becomes a dependent of the court.', 'Audiencia de Jurisdicción', 'La audiencia judicial donde el juez decide si las alegaciones de abuso o negligencia son verdaderas. Si el juez determina que las alegaciones son verdaderas ("sostiene la petición"), el niño se convierte en dependiente del tribunal.', ARRAY['Detention Hearing', 'Disposition Hearing', 'Petition']),

('Disposition Hearing', 'Process', 'The hearing that follows the jurisdiction hearing. The judge decides what services the parents need, where the child will live, and what the case plan will be. This hearing usually happens within 60 days of the detention hearing.', 'Audiencia de Disposición', 'La audiencia que sigue a la audiencia de jurisdicción. El juez decide qué servicios necesitan los padres, dónde vivirá el niño y cuál será el plan del caso.', ARRAY['Jurisdiction Hearing', 'Case Plan', 'Review Hearing']),

('Review Hearing', 'Process', 'Court hearings held every six months to check on the family''s progress. The judge reviews whether the parents are complying with the case plan and whether the child can safely return home.', 'Audiencia de Revisión', 'Audiencias judiciales realizadas cada seis meses para verificar el progreso de la familia. El juez revisa si los padres están cumpliendo con el plan del caso y si el niño puede regresar a casa de manera segura.', ARRAY['Six-Month Review', 'Twelve-Month Review', 'Case Plan']),

('Bypass', 'Legal Terms', 'When the court decides not to offer reunification services to parents, usually because of severe circumstances like aggravated abuse. This allows the case to move more quickly toward adoption or another permanent plan.', 'Omisión', 'Cuando el tribunal decide no ofrecer servicios de reunificación a los padres, generalmente debido a circunstancias graves como abuso agravado. Esto permite que el caso avance más rápidamente hacia la adopción u otro plan permanente.', ARRAY['Reunification', 'Permanent Plan', 'Adoption']),

('Permanency Planning', 'Legal Terms', 'Planning for a child''s long-term living arrangement. The goal is to achieve a safe, stable, permanent home. Options include reunification, adoption, legal guardianship, or long-term foster care.', 'Planificación de Permanencia', 'Planificación para el arreglo de vivienda a largo plazo de un niño. El objetivo es lograr un hogar permanente, estable y seguro. Las opciones incluyen reunificación, adopción, tutela legal o cuidado de crianza a largo plazo.', ARRAY['Reunification', 'Adoption', 'Legal Guardianship']),

('Foster Care', 'General', 'Temporary care provided by licensed caregivers when children cannot safely remain with their parents. Foster parents provide a safe home while the parents work on their case plan.', 'Cuidado de Crianza', 'Cuidado temporal proporcionado por cuidadores con licencia cuando los niños no pueden permanecer de manera segura con sus padres. Los padres de crianza proporcionan un hogar seguro mientras los padres trabajan en su plan del caso.', ARRAY['Foster Parent', 'Placement', 'Relative Placement']),

('Relative Placement', 'General', 'When a child is placed with a family member or close family friend instead of a non-related foster home. Courts prefer relative placements when possible to keep children connected to their families.', 'Colocación con Familiares', 'Cuando un niño es colocado con un miembro de la familia o un amigo cercano de la familia en lugar de un hogar de crianza no relacionado. Los tribunales prefieren colocaciones con familiares cuando es posible para mantener a los niños conectados con sus familias.', ARRAY['Foster Care', 'Placement', 'Kinship Care']),

('Adoption', 'Legal Terms', 'A permanent legal arrangement where parental rights are terminated and new parents assume full legal responsibility for the child. This becomes the plan when reunification is not possible.', 'Adopción', 'Un arreglo legal permanente donde los derechos parentales son terminados y los nuevos padres asumen la responsabilidad legal completa del niño. Este se convierte en el plan cuando la reunificación no es posible.', ARRAY['Termination of Parental Rights', 'Permanent Plan', 'Permanency Planning']),

('Termination of Parental Rights', 'Legal Terms', 'The legal process of permanently ending the parent-child relationship. This typically happens when parents cannot complete their case plan and the child needs a permanent home through adoption.', 'Terminación de Derechos Parentales', 'El proceso legal de terminar permanentemente la relación padre-hijo. Esto típicamente ocurre cuando los padres no pueden completar su plan del caso y el niño necesita un hogar permanente a través de la adopción.', ARRAY['Adoption', 'Permanent Plan', 'Section 366.26 Hearing']),

('County Counsel', 'Roles', 'The attorney who represents the child welfare agency (CPS/DCFS) in court. They present evidence and recommendations on behalf of the agency.', 'Abogado del Condado', 'El abogado que representa a la agencia de bienestar infantil (CPS/DCFS) en el tribunal. Presentan evidencia y recomendaciones en nombre de la agencia.', ARRAY['Social Worker', 'CPS']),

('Minors Counsel', 'Roles', 'An attorney appointed to represent the child''s legal interests in dependency court. They advocate for what the child wants (if age-appropriate) and what is in the child''s best interest.', 'Abogado del Menor', 'Un abogado designado para representar los intereses legales del niño en el tribunal de dependencia. Abogan por lo que el niño quiere (si es apropiado para su edad) y lo que es mejor para el niño.', ARRAY['CASA', 'Child Advocate', 'Guardian ad Litem']),

('Visitation', 'General', 'Court-ordered time that parents spend with their children while in foster care. Visits may be supervised and typically increase in frequency and length as parents progress in their case plan.', 'Visitación', 'Tiempo ordenado por el tribunal que los padres pasan con sus hijos mientras están en cuidado de crianza. Las visitas pueden ser supervisadas y generalmente aumentan en frecuencia y duración a medida que los padres progresan en su plan del caso.', ARRAY['Supervised Visitation', 'Unsupervised Visitation', 'Contact']),

('Compliance', 'General', 'Following through with all the requirements in your case plan. Good compliance means attending all classes, completing services, passing drug tests, maintaining safe housing, and following all court orders.', 'Cumplimiento', 'Seguir adelante con todos los requisitos en su plan del caso. El buen cumplimiento significa asistir a todas las clases, completar servicios, pasar pruebas de drogas, mantener vivienda segura y seguir todas las órdenes judiciales.', ARRAY['Case Plan', 'Services', 'Progress'])

ON CONFLICT (term) DO NOTHING;