# 2.9 AI 보조 기능 검증 가이드

## 자동 검증

### 1. TypeScript
```bash
pnpm exec tsc --noEmit
```
- 통과 시: 타입 에러 없음

### 2. 단위 테스트 (AI 응답 파싱)
```bash
pnpm run test
```
- `parseAIRecipeResponse` 동작 검증 (유효/무효 JSON, 앞뒤 설명 제거, notes null 처리 등)
- 6개 테스트 모두 통과해야 함

### 3. Lint
```bash
pnpm run lint
```

---

## 수동 테스트 (전체 플로우)

### 사전 조건
- `.env.local`에 `GOOGLE_GENERATIVE_AI_API_KEY`, `SUPABASE_SERVICE_ROLE` 설정
- Supabase에 `posts` 테이블 및 RLS 정책 적용
- `pnpm dev` 실행

### Step 1: 레시피 작성
1. 로그인 후 **New Recipe** 클릭
2. 제목, 설명, 카테고리, 단계, **Common Issues & Solutions**(트러블슈팅) 입력
3. **Publish Recipe** 클릭
4. 레시피 상세 페이지로 이동 (즉시)

### Step 2: AI 분석 확인
- **몇 초 후** 레시피 상세 페이지에서 **새로고침**
- **Troubleshooting** 섹션에 다음이 나타나면 성공:
  - **AI Summary**: 파란 박스 요약
  - **Common Issues & Solutions**: 사용자가 입력한 raw 텍스트
  - **Notes**: AI가 생성한 문제–해결 쌍 카드 (있을 경우)

### Step 3: API 직접 호출 (선택)
- 이미 존재하는 `postId`로 분석만 다시 돌리기:
```bash
curl -X POST http://localhost:3000/api/ai/recipe-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 1,
    "troubleshooting": "권한 오류 시 chmod 600 적용",
    "steps": [{"content": "SSH 키 생성"}],
    "title": "Git SSH 설정",
    "category": "Git"
  }'
```
- 예상: `{"success":true,"postId":1,"summary":"...","keywordsCount":...,"notesCount":...}`

---

## 수정된 버그

- **AI 응답 JSON 추출**: 이전 정규식이 첫 번째 `}`에서 잘라 잘못된 JSON이 되던 문제 → `indexOf('{')` / `lastIndexOf('}')`로 첫 `{`~마지막 `}` 구간만 잘라 사용하도록 수정 (`lib/ai/recipe-analyze-parse.ts`).
