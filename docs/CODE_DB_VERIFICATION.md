# 코드 ↔ DB 스키마 검증 결과

현재 코드(UI/타입)와 Supabase 마이그레이션 스키마를 대조한 결과입니다.

---

## 1. 테이블·컬럼 일치 여부

### profiles
| DB (마이그레이션) | types/database.ts | 코드 사용처 |
|------------------|-------------------|-------------|
| id uuid PK | ✅ string | RLS, 작성자 판별 |
| display_name text | ✅ string \| null | 마이페이지 북마크 "by author" (Phase 2) |
| avatar_url text | ✅ string \| null | Phase 2 |
| updated_at timestamptz | ✅ string | — |

**결과: 일치**

---

### categories
| DB | types/database.ts | 코드 사용처 |
|----|-------------------|-------------|
| id bigint PK | ✅ number | posts.category_id FK |
| name text UNIQUE | ✅ string | CategoryTabs, Badge, 작성 폼 Select, 필터 |
| sort_order int | ✅ number | 탭 순서 |
| 시드: Git, Docker, ROS, Kubernetes, Python | — | app/page.tsx "All"은 앱에서만 사용 |

**결과: 일치**

---

### posts
| DB | types/database.ts | 코드 사용처 |
|----|-------------------|-------------|
| id bigint PK | ✅ number | 카드/상세/마이페이지/삭제 |
| user_id uuid FK | ✅ string | RLS, 마이페이지 "내가 쓴 레시피" |
| title text | ✅ string | 카드, 상세, 마이페이지 |
| description text | ✅ string | 카드, 상세, 마이페이지 |
| category_id bigint FK | ✅ number | 표시는 categories.name 조인 |
| tags text[] | ✅ string[] | 카드 칩, 상세, 마이페이지, 태그 필터 |
| troubleshooting_raw text | ✅ string \| null | 작성 폼 → AI 입력 |
| ai_summary text | ✅ string \| null | TroubleshootingSection |
| ai_keywords text[] | ✅ string[] | (상세에서 선택적 표시) |
| troubleshooting_notes jsonb | ✅ Json | TroubleshootingSection notes[] |
| created_at timestamptz | ✅ string | 정렬, 카드/상세/마이페이지 표시 |
| updated_at timestamptz | ✅ string | 수정 시 |
| is_public boolean | ✅ boolean | 마이페이지 공개/비공개 토글 |
| like_count int | ✅ number | Phase 2 공감순 |

**결과: 일치**

---

### post_steps
| DB | types/database.ts | 코드 사용처 |
|----|-------------------|-------------|
| id bigint PK | ✅ number | StepCard key |
| post_id bigint FK | ✅ number | 조회 시 post별 필터 |
| sort_order int | ✅ number | StepCard 순서, recipe.ts 정렬 |
| content text | ✅ string | StepCard 본문 |
| image_url text | ✅ string \| null | StepCard imageUrl (recipe.ts에서 매핑) |

**결과: 일치**  
- UI는 `imageUrl`, DB는 `image_url` → `types/recipe.ts`의 `postStepToStepItem`에서 변환 ✅

---

### bookmarks / post_likes
| DB | types/database.ts | 코드 사용처 |
|----|-------------------|-------------|
| user_id, post_id PK | ✅ | Phase 2 북마크/공감 |

**결과: 일치**

---

## 2. UI가 기대하는 데이터 형태 vs DB

| 화면 | UI가 기대하는 필드 | DB에서 채우는 방법 |
|------|--------------------|--------------------|
| **메인 리스트** | id, title, description, category(string), tags, createdAt(string) | posts + categories 조인 → category = categories.name, createdAt = format(created_at) |
| **상세** | id, title, description, category, tags, createdAt, steps[], troubleshooting.{ aiSummary, notes } | posts 1건 + post_steps N건 + categories.name, troubleshooting_notes JSONB 그대로 |
| **작성 폼** | title, description, category(string), tags(문자열→배열), steps[{ description, image }], troubleshooting | 저장 시 category 이름 → categories.id 조회 후 category_id로 INSERT, steps → post_steps INSERT (content, image_url) |
| **마이페이지 내 레시피** | id, title, description, category, tags, isPublic, createdAt | posts (user_id = 본인) + categories.name, post.is_public |
| **마이페이지 북마크** | id, title, category, tags, author | bookmarks 조인 posts 조인 profiles → author = profiles.display_name |

---

## 3. 연동 시 반드시 맞춰야 할 부분

### 3.1 카테고리: 이름 ↔ ID
- **코드**: 카테고리 탭/필터/작성 폼은 전부 **이름**(예: "Git") 사용.
- **DB**: posts는 **category_id** (bigint) 저장.
- **처리**:  
  - 리스트/필터: `categories.name = 'Git'`인 id 조회 후 `posts.category_id = id` 로 필터, 또는 posts ↔ categories 조인 후 `categories.name`으로 필터.  
  - 저장: 작성 폼에서 선택한 이름으로 `categories`에서 id 조회 후 `posts.category_id`에 넣기.

### 3.2 날짜 포맷
- **DB**: `created_at`, `updated_at` → ISO 문자열 (timestamptz).
- **UI**: RecipeCard, 상세, 마이페이지는 "Jan 25, 2026" 같은 **포맷된 문자열** 사용.
- **처리**: `lib/utils/format.ts` 등으로 포맷 후 전달. (이미지 툴이 있다면 거기서 사용)

### 3.3 Step: description ↔ content, image ↔ image_url
- **작성 폼**: Step이 `description`, `image` 사용.
- **DB**: post_steps는 `content`, `image_url`.
- **처리**: `types/recipe.ts`의 `stepFormToInsert`가 이미 `description` → `content`, `image` → `image_url` 매핑. 저장 시 이 함수 사용하면 됨.

### 3.4 작성 폼 category
- **현재**: `useState("")` + Select로 "Git", "Docker" 등 **이름**만 저장.
- **저장 시**: Supabase INSERT 시 해당 이름으로 `categories`에서 id 조회해 `posts.category_id`에 넣기.

---

## 4. 불일치·수정 필요 사항

| 항목 | 상태 | 비고 |
|------|------|------|
| 테이블/컬럼 이름 | ✅ 일치 | 마이그레이션 ↔ types/database.ts |
| RecipeCard props | ✅ 일치 | category는 조인으로 name 전달 시 그대로 사용 가능 |
| StepCard | ✅ 일치 | stepNumber=sort_order 또는 인덱스, content, imageUrl=image_url 매핑 |
| TroubleshootingSection | ✅ 일치 | aiSummary=ai_summary, notes=troubleshooting_notes |
| Create 폼 Step | ✅ 매핑 존재 | stepFormToInsert로 content, image_url 변환 |
| types/database.ts 주석 | ⚠️ 참고 | "001_initial_schema.sql 기준" → 현재는 분리 마이그레이션으로 동일 스키마 |

---

## 5. 요약

- **스키마와 타입**: 테이블·컬럼이 마이그레이션과 `types/database.ts`와 **일치**합니다.
- **UI와 DB**: 리스트/상세/마이페이지/작성 폼이 기대하는 필드는 모두 **posts, post_steps, categories, profiles**로 채울 수 있고,  
  **category_id ↔ name**, **created_at 포맷**, **step description/image ↔ content/image_url** 만 위와 같이 처리하면 됩니다.
- **추가 스키마 변경 없이** 현재 코드에 Supabase만 붙이면 됩니다.

---

**이 검증 결과로 코드와 DB가 잘 맞는 것으로 보입니다.  
수정하거나 더 점검하고 싶은 부분 있으면 알려주세요.**
