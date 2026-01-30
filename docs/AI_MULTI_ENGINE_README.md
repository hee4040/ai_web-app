# 🤖 멀티 AI 엔진 시스템

## 📌 개요

EnvRecipe 프로젝트에 **Google Gemini**와 **Groq (Llama)** 두 가지 AI 엔진을 선택적으로 사용할 수 있는 멀티 엔진 시스템이 구축되었습니다.

### 주요 특징

✅ **멀티 모델 지원**: Google Gemini 1.5 Flash & Groq Llama 3.3 70B  
✅ **비용 최적화**: 300 토큰 제한 + 간결한 응답 유도 시스템 프롬프트  
✅ **할당량 대응**: Google API 할당량 초과 시 Groq으로 전환 가능  
✅ **DB 자동 저장**: 모든 AI 응답을 Supabase에 자동 저장  
✅ **사용자 친화적 UI**: 드롭다운으로 엔진 선택, 로딩 상태 표시  
✅ **에러 처리**: 맞춤형 에러 메시지 및 가이드 제공  

---

## 📂 구현된 파일 목록

### 1. 백엔드 (API)

- **`app/api/ai/multi-engine/route.ts`**
  - Google Gemini & Groq API 통합
  - 프롬프트 처리 및 응답 생성
  - Supabase DB 저장 로직
  - 할당량 초과 에러 처리

### 2. 프론트엔드 (컴포넌트)

- **`components/ai/multi-engine-chat.tsx`**
  - 범용 AI 채팅 컴포넌트
  - 엔진 선택 드롭다운 (Google/Groq)
  - 프롬프트 입력 및 응답 표시
  - 로딩 상태 및 에러 처리

- **`components/ai/recipe-ai-helper.tsx`**
  - 레시피 작성 전용 AI 도우미
  - 미리 정의된 질문 템플릿
  - 컨텍스트 기반 프롬프트 생성
  - 레시피 개선 제안 기능

### 3. 데이터베이스

- **`supabase/migrations/002_ai_responses.sql`**
  - `ai_responses` 테이블 생성
  - RLS (Row Level Security) 정책 설정
  - 인덱스 및 제약 조건

- **`types/database.ts`**
  - `AIResponse` 타입 정의 추가
  - TypeScript 타입 안전성 보장

### 4. 테스트 페이지

- **`app/ai-test/page.tsx`**
  - AI 엔진 테스트용 페이지
  - 기능 검증 및 데모

### 5. 문서

- **`docs/ai-setup-guide.md`**
  - 설정 가이드
  - API 키 발급 방법
  - 사용 예시 및 문제 해결

- **`docs/AI_MULTI_ENGINE_README.md`** (현재 파일)
  - 전체 시스템 개요

---

## 🚀 빠른 시작

### 1. 패키지 설치 (완료)

```bash
pnpm add @ai-sdk/google @ai-sdk/groq ai
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 키를 추가하세요:

```bash
# Google Gemini API 키 (이미 설정됨)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDVVAEWZ8Clm_EMNrdJQZ679roOcwlzkEY

# Groq API 키 (추가 필요) ⚠️
GROQ_API_KEY=your_groq_api_key_here
```

**Groq API 키 발급 방법:**

1. [Groq Console](https://console.groq.com/) 접속
2. 계정 생성 또는 로그인
3. API Keys → Create API Key
4. 생성된 키를 `.env.local`에 추가

### 3. 데이터베이스 마이그레이션

Supabase Dashboard에서 다음 SQL 실행:

```sql
-- supabase/migrations/002_ai_responses.sql 파일 내용 복사하여 실행
```

또는 Supabase CLI 사용:

```bash
supabase db push
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

### 5. 테스트

브라우저에서 접속:

```
http://localhost:3000/ai-test
```

---

## 💻 사용 방법

### 방법 1: 범용 채팅 컴포넌트

```tsx
import { MultiEngineChat } from "@/components/ai/multi-engine-chat";

export default function MyPage() {
  return (
    <MultiEngineChat
      category="general"
      placeholder="질문을 입력하세요..."
      onResponse={(response) => {
        console.log("AI 응답:", response);
      }}
    />
  );
}
```

### 방법 2: 레시피 도우미 컴포넌트

```tsx
import { RecipeAIHelper } from "@/components/ai/recipe-ai-helper";

export default function RecipeForm() {
  const [troubleshooting, setTroubleshooting] = useState("");

  return (
    <RecipeAIHelper
      context={{
        title: "Git SSH 설정",
        description: "Ubuntu에서 Git SSH 키 설정하기",
        steps: ["SSH 키 생성", "GitHub에 키 등록"],
      }}
      onSuggestion={(suggestion) => {
        setTroubleshooting(suggestion);
      }}
    />
  );
}
```

### 방법 3: API 직접 호출

```typescript
const response = await fetch("/api/ai/multi-engine", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
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

---

## 🎯 AI 엔진 비교

| 특징 | Google Gemini | Groq (Llama) |
|------|---------------|--------------|
| 모델 | gemini-1.5-flash | llama-3.3-70b-versatile |
| 속도 | 보통 (1-3초) | 매우 빠름 (<1초) |
| 비용 | 저렴 | 중간 |
| 할당량 | 무료 티어 제한 있음 | 관대함 |
| 품질 | 우수 | 우수 |
| 추천 용도 | 일반적인 사용 | 빠른 응답 필요 시 |

---

## 📊 데이터베이스 스키마

### `ai_responses` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGSERIAL | 기본 키 |
| `user_id` | UUID | 사용자 ID (nullable) |
| `prompt` | TEXT | 사용자 질문 |
| `response` | TEXT | AI 응답 |
| `provider` | TEXT | 'google' 또는 'groq' |
| `category` | TEXT | 기능 카테고리 |
| `response_time_ms` | INTEGER | 응답 시간 (밀리초) |
| `created_at` | TIMESTAMPTZ | 생성 시간 |

### 데이터 조회 예시

```sql
-- 최근 10개 응답 조회
SELECT 
  provider,
  category,
  LEFT(prompt, 50) as prompt_preview,
  response_time_ms,
  created_at
FROM ai_responses
ORDER BY created_at DESC
LIMIT 10;

-- 엔진별 평균 응답 시간
SELECT 
  provider,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) as total_requests
FROM ai_responses
GROUP BY provider;
```

---

## ⚙️ 설정 옵션

### 토큰 제한 변경

`app/api/ai/multi-engine/route.ts`에서 수정:

```typescript
const result = await generateText({
  model,
  system: SYSTEM_PROMPT,
  prompt,
  maxTokens: 300, // 여기를 변경
});
```

### 시스템 프롬프트 커스터마이징

```typescript
const SYSTEM_PROMPT = `당신은 간결하고 핵심적인 답변을 제공하는 AI 어시스턴트입니다.
- 핵심만 간결하게 답변하세요
- 불필요한 부연 설명은 생략하세요
- 구체적이고 실용적인 정보를 제공하세요
- 답변은 300 토큰 이내로 제한됩니다`;
```

---

## 🛡️ 에러 처리

### 1. Google 할당량 초과

**에러 메시지:**
```
"구글 할당량이 초과되었습니다. Groq 엔진으로 변경하여 시도해 보세요."
```

**해결 방법:**
- UI에서 Groq 엔진으로 전환
- 또는 다음 날까지 대기

### 2. API 키 누락

**에러 메시지:**
```
"GROQ_API_KEY가 설정되지 않았습니다."
```

**해결 방법:**
1. `.env.local` 파일에 키 추가
2. 개발 서버 재시작 (`pnpm dev`)

### 3. 네트워크 에러

**에러 메시지:**
```
"AI 요청에 실패했습니다."
```

**해결 방법:**
- 인터넷 연결 확인
- API 키 유효성 확인
- 서버 로그 확인

---

## 📈 성능 모니터링

### 콘솔 로그

API 호출 시 다음 정보가 콘솔에 출력됩니다:

```
🤖 AI 엔진 호출 시작: google
✅ AI 응답 완료 (google): 1234ms
💾 DB 저장 완료
```

### 브라우저 콘솔

프론트엔드에서도 응답 정보를 확인할 수 있습니다:

```
✅ AI 응답 성공 - 모델: google, 시간: 1234ms
```

---

## 🔍 헬스 체크

API 상태 확인:

```bash
curl http://localhost:3000/api/ai/multi-engine
```

**응답 예시:**

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

---

## 📝 체크리스트

설정 완료 확인:

- [x] `@ai-sdk/google`, `@ai-sdk/groq`, `ai` 패키지 설치 완료
- [x] `GOOGLE_GENERATIVE_AI_API_KEY` 설정 완료
- [ ] `GROQ_API_KEY` 설정 필요 ⚠️ **중요**
- [x] `ai_responses` 테이블 SQL 파일 생성 완료
- [ ] Supabase에 마이그레이션 적용 필요
- [x] TypeScript 타입 정의 완료
- [x] 컴포넌트 구현 완료
- [x] 테스트 페이지 생성 완료

---

## 🎨 UI/UX 특징

### 1. 엔진 선택 드롭다운

- Google Gemini: 파란색 Sparkles 아이콘
- Groq (Llama): 주황색 Zap 아이콘
- 각 엔진의 특징 표시 (비용 효율적 / 압도적 속도)

### 2. 로딩 상태

- 전송 버튼 비활성화
- 로딩 애니메이션 (Loader2 스피너)
- "AI 응답 생성 중..." 메시지

### 3. 토스트 알림

- 성공: 엔진명, 응답 시간, DB 저장 상태
- 에러: 맞춤형 에러 메시지 및 해결 방법 안내

### 4. 응답 표시

- 응답 시간 표시
- 읽기 쉬운 포맷 (whitespace-pre-wrap)
- 시각적으로 구분된 박스

---

## 🔧 문제 해결

### Q1: "Cannot find module '@ai-sdk/google'"

```bash
pnpm install
```

### Q2: "Table 'ai_responses' does not exist"

Supabase에 마이그레이션 파일을 적용하세요:

1. Supabase Dashboard → SQL Editor
2. `002_ai_responses.sql` 내용 복사
3. 실행

### Q3: "GROQ_API_KEY가 설정되지 않았습니다"

1. [Groq Console](https://console.groq.com/)에서 API 키 발급
2. `.env.local`에 추가
3. 서버 재시작

### Q4: 응답이 너무 길거나 짧음

`app/api/ai/multi-engine/route.ts`에서 `maxTokens` 값 조정:

```typescript
maxTokens: 300, // 원하는 값으로 변경 (예: 500, 1000)
```

---

## 📚 참고 자료

- [Google Gemini API 문서](https://ai.google.dev/docs)
- [Groq API 문서](https://console.groq.com/docs)
- [Vercel AI SDK 문서](https://sdk.vercel.ai/docs)
- [Supabase 문서](https://supabase.com/docs)

---

## 🎉 완료!

이제 EnvRecipe 프로젝트에서 멀티 AI 엔진을 사용할 수 있습니다!

**다음 단계:**

1. ⚠️ **Groq API 키 발급 및 설정** (필수)
2. Supabase에 마이그레이션 적용
3. `/ai-test` 페이지에서 테스트
4. 레시피 작성 페이지에 AI 도우미 통합

---

## 📞 지원

문제가 발생하면:

1. 브라우저 콘솔 확인
2. 서버 터미널 로그 확인
3. Supabase 로그 확인 (Dashboard → Logs)
4. `docs/ai-setup-guide.md` 참조

---

**구축 완료 일시:** 2026-01-30  
**버전:** 1.0.0  
**상태:** ✅ 구현 완료 (Groq API 키 설정 대기)
