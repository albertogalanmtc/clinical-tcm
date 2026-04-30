-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Array of {question: string, options: string[], allowFreeText: boolean}
  display_mode TEXT NOT NULL DEFAULT 'widget' CHECK (display_mode IN ('widget', 'modal')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  show_results BOOLEAN DEFAULT FALSE,
  thank_you_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_display_mode ON surveys(display_mode);
CREATE INDEX IF NOT EXISTS idx_surveys_dates ON surveys(start_date, end_date);

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- Array of strings matching questions order
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created ON survey_responses(created_at);
