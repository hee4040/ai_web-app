# STEP 1 — 코드 기반 데이터 필드 분석 (Phase 1 + Phase 2, 코드 전부 반영)

## 1. 분석 대상 요약

- **PRD**: Phase 1 MVP + Phase 2 고도화(북마크, 공감, 공개/비공개, 검색·정렬 확장, 단계별 테이블 등)
- **코드**: `app/`, `components/`, `api/` 내 **실제 사용 중인 모든 필드** (PRD와 충돌 시 **코드 우선**)

---

## 2. 레시피 카드 / 리스트 UI

| 필드 | 타입 | 사용 위치 | Phase | 비고 |
|------|------|-----------|-------|------|
| **id** | number | RecipeCard 링크 `/recipes/${id}`, 키 | 1 | 리스트/카드/상세/마이페이지/북마크 공통 |
| **title** | string | RecipeCard 제목, 정렬(name), 마이페이지, 북마크 리스트 | 1 | |
| **description** | string | RecipeCard line-clamp-2, 마이페이지 | 1 | |
| **category** | string | RecipeCard Badge, CategoryTabs 필터, 마이페이지, 북마크 리스트 | 1 | Git/Docker/ROS/Kubernetes/Python |
| **tags** | string[] | RecipeCard 칩, 마이페이지·북마크 리스트 칩 | 1 | 환경 태그 배열 |
| **createdAt** | string | RecipeCard 푸터, 정렬(latest/oldest), 상세·마이페이지 | 1 | 클라이언트 포맷 후 표시 |
| **isLoggedIn** | boolean | RecipeCard 북마크 버튼 노출 여부 | 1 | UI 상태, DB 필드 아님 |
| **initialBookmarked** | boolean | RecipeCard, BookmarkButton | 2 | 북마크 API 연동 시 필요 → `bookmarks` 테이블 |

- **정렬**: `created_at`(latest/oldest), `title`(name A-Z). Phase 2 PRD: **공감순** → `like_count` 또는 `post_likes` 테이블 필요.
- **썸네일**: 현재 카드/리스트에 이미지 없음 → Phase 1 스키마에 미포함. Phase 2에서 추가 가능.

---

## 3. 레시피 상세 페이지

| 필드 | 타입 | 사용 위치 | Phase | 비고 |
|------|------|-----------|-------|------|
| **id** | number | 라우트 `/recipes/[id]`, BookmarkButton | 1 | |
| **title** | string | 헤더 | 1 | |
| **description** | string | 본문 | 1 | |
| **category** | string | Badge | 1 | |
| **tags** | string[] | 칩 | 1 | |
| **createdAt** | string | 푸터 | 1 | |
| **steps** | array | StepCard 반복 | 1 | 아래 구조 |
| **troubleshooting.aiSummary** | string | TroubleshootingSection | 1 | |
| **troubleshooting.notes** | array | TroubleshootingSection | 1 | 아래 구조 |

### 3.1 steps 구조 (코드 기준)

- **StepCard**: `stepNumber`, `content`, `imageUrl`(optional), `imageAlt`(optional)
- **상세 mock**: `steps: [{ id, content, imageUrl? }]`
- **작성 폼**: `Step`: `id`, `description`, `image`(blob URL → 저장 시 Storage 경로)
- **DB**: Step당 `id`, `sort_order`, `content`, `image_url`. **Phase 1부터 관계형 `post_steps` 테이블** 사용(수정 시 Step 단위 UPDATE/INSERT/DELETE).

### 3.2 troubleshooting 구조 (코드 기준)

- **TroubleshootingSection**: `aiSummary`(string), `notes`: `{ id, title, description }[]`
- **API** (`api/ai/route.ts`): 요청 `troubleshooting`, `steps?`, `title?`, `category?` / 응답 `summary`, `keywords[]`
- **DB**: `troubleshooting_raw`, `ai_summary`, `ai_keywords`, `troubleshooting_notes`(JSONB).

---

## 4. 레시피 작성 폼

| 필드 | 타입 | 비고 |
|------|------|------|
| title | string | Input |
| description | string | Textarea |
| category | string | Select (Git/Docker/ROS/Kubernetes/Python) |
| tags | string | 콤마 구분 → 저장 시 text[] |
| steps | Step[] | id, description, image(파일 → Storage 경로로 저장) |
| troubleshooting | string | Textarea, AI API 입력 |

---

## 5. 마이페이지 (코드 전부 반영)

### 5.1 My Recipes (내가 쓴 레시피)

| 필드 | 타입 | 사용 위치 | Phase | 비고 |
|------|------|-----------|-------|------|
| **id** | number | 링크 `/recipes/${id}`, `/recipes/${id}/edit`, 삭제 대상 | 1 | |
| **title** | string | 링크 텍스트, Badge 옆 | 1 | |
| **description** | string | line-clamp-1 | 1 | |
| **category** | string | Badge | 1 | |
| **tags** | string[] | 칩 | 1 | |
| **isPublic** | boolean | 공개/비공개 토글 버튼 (Globe/Lock) | 2 | **코드에 이미 존재** → `posts.is_public` |
| **createdAt** | string | 푸터 "Created ..." | 1 | |

- 수정 링크: `/recipes/${recipe.id}/edit` (코드에 존재).
- 삭제: 작성자 본인만 → `posts.user_id` 필요.

### 5.2 Bookmarked Recipes (북마크한 레시피)

| 필드 | 타입 | 사용 위치 | Phase | 비고 |
|------|------|-----------|-------|------|
| **id** | number | 링크 `/recipes/${id}` | 2 | |
| **title** | string | 카드 제목 | 2 | |
| **category** | string | Badge | 2 | |
| **tags** | string[] | 칩 | 2 | |
| **author** | string | "by {author}" 표시 | 2 | **코드에 이미 존재** → profiles 조인(display_name) |

- Phase 2: `bookmarks` 테이블(user_id, post_id) + posts 조인 + profiles 조인으로 author 표시.

---

## 6. 유저 관련 데이터

| 항목 | 코드 사용처 | Phase | 비고 |
|------|-------------|-------|------|
| 작성자 식별 | PRD: 작성자 본인만 삭제/수정 | 1 | `posts.user_id` = auth.uid() |
| 마이페이지 "내가 쓴 레시피" | myRecipes 필터 | 1 | posts.user_id |
| BookmarkedRecipe.author | 마이페이지 "by author" | 2 | profiles.display_name (또는 닉네임) |
| 닉네임/프로필 이미지 | Header, user-menu는 플레이스홀더 | 2 | profiles.display_name, profiles.avatar_url |

- **결론**: `profiles`: id, display_name, avatar_url, updated_at 모두 설계에 포함 (Phase 1에서 nullable, Phase 2에서 활용).

---

## 7. AI 관련 필드

- **입력**: 트러블슈팅 텍스트, 선택적으로 steps/title/category (api/ai/route.ts).
- **응답**: `summary`, `keywords[]` → DB 저장 후 상세 표시.
- **상세 UI**: `aiSummary` + `notes[]` → DB: `ai_summary`, `ai_keywords`, `troubleshooting_notes`(JSONB).

---

## 8. PRD Phase 2 요구사항 정리

| PRD 항목 | 필요한 DB 요소 |
|----------|----------------|
| 3.1 단계별 테이블 분리, Step 이미지 여러 장 | `post_steps` 테이블 (Phase 2) 또는 posts.steps JSONB 확장 |
| 3.3 공감순 정렬, 단순 검색(제목 ILIKE) | 공감순: `post_likes` 테이블 또는 posts.like_count / 검색: posts.title |
| 3.4 북마크, 공감, 마이페이지, 공개/비공개 | `bookmarks`, `post_likes`, posts.is_public, profiles |

---

## 9. 코드에만 있고 PRD에 없는 필드

| 필드/구조 | 사용처 | 처리 |
|-----------|--------|------|
| steps[].imageUrl / step.image | StepCard, 상세 mock, 작성 폼 | Step당 이미지 0~1(Phase 1), Phase 2 다중 가능 → steps JSONB 또는 post_steps |
| troubleshooting.notes[] | TroubleshootingSection | troubleshooting_notes JSONB |
| recipeId, initialBookmarked | BookmarkButton, RecipeCard | Phase 2 bookmarks 테이블 |
| MyRecipe.isPublic | 마이페이지 토글 | posts.is_public (Phase 2) |
| BookmarkedRecipe.author | 마이페이지 "by author" | profiles.display_name 조인 |
| /recipes/[id]/edit | 마이페이지 Edit 링크 | 수정 페이지용, posts 데이터 사용 |

---

## 10. UI 렌더링에 필요한 필드 전체 목록 (Phase 구분)

### posts (레시피)

| 필드 | Phase | 사용 UI |
|------|-------|---------|
| id | 1 | 카드/상세/마이페이지/북마크/삭제/수정 링크 |
| user_id | 1 | 작성자 본인 여부, 마이페이지 "내가 쓴 레시피" |
| title | 1 | 카드/상세/마이페이지/북마크/정렬(name)/검색(Phase 2) |
| description | 1 | 카드/상세/마이페이지 |
| category_id | 1 | FK → categories.id. 표시는 categories.name 조인 (카드/상세/필터/마이페이지/북마크) |
| tags | 1 | 카드/상세/마이페이지/북마크 칩 |
| (steps) | 1 | **post_steps 테이블** 조인. 상세 StepCard·작성/수정 폼 (id, sort_order, content, image_url) |
| troubleshooting_raw | 1 | AI 입력 원문(이력) |
| ai_summary | 1 | 상세 TroubleshootingSection |
| ai_keywords | 1 | 상세 키워드/notes 대체 |
| troubleshooting_notes | 1 | 상세 TroubleshootingSection notes[] |
| created_at | 1 | 정렬·카드/상세/마이페이지 표시 |
| updated_at | 1 | 수정 시 갱신 |
| **is_public** | **2** | **마이페이지 공개/비공개 토글 (코드에 이미 존재)** |
| **like_count** | **2** | **공감순 정렬 (선택: 캐시 컬럼)** |

### profiles (유저)

| 필드 | Phase | 사용 UI |
|------|-------|---------|
| id | 1 | RLS, 마이페이지 쿼리 |
| display_name | 2 | 마이페이지 북마크 "by author", 상세 작성자 등 |
| avatar_url | 2 | 헤더/상세 작성자 아바타 |
| updated_at | 1 | 프로필 수정 |

### categories (카테고리, Phase 1)

| 필드 | Phase | 사용 UI |
|------|-------|---------|
| id | 1 | posts.category_id FK |
| name | 1 | CategoryTabs, Badge, 작성 폼 Select, 필터 값 |
| sort_order | 1 | 탭/드롭다운 표시 순서 |

### Phase 2 전용 테이블

| 테이블 | 용도 | 코드 연동 |
|--------|------|-----------|
| **bookmarks** | user_id, post_id | RecipeCard/BookmarkButton initialBookmarked, 마이페이지 북마크 리스트 |
| **post_likes** | user_id, post_id | 공감 버튼, 공감순 정렬 |
| **post_steps** (선택) | post_id, sort_order, content, image_url(s) | Phase 2 단계별 테이블 분리, Step 이미지 여러 장 |

---

# STEP 2 — Supabase DB 스키마 설계 (Phase 1 + Phase 2 포함)

## Phase 1 테이블 개수 재검토

Phase 1에서 **우리가 만드는 PostgreSQL 테이블**은 다음 **4개**입니다 (관계형 방식 채택 기준).

| # | 테이블 | 역할 | Phase 1에서 필요한 이유 |
|---|--------|------|-------------------------|
| 1 | **profiles** | 사용자 프로필 | Auth(`auth.users`)와 1:1. RLS·작성자 판별·마이페이지 "내가 쓴 레시피" 필터. Supabase가 만드는 건 `auth.users`이므로 우리 스키마에서는 profiles 1개. |
| 2 | **categories** | 카테고리 목록(룩업) | 카테고리 탭·필터·작성 폼 Select의 단일 소스. FK로 잘못된 카테고리 입력 방지, 추후 카테고리 추가/정렬 용이. |
| 3 | **posts** | 환경 설정 레시피(메타·트러블슈팅·AI 결과) | 레시피 메타·트러블슈팅 원문·AI 요약/키워드/노트. Step 본문은 `post_steps`로 분리. |
| 4 | **post_steps** | 레시피 단계(Step) | Step 단위 CRUD·수정 시 부분 갱신·Phase 2 "이미지 여러 장" 대비. 관계형 방식이므로 Phase 1부터 사용. |

**Phase 1에서 테이블로 두지 않는 것**

- **auth.users** — Supabase Auth가 관리. 우리가 CREATE 하지 않음.
- **troubleshooting_notes** — Phase 1에서는 `posts.troubleshooting_notes` JSONB 유지 가능. Phase 2 "여러 사용자 기여" 시 별도 테이블 검토.
- **bookmarks / post_likes** — Phase 2 기능.
- **post_revisions(수정 이력)** — Phase 1에는 없음. 필요 시 Phase 2에서 추가.

**Phase 1 데이터 저장소 요약**

- **PostgreSQL 테이블**: `profiles`, `categories`, `posts`, `post_steps` (4개). 관계형 방식 채택.
- **Supabase Storage**: Step 이미지 업로드용 버킷 1개 (예: `recipe-step-images`). 테이블은 아니지만 Phase 1 스키마 일부로 필요.

---

## JSONB vs 관계형 — 의견 및 권장

| 구분 | JSONB (steps, troubleshooting_notes) | 관계형 (post_steps, troubleshooting_notes 테이블) |
|------|-------------------------------------|------------------------------------------------|
| **장점** | 스키마 단순, 한 번에 읽기/쓰기, Phase 1 구현 빠름 | FK·제약으로 무결성, **수정 시 Step 단위 UPDATE/INSERT/DELETE** 가능, Phase 2 "이미지 여러 장"·Drag&Drop 순서에 자연스럽고, Step/노트 단위 쿼리·인덱스 가능 |
| **단점** | 수정 시 전체 덮어쓰기, Step 단위 쿼리/인덱스 어렵고, Phase 2에서 마이그레이션 필요 | 테이블·조인 증가, 작성/수정 API에서 트랜잭션으로 posts + post_steps 처리 필요 |
| **수정 흐름** | 레시피 수정 시 `posts.steps` 전체를 새 JSON으로 교체 | 레시피 수정 시 `post_steps`만 INSERT/UPDATE/DELETE, `posts`는 메타만 UPDATE |

**권장**: **관계형 방식 채택**. 이유 — (1) 마이페이지 수정에서 Step 추가/삭제/순서 변경이 빈번하면 JSONB 전체 교체보다 행 단위 변경이 안전하고, (2) PRD Phase 2 "단계별 테이블 분리·이미지 여러 장"을 처음부터 만족하고, (3) Supabase/PostgreSQL에서 FK·RLS 적용이 테이블 단위로 명확함.  
따라서 아래 설계에서 **Phase 1부터 `post_steps` 테이블**을 사용하고, `posts`에서는 `steps` JSONB 컬럼을 제거하는 안으로 정리한다. `troubleshooting_notes`는 구조가 단순하고 AI가 한 번에 덮어쓰는 형태라면 JSONB 유지해도 되고, "여러 사용자 기여"(Phase 2)를 염두에 두면 **관계형 테이블 `troubleshooting_notes`** 로 두는 선택지를 함께 적어 둔다.

---

## 마이페이지 수정·삭제·공개토글 — 스키마 관점

마이페이지에서 하는 일과 그때 쓰는 스키마는 다음과 같다. **별도 "수정 전용" 테이블은 없고**, 모두 `posts`(및 관계형 채택 시 `post_steps`)로 처리한다.

| 동작 | 사용 스키마 | 비고 |
|------|-------------|------|
| **내가 쓴 레시피 목록** | `posts` (WHERE user_id = auth.uid()), 필요 시 `categories` 조인 | RLS로 본인만 조회 |
| **공개/비공개 토글** | `posts.is_public` UPDATE (WHERE id = ? AND user_id = auth.uid()) | RLS로 본인만 수정 |
| **수정 버튼 → /recipes/[id]/edit** | 같은 레시피 1건 로드: `posts` 1행 + `post_steps` N행 (관계형 시). 저장 시 `posts` UPDATE(제목·설명·category_id·tags·troubleshooting_raw·ai_* 등) + `post_steps`는 해당 post_id 기준으로 INSERT/UPDATE/DELETE | 수정 전용 테이블 없음. "현재 버전"만 posts·post_steps에 있음 |
| **삭제** | `posts` 1행 DELETE (WHERE id = ? AND user_id = auth.uid()). 관계형 시 `post_steps`는 FK ON DELETE CASCADE로 함께 삭제 | RLS로 본인만 삭제 |

**수정 이력(리비전)**: PRD Phase 1에는 "이전 버전 보기/복원"이 없으므로 **Phase 1에는 수정 이력 테이블 없음**. 필요 시 Phase 2에서 `post_revisions`(post_id, revised_at, revised_by, snapshot 또는 변경 필드만 저장) 같은 테이블을 추가하면 된다.

---

## 설계 원칙

- **Phase 1**: UI가 깨지지 않도록 필수 테이블·필드만으로 즉시 동작. **Steps는 관계형 `post_steps` 테이블** 사용(수정 시 Step 단위 UPDATE/INSERT/DELETE).
- **Phase 2**: 코드에 이미 쓰이는 필드(is_public, author/북마크, 공감)와 PRD Phase 2를 반영한 테이블·컬럼을 설계에 포함.

---

## 테이블 1: `profiles`

| 컬럼명 | 데이터 타입 | nullable | Phase | 이유 | 사용 UI |
|--------|-------------|----------|-------|------|---------|
| **id** | uuid | NO (PK) | 1 | auth.users.id와 1:1, RLS·작성자 판별 | 작성자 본인 여부, 마이페이지 |
| **display_name** | text | YES | 2 | 닉네임/이름. Auth에서 채우거나 사용자 설정 | 마이페이지 "by author", 상세 작성자 |
| **avatar_url** | text | YES | 2 | 프로필 이미지 URL (Storage 등) | 헤더/상세 작성자 |
| **updated_at** | timestamptz | NO, default now() | 1 | 프로필 수정 시 갱신 | — |

---

## 테이블 2: `categories` (Phase 1)

카테고리 탭·필터·작성 폼 Select의 단일 소스. 코드에 이미 고정 목록(Git, Docker, ROS, Kubernetes, Python)이 있으므로 DB에서 관리하면 일관성·확장성이 좋음.

| 컬럼명 | 데이터 타입 | nullable | Phase | 이유 | 사용 UI |
|--------|-------------|----------|-------|------|---------|
| **id** | bigint (bigserial) | NO (PK) | 1 | 카테고리 고유 식별 | posts.category_id FK |
| **name** | text | NO, UNIQUE | 1 | 표시명 (Git, Docker, ROS, Kubernetes, Python) | CategoryTabs, Badge, 작성 폼 Select |
| **sort_order** | int | NO, default 0 | 1 | 탭/드롭다운 표시 순서 | CategoryTabs 순서 |

- **시드 데이터**: Git, Docker, ROS, Kubernetes, Python. "All"은 앱에서만 필터 값으로 사용(DB 행 아님).
- **posts와의 관계**: posts.category_id → categories.id (FK). Phase 1 리스트/필터/상세/마이페이지에서 category 이름은 categories 조인으로 표시.

---

## 테이블 3: `posts`

| 컬럼명 | 데이터 타입 | nullable | Phase | 이유 | 사용 UI |
|--------|-------------|----------|-------|------|---------|
| **id** | bigint (bigserial) | NO (PK) | 1 | 레시피 고유 식별 | 카드/상세/마이페이지/북마크/삭제/수정 |
| **user_id** | uuid | NO (FK → profiles.id) | 1 | 작성자 | RLS, 마이페이지 "내가 쓴 레시피" |
| **title** | text | NO | 1 | 제목 | 카드/상세/마이페이지/정렬(name)/검색(Phase 2) |
| **description** | text | NO | 1 | 설명 | 카드/상세/마이페이지 |
| **category_id** | bigint | NO (FK → categories.id) | 1 | 단일 카테고리. categories 테이블 참조 | Badge, 탭 필터, 마이페이지 (categories.name 조인) |
| **tags** | text[] | NO, default '{}' | 1 | 환경 태그 | 카드/상세/마이페이지 칩 |
| **troubleshooting_raw** | text | YES | 1 | 사용자 입력 원문 | AI 입력/이력 |
| **ai_summary** | text | YES | 1 | AI 요약 | TroubleshootingSection |
| **ai_keywords** | text[] | YES, default '{}' | 1 | AI 키워드 | 상세 키워드/notes 보조 |
| **troubleshooting_notes** | jsonb | YES, default '[]' | 1 | `[{ "id": number, "title": string, "description": string }]` | TroubleshootingSection notes |
| **created_at** | timestamptz | NO, default now() | 1 | 생성 시각 | 정렬·카드/상세/마이페이지 |
| **updated_at** | timestamptz | NO, default now() | 1 | 수정 시각 | 수정 페이지 등 |
| **is_public** | boolean | NO, default true | 2 | 공개/비공개. **코드에 이미 사용** | 마이페이지 공개/비공개 토글 |
| **like_count** | int | NO, default 0 | 2 | 공감 수 캐시 (선택). 공감순 정렬용 | Phase 2 정렬·표시 |

- **인덱스 권장**: category_id, created_at DESC, user_id, title (ILIKE 검색용). Phase 2: is_public, like_count DESC.
- **steps**: Step 본문·이미지는 `post_steps` 테이블에 저장. posts에는 steps JSONB 없음(관계형 방식).

---

## 테이블 4: `post_steps` (Phase 1 — 관계형)

레시피의 Step-by-Step 단계. 수정 시 Step 단위 INSERT/UPDATE/DELETE 가능.

| 컬럼명 | 데이터 타입 | nullable | Phase | 이유 | 사용 UI |
|--------|-------------|----------|-------|------|---------|
| **id** | bigint (bigserial) | NO (PK) | 1 | Step 고유 식별 | StepCard key, 수정 폼 key |
| **post_id** | bigint | NO (FK → posts.id, ON DELETE CASCADE) | 1 | 소속 레시피 | 상세/수정 시 해당 post의 steps만 조회·갱신 |
| **sort_order** | int | NO, default 0 | 1 | 표시·드래그 순서. 0,1,2,... | StepCard·수정 폼 순서 |
| **content** | text | NO | 1 | Step 내용 | StepCard 본문, 작성/수정 폼 |
| **image_url** | text | YES | 1 | Step당 이미지 0~1 (Storage 경로 또는 public URL) | StepCard 이미지, 작성/수정 폼 |

- **인덱스 권장**: post_id, sort_order (해당 post의 steps 순서 조회용).
- Phase 2에서 "이미지 여러 장" 시 `image_url` → `image_urls`(text[]) 또는 별도 step_images 테이블로 확장 가능.

---

## 테이블 5 (Phase 2): `bookmarks`

| 컬럼명 | 데이터 타입 | nullable | 이유 | 사용 UI |
|--------|-------------|----------|------|---------|
| **user_id** | uuid | NO (FK → profiles.id), PK 일부 | 북마크한 사용자 | RecipeCard/BookmarkButton, 마이페이지 북마크 리스트 |
| **post_id** | bigint | NO (FK → posts.id), PK 일부 | 북마크한 레시피 | |
| **created_at** | timestamptz | NO, default now() | 북마크 시각 | — |

- **PK**: (user_id, post_id). 한 사용자가 같은 글 중복 북마크 방지.
- **author 표시**: 마이페이지 북마크 리스트에서 posts → profiles(user_id) 조인으로 display_name 사용.

---

## 테이블 6 (Phase 2): `post_likes`

| 컬럼명 | 데이터 타입 | nullable | 이유 | 사용 UI |
|--------|-------------|----------|------|---------|
| **user_id** | uuid | NO (FK → profiles.id), PK 일부 | 공감한 사용자 | 공감 버튼, 중복 공감 방지 |
| **post_id** | bigint | NO (FK → posts.id), PK 일부 | 공감한 레시피 | |
| **created_at** | timestamptz | NO, default now() | 공감 시각 | — |

- **PK**: (user_id, post_id). 한 사용자당 한 글당 1회 공감.
- **공감순 정렬**: posts.like_count 사용하거나, 조회 시 count(*) 집계. like_count 캐시 시 INSERT/DELETE 시 트리거로 갱신.

---

## Phase 구분 요약

| 구분 | Phase 1 | Phase 2 |
|------|---------|---------|
| **profiles** | id, updated_at 필수. display_name, avatar_url nullable | display_name, avatar_url 활용 (작성자 표시 등) |
| **categories** | id, name, sort_order. 시드: Git, Docker, ROS, Kubernetes, Python | 카테고리 추가/정렬 확장 |
| **posts** | category_id(FK), steps 컬럼 없음(관계형). is_public 제외 전부 사용 | is_public 토글, like_count·공감순 |
| **post_steps** | id, post_id, sort_order, content, image_url. Phase 1부터 사용 | Phase 2: image_urls 여러 장 등 확장 |
| **bookmarks** | — | 테이블 생성, 북마크 API·마이페이지 북마크 리스트 |
| **post_likes** | — | 테이블 생성, 공감 버튼·공감순 정렬 |

---

이 문서는 **STEP 1**(코드+PRD 전부 반영, Phase 1/2 구분)과 **STEP 2**(Phase 1 핵심 테이블 2개 + Phase 2 테이블·컬럼 포함 설계) 결과입니다.  
다음 단계(SQL, RLS, TypeScript)는 사용자 승인 후 진행합니다.
