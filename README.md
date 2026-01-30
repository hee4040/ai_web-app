# EnvRecipe

> 개발 환경 설정 사례를 공유하고 탐색하는 레시피 플랫폼

## 이 웹앱이 뭔가요?

**EnvRecipe**는 “개발 환경 설정 레시피”를 올리고 찾아보는 웹앱입니다.  
OS·도구·버전이 다른 환경에서 **어떻게 설정했는지**, **어떤 문제가 있었고 어떻게 해결했는지**를 Step-by-Step으로 정리해 공유하고, 카테고리·태그로 검색할 수 있습니다.  
레시피 저장 시 **AI가 요약·키워드·트러블슈팅 노트**를 자동으로 만들어 주고, Google/Groq 멀티 AI 챗봇도 사용할 수 있어서, 개발자·취준생이 환경 세팅할 때 참고용으로 쓰기 좋습니다.

- **누가 쓰면 좋은지**: 개발 환경 세팅을 자주 하는 사람, 같은 설정을 팀/스스로 참고하고 싶은 사람  
- **한 줄 요약**: “환경 설정 성공 사례를 레시피처럼 올리고, AI 요약·트러블슈팅까지 한 번에 보는 서비스”

---

## 주요 기능

- **인증**: Google OAuth (Supabase Auth)
- **레시피 CRUD**: 작성·수정·삭제, Step-by-Step + 이미지 업로드
- **트러블슈팅**: 여러 개 항목 추가 (제목·내용), AI 요약·Notes 자동 생성
- **멀티 AI 엔진**: Google Gemini / Groq(Llama) 선택, 챗봇 UI (`/ai-test`), 응답 DB 저장
- **탐색**: 카테고리·태그, 북마크·공개/비공개

---

## 기술 스택

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Supabase** (Auth, PostgreSQL, Storage, RLS)
- **AI**: Vercel AI SDK + `@ai-sdk/google`, `@ai-sdk/groq`
- **UI**: Tailwind CSS 4, shadcn/ui, Lucide, Sonner

---

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수

`.env.local` 예시:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI (멀티 엔진 + 레시피 분석)
GOOGLE_GENERATIVE_AI_API_KEY=
GROQ_API_KEY=

# 선택: 배포 시 AI 분석용 base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. DB 마이그레이션

Supabase Dashboard → SQL Editor에서 `supabase/migrations/` 내 SQL을 순서대로 실행하세요.  
(특히 `002_ai_responses.sql`, `003_ai_responses_allow_null_user.sql`은 AI 기능에 필요합니다.)

### 4. 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

---

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 실행 |
| `pnpm test` | AI 응답 파싱 단위 테스트 |

---

## 주요 경로

| 경로 | 설명 |
|------|------|
| `/` | 레시피 목록 (카테고리·태그) |
| `/recipes/create` | 레시피 작성 |
| `/recipes/[id]` | 레시피 상세 (Troubleshooting·AI 요약) |
| `/recipes/[id]/edit` | 레시피 수정 |
| `/ai-test` | 멀티 AI 챗봇 (Google / Groq) |
| `/login` | Google 로그인 |
| `/mypage` | 내 레시피·북마크·공개 설정 |

---

## 문서

- **[docs/README.md](docs/README.md)** — 문서 목록 및 설명
- **[docs/functional_flow.md](docs/functional_flow.md)** — 기능별 구현 체크리스트
- **[docs/PRD.md](docs/PRD.md)** — 제품 요구사항
- **[docs/tech-stack.md](docs/tech-stack.md)** — 기술 스택
- **AI 관련**: [docs/ai-setup-guide.md](docs/ai-setup-guide.md), [QUICK_START_AI.md](QUICK_START_AI.md)

---
