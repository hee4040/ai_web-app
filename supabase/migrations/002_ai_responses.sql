-- AI 응답 저장 테이블 생성
CREATE TABLE IF NOT EXISTS ai_responses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'groq')),
  category TEXT NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX idx_ai_responses_provider ON ai_responses(provider);
CREATE INDEX idx_ai_responses_category ON ai_responses(category);
CREATE INDEX idx_ai_responses_created_at ON ai_responses(created_at DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 응답만 조회 가능
CREATE POLICY "Users can view their own AI responses"
  ON ai_responses
  FOR SELECT
  USING (auth.uid() = user_id);

-- 인증된 사용자는 자신의 응답 생성 가능
CREATE POLICY "Authenticated users can insert their own AI responses"
  ON ai_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 코멘트 추가
COMMENT ON TABLE ai_responses IS 'AI 엔진(Google Gemini, Groq) 응답 저장 테이블';
COMMENT ON COLUMN ai_responses.provider IS 'AI 제공자: google 또는 groq';
COMMENT ON COLUMN ai_responses.category IS '기능 카테고리 (예: recipe_summary, troubleshooting_analysis)';
COMMENT ON COLUMN ai_responses.response_time_ms IS '응답 생성 시간 (밀리초)';
