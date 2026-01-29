# STEP 3 — 다음 단계 제시 및 STEP 4 실행 계획

## 1. 다음에 진행할 단계 (STEP 4 실행 시 수행할 작업)

1. **Supabase SQL 스키마 작성**  
   - 단일 SQL 파일 생성 (Supabase SQL Editor에 붙여넣기 가능)  
   - Phase 구분 없이 **전체 테이블** 생성: `profiles`, `categories`, `posts`, `post_steps`, `bookmarks`, `post_likes`  
   - 기본값, FK, 인덱스, `categories` 시드 데이터 포함  
   - RLS(보안 정책) 포함  
     - **전체 읽기 허용**: `posts`, `post_steps`, `categories`, `profiles`(공개 필드)  
     - **로그인 사용자만 생성**: `posts`, `post_steps`, `bookmarks`, `post_likes`  
     - **작성자 본인만 수정/삭제**: `posts`(및 CASCADE로 `post_steps`)  
     - **본인만**: `bookmarks`, `post_likes`(본인 행만 삭제 등)  
   - `profiles` 자동 생성용 트리거(auth.users INSERT 시) 포함

2. **TypeScript 타입 업데이트**  
   - `types/database.ts`: Supabase 스키마와 일치하는 DB 행 타입 + 테이블 타입 (Database, Tables, Row, Insert, Update)  
   - `types/recipe.ts`: UI/도메인용 타입 (레시피 카드·상세·폼에서 그대로 쓸 수 있는 형태, DB Row와 매핑 가능)  
   - 필요 시 `types/index.ts` 생성해 한 곳에서 re-export (선택)

---

## 2. STEP 4 실행 후 “어떻게 나오는지” 요약

### 2-1. 생성/수정되는 파일

| 파일 | 동작 |
|------|------|
| `supabase/migrations/001_initial_schema.sql` (또는 `docs/sql/001_initial_schema.sql`) | **신규** — CREATE TABLE 6개 + 시드 + 인덱스 + RLS + 트리거 |
| `types/database.ts` | **덮어쓰기** — Supabase 테이블/행 타입 정의 |
| `types/recipe.ts` | **덮어쓰기** — 레시피·Step·카테고리 등 도메인 타입 (DB 타입 기반) |

(SQL 파일 위치는 프로젝트에 `supabase/`가 있으면 `supabase/migrations/`, 없으면 `docs/sql/`로 둡니다.)

### 2-2. SQL에 포함될 내용 (요약)

- **테이블 6개**  
  - `profiles` (id uuid PK, display_name, avatar_url, updated_at)  
  - `categories` (id bigserial PK, name UNIQUE, sort_order) + 시드 5행 (Git, Docker, ROS, Kubernetes, Python)  
  - `posts` (id bigserial PK, user_id FK→profiles, title, description, category_id FK→categories, tags text[], troubleshooting_raw, ai_summary, ai_keywords, troubleshooting_notes jsonb, created_at, updated_at, is_public, like_count)  
  - `post_steps` (id bigserial PK, post_id FK→posts ON DELETE CASCADE, sort_order, content, image_url)  
  - `bookmarks` (user_id, post_id PK, created_at)  
  - `post_likes` (user_id, post_id PK, created_at)  
- **RLS**  
  - profiles: 본인만 update, 읽기는 허용(또는 공개만)  
  - categories: 모두 읽기  
  - posts: 모두 읽기, insert는 로그인, update/delete는 작성자 본인  
  - post_steps: 모두 읽기, insert/update/delete는 해당 post의 작성자만  
  - bookmarks / post_likes: 본인 행만 조회/삭제, insert는 로그인  
- **트리거**  
  - `auth.users` INSERT 시 `public.profiles`에 1행 자동 INSERT

### 2-3. TypeScript 타입에 포함될 내용 (요약)

- **types/database.ts**  
  - `Database` (스키마 전체), `Tables`, `Enums`  
  - `profiles`, `categories`, `posts`, `post_steps`, `bookmarks`, `post_likes` 각각에 대해  
    - Row, Insert, Update  
  - Supabase 클라이언트 제네릭용 (`SupabaseClient<Database>`)
- **types/recipe.ts**  
  - `RecipeCard`, `RecipeDetail`, `PostStep`, `TroubleshootingNote`, `Category` 등  
  - DB Row → 도메인 타입 변환 시 타입 캐스팅 없이 사용 가능하도록 정의

---

## 3. “내 코드에서 어느 부분이 바뀌지” (나중에 Supabase 연동 시 수정할 곳)

지금은 **mock 데이터**를 쓰고 있어서, STEP 4만 실행하면 **기존 UI 코드는 그대로 두어도 됨**.  
아래는 **나중에** Supabase에서 데이터를 가져오고 저장할 때 **바꾸게 될 파일/위치**입니다.

| 파일 / 위치 | 현재 | Supabase 연동 시 변경 |
|-------------|------|------------------------|
| `app/page.tsx` | `recipes` 하드코딩 배열, `categories` 하드코딩 | `supabase.from('posts').select('..., categories(name)').order('created_at', { ascending: false })` 등으로 교체. `categories`는 `from('categories')` 또는 시드와 동일하게 유지 |
| `app/recipes/[id]/page.tsx` | `recipeData` 하드코딩 객체 | `posts` 1건 + `post_steps` N건 조회. `TroubleshootingSection`에는 `ai_summary`, `troubleshooting_notes` 전달 |
| `app/recipes/create/page.tsx` | `console.log`로 제출, 로컬 state만 | `posts` INSERT 후 `post_steps` INSERT. AI API 호출 후 `posts`의 `ai_summary`, `ai_keywords`, `troubleshooting_notes` UPDATE |
| `app/mypage/page.tsx` | `initialMyRecipes`, `initialBookmarkedRecipes` 하드코딩 | 내 레시피: `from('posts').select('..., categories(name)').eq('user_id', userId)`. 북마크: `from('bookmarks').select('..., posts(...), profiles!posts.user_id(display_name)')`. 삭제/공개토글: `posts` UPDATE/DELETE |
| `components/domain/recipe/recipe-card.tsx` | props 그대로 사용 | 데이터가 `types/recipe.ts`의 레시피 카드 타입이면 그대로 사용. `category`는 조인된 `categories.name` |
| `components/domain/recipe/step-card.tsx` | `stepNumber`, `content`, `imageUrl` | `post_steps` 행에서 `sort_order`→stepNumber, `content`, `image_url`→imageUrl 매핑 |
| `components/domain/recipe/troubleshooting-section.tsx` | — | `ai_summary` + `troubleshooting_notes`(jsonb) 그대로 전달 가능 |
| `lib/supabase/client.ts`, `server.ts` | 플레이스홀더 | `createBrowserClient` / `createServerClient` 구현, 제네릭에 `Database` 타입 전달 |
| `app/api/ai/route.ts` | mock 반환, DB 저장 TODO | 레시피 저장 후 `posts`의 `ai_summary`, `ai_keywords`, `troubleshooting_notes` UPDATE |

**새로 만들 페이지**  
- `app/recipes/[id]/edit/page.tsx`: 수정 폼. `posts` 1건 + `post_steps` N건 로드 후, 저장 시 `posts` UPDATE + `post_steps`는 해당 `post_id` 기준으로 재저장(삭제 후 재INSERT 또는 upsert).

**정리**: STEP 4에서는 **SQL 파일 생성**과 **types/database.ts, types/recipe.ts 업데이트**만 수행합니다.  
위 목록은 “나중에 실제 연동할 때 수정할 부분”으로만 참고하면 됩니다.

---

## 4. 확인 요청

**스키마 분석 및 설계가 완료되었습니다.**  
위와 같이 STEP 4에서  
- (1) Supabase SQL 스키마(테이블 6개 + 시드 + RLS + 트리거)  
- (2) TypeScript 타입(`types/database.ts`, `types/recipe.ts`)  
을 생성·수정하고,  
- Phase 구분 없이 **전체 테이블을 한 번에 사용 가능**하게 두겠습니다.

**다음 단계로 진행할까요?**  
승인해 주시면 STEP 4를 실행해 SQL과 타입을 바로 생성·수정하겠습니다.
