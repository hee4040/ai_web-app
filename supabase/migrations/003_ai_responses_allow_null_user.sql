-- 비로그인 사용자도 AI 응답 저장 가능하도록 RLS 정책 보완
-- (user_id가 null인 경우에도 insert 허용)

DROP POLICY IF EXISTS "Authenticated users can insert their own AI responses" ON ai_responses;

CREATE POLICY "Users can insert AI responses (own or anonymous)"
  ON ai_responses
  FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
