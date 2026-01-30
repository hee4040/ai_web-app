# 🚀 멀티 AI 엔진 빠른 시작 가이드

## ⚡ 5분 안에 시작하기

### 1단계: Groq API 키 발급 (2분)

1. [https://console.groq.com/](https://console.groq.com/) 접속
2. 계정 생성 (Google/GitHub 로그인 가능)
3. 좌측 메뉴에서 **"API Keys"** 클릭
4. **"Create API Key"** 버튼 클릭
5. 키 이름 입력 (예: "envrecipe-dev")
6. 생성된 키 복사

### 2단계: 환경 변수 설정 (1분)

`.env.local` 파일을 열고 다음 줄을 수정하세요:

```bash
# 이 줄을 찾아서
GROQ_API_KEY=

# 발급받은 키로 변경
GROQ_API_KEY=gsk_your_actual_api_key_here
```

### 3단계: Supabase 테이블 생성 (2분)

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **"New Query"** 클릭
5. 아래 SQL 복사하여 붙여넣기:

```sql
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

-- RLS 정책 설정
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI responses"
  ON ai_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own AI responses"
  ON ai_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

6. **"Run"** 버튼 클릭

### 4단계: 서버 재시작 및 테스트

```bash
# 개발 서버 재시작
pnpm dev
```

브라우저에서 접속:

```
http://localhost:3000/ai-test
```

---

## ✅ 테스트 방법

### 테스트 1: Google Gemini

1. AI 엔진: **Google Gemini** 선택
2. 질문 입력: "레시피 작성 시 주의할 점을 알려주세요"
3. **"AI에게 질문하기"** 버튼 클릭
4. 응답 확인 (1-3초 소요)

### 테스트 2: Groq (Llama)

1. AI 엔진: **Groq (Llama)** 선택
2. 질문 입력: "환경 설정 문서 작성 팁을 알려주세요"
3. **"AI에게 질문하기"** 버튼 클릭
4. 응답 확인 (0.5-1초 소요, 매우 빠름!)

---

## 🎯 실전 사용 예시

### 예시 1: 레시피 작성 페이지에 통합

`app/recipes/create/page.tsx`에 추가:

```tsx
import { RecipeAIHelper } from "@/components/ai/recipe-ai-helper";

// 폼 컴포넌트 내부에 추가
<section className="flex flex-col gap-4">
  <h2 className="text-lg font-semibold">AI 도우미</h2>
  <RecipeAIHelper
    context={{
      title: title,
      description: description,
      steps: steps.map(s => s.description),
    }}
    onSuggestion={(suggestion) => {
      // 제안을 troubleshooting 필드에 자동 입력
      setTroubleshooting(suggestion);
    }}
  />
</section>
```

### 예시 2: 커스텀 AI 기능

```tsx
const handleAIAnalysis = async () => {
  const response = await fetch("/api/ai/multi-engine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `다음 레시피를 분석해주세요: ${recipeContent}`,
      provider: "google",
      category: "recipe_analysis",
    }),
  });
  
  const data = await response.json();
  console.log("AI 분석:", data.response);
};
```

---

## 🔍 데이터 확인

Supabase Dashboard에서 저장된 응답 확인:

1. **Table Editor** → `ai_responses` 테이블 선택
2. 최근 응답 확인

또는 SQL Editor에서:

```sql
SELECT 
  provider,
  LEFT(prompt, 50) as question,
  LEFT(response, 100) as answer,
  response_time_ms,
  created_at
FROM ai_responses
ORDER BY created_at DESC
LIMIT 5;
```

---

## 💡 유용한 팁

### 1. 할당량 관리

Google API 할당량이 초과되면:
- 자동으로 안내 메시지 표시
- Groq으로 전환하여 계속 사용 가능

### 2. 비용 절감

- 기본 설정: 300 토큰 제한 (충분히 유용한 답변)
- 더 긴 응답 필요 시: `route.ts`에서 `maxTokens` 조정

### 3. 응답 품질 향상

컨텍스트를 함께 전달하면 더 정확한 답변:

```typescript
const prompt = `
제목: ${title}
설명: ${description}
단계: ${steps.join(", ")}

위 레시피에 대한 문제 해결 방법을 알려주세요.
`;
```

---

## 🆘 문제 해결

### "GROQ_API_KEY가 설정되지 않았습니다"

→ `.env.local` 파일 확인 및 서버 재시작

### "Table 'ai_responses' does not exist"

→ Supabase에서 SQL 실행 (3단계 다시 확인)

### 응답이 너무 느림

→ Groq 엔진으로 전환 (압도적 속도!)

### 응답이 이상함

→ 프롬프트를 더 구체적으로 작성

---

## 📊 성능 비교

실제 테스트 결과:

| 엔진 | 평균 응답 시간 | 품질 | 비용 |
|------|---------------|------|------|
| Google Gemini | 1-3초 | ⭐⭐⭐⭐⭐ | 💰 (저렴) |
| Groq (Llama) | 0.5-1초 | ⭐⭐⭐⭐⭐ | 💰💰 (중간) |

---

## 🎉 완료!

이제 멀티 AI 엔진을 사용할 준비가 되었습니다!

**추천 다음 단계:**

1. `/ai-test` 페이지에서 두 엔진 모두 테스트
2. 레시피 작성 페이지에 AI 도우미 추가
3. 저장된 응답 데이터 확인
4. 프로젝트에 맞게 커스터마이징

---

**더 자세한 정보:**
- 📖 `docs/ai-setup-guide.md` - 상세 설정 가이드
- 📖 `docs/AI_MULTI_ENGINE_README.md` - 전체 시스템 문서
