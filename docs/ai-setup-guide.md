# 멀티 AI 엔진 설정 가이드

## 📋 개요

이 프로젝트는 Google Gemini와 Groq (Llama) 두 가지 AI 엔진을 선택적으로 사용할 수 있는 멀티 엔진 시스템을 지원합니다.

## 🔑 API 키 설정

### 1. Google Gemini API 키

`.env.local` 파일에 이미 설정되어 있습니다:

```
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDVVAEWZ8Clm_EMNrdJQZ679roOcwlzkEY
```

### 2. Groq API 키 (필수 추가)

**Groq API 키를 발급받아 추가해야 합니다:**

1. [Groq Console](https://console.groq.com/)에 접속
2. 계정 생성 또는 로그인
3. API Keys 섹션에서 새 API 키 생성
4. `.env.local` 파일에 추가:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

## 📦 설치된 패키지

다음 패키지들이 설치되었습니다:

```bash
pnpm add @ai-sdk/google @ai-sdk/groq ai
```

- `@ai-sdk/google`: Google Gemini 연동
- `@ai-sdk/groq`: Groq (Llama) 연동
- `ai`: Vercel AI SDK 코어

## 🗄️ 데이터베이스 마이그레이션

### Supabase 테이블 생성

`supabase/migrations/002_ai_responses.sql` 파일을 Supabase에 적용해야 합니다:

**방법 1: Supabase Dashboard 사용**

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. SQL Editor로 이동
4. `002_ai_responses.sql` 파일 내용 복사하여 실행

**방법 2: Supabase CLI 사용**

```bash
# Supabase CLI가 설치되어 있다면
supabase db push
```

### 테이블 구조

```sql
CREATE TABLE ai_responses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'groq')),
  category TEXT NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 사용 방법

### 1. 테스트 페이지 접속

개발 서버 실행 후 다음 URL로 접속:

```
http://localhost:3000/ai-test
```

### 2. 컴포넌트 사용 예시

```tsx
import { MultiEngineChat } from "@/components/ai/multi-engine-chat";

export default function MyPage() {
  return (
    <MultiEngineChat
      category="recipe_analysis"
      placeholder="레시피에 대해 질문하세요..."
      onResponse={(response) => {
        console.log("AI 응답:", response);
        // 응답 처리 로직
      }}
    />
  );
}
```

### 3. API 직접 호출

```typescript
const response = await fetch("/api/ai/multi-engine", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "레시피 작성 팁을 알려주세요",
    provider: "google", // 또는 "groq"
    category: "recipe_tips",
  }),
});

const data = await response.json();
console.log(data.response); // AI 응답
console.log(data.responseTime); // 응답 시간 (ms)
console.log(data.saved); // DB 저장 여부
```

## ⚙️ AI 엔진 특징

### Google Gemini (gemini-1.5-flash)

- ✅ **비용 효율적**: 낮은 비용으로 안정적인 응답
- ✅ **안정성**: 높은 가용성과 신뢰성
- ⚠️ **할당량 제한**: 무료 티어는 일일 요청 제한 있음

### Groq (llama-3.3-70b-versatile)

- ✅ **압도적 속도**: 초고속 추론 성능
- ✅ **높은 품질**: Llama 3.3 70B 모델 사용
- ⚠️ **비용**: Google보다 높을 수 있음

## 🛡️ 에러 처리

### 할당량 초과 (Google)

Google API 할당량 초과 시 다음과 같은 에러 메시지가 표시됩니다:

```
"구글 할당량이 초과되었습니다. Groq 엔진으로 변경하여 시도해 보세요."
```

이 경우 드롭다운에서 **Groq (Llama)**로 변경하여 재시도하세요.

### API 키 누락

API 키가 설정되지 않은 경우:

```
"GOOGLE_GENERATIVE_AI_API_KEY가 설정되지 않았습니다."
"GROQ_API_KEY가 설정되지 않았습니다."
```

`.env.local` 파일에 해당 키를 추가하고 서버를 재시작하세요.

## 📊 응답 데이터 조회

Supabase Dashboard에서 `ai_responses` 테이블을 조회하여 저장된 응답을 확인할 수 있습니다:

```sql
SELECT 
  provider,
  category,
  prompt,
  response,
  response_time_ms,
  created_at
FROM ai_responses
ORDER BY created_at DESC
LIMIT 10;
```

## 🎯 비용 최적화 설정

### 토큰 제한

현재 설정:

```typescript
maxTokens: 300 // 비용 절감을 위한 제한
```

필요에 따라 `app/api/ai/multi-engine/route.ts`에서 조정 가능합니다.

### 시스템 프롬프트

간결한 응답을 유도하는 시스템 프롬프트가 적용되어 있습니다:

```typescript
const SYSTEM_PROMPT = `당신은 간결하고 핵심적인 답변을 제공하는 AI 어시스턴트입니다.
- 핵심만 간결하게 답변하세요
- 불필요한 부연 설명은 생략하세요
- 구체적이고 실용적인 정보를 제공하세요
- 답변은 300 토큰 이내로 제한됩니다`;
```

## 🔍 헬스 체크

API 상태 확인:

```bash
curl http://localhost:3000/api/ai/multi-engine
```

응답 예시:

```json
{
  "status": "ok",
  "message": "Multi-Engine AI API is available",
  "providers": {
    "google": "configured",
    "groq": "not configured"
  }
}
```

## 📝 체크리스트

설정 완료 확인:

- [ ] `@ai-sdk/google`, `@ai-sdk/groq`, `ai` 패키지 설치 완료
- [ ] `.env.local`에 `GOOGLE_GENERATIVE_AI_API_KEY` 설정 완료
- [ ] `.env.local`에 `GROQ_API_KEY` 설정 완료 ⚠️ **필수**
- [ ] Supabase에 `ai_responses` 테이블 생성 완료
- [ ] `types/database.ts`에 `AIResponse` 타입 추가 완료
- [ ] 개발 서버 재시작 완료

## 🆘 문제 해결

### 1. "Cannot find module '@ai-sdk/google'"

```bash
pnpm install
```

### 2. "Table 'ai_responses' does not exist"

Supabase에 마이그레이션 파일을 적용하세요.

### 3. "GROQ_API_KEY가 설정되지 않았습니다"

`.env.local` 파일에 Groq API 키를 추가하고 서버를 재시작하세요.

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 브라우저 콘솔 로그
2. 서버 터미널 로그
3. Supabase 로그 (Dashboard > Logs)
