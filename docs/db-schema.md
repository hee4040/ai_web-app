# 데이터베이스 설계 가이드 (Database Schema)

## 1. 개요

본 문서는 envrecipe 서비스의 PostgreSQL 데이터베이스 스키마 설계를 다룹니다.  
Supabase PostgreSQL을 기반으로 하며, Row Level Security (RLS) 정책을 통해 데이터 보안을 보장합니다.

---

## 2. 테이블 구조

### 2.1 `profiles` 테이블
사용자 프로필 정보를 저장합니다.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**필드 설명:**
- `id`: Supabase Auth의 `user_id`와 동일 (PK, FK)
- `email`: 사용자 이메일
- `full_name`: 사용자 이름
- `avatar_url`: 프로필 이미지 URL (Supabase Storage)
- `created_at`, `updated_at`: 타임스탬프

**RLS 정책:**
- **SELECT**: 모든 사용자가 자신의 프로필 조회 가능
- **UPDATE**: 자신의 프로필만 수정 가능
- **INSERT**: 인증된 사용자만 생성 가능

---

### 2.2 `categories` 테이블
레시피 카테고리를 관리합니다.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**필드 설명:**
- `id`: 카테고리 고유 ID
- `name`: 카테고리 이름 (예: "Git", "Docker", "ROS")
- `slug`: URL 친화적 식별자
- `description`: 카테고리 설명

**초기 데이터 (Phase 1):**
```sql
INSERT INTO categories (name, slug) VALUES
  ('전체', 'all'),
  ('Git', 'git'),
  ('Docker', 'docker'),
  ('ROS', 'ros');
```

**RLS 정책:**
- **SELECT**: 모든 사용자 조회 가능 (공개 데이터)
- **INSERT/UPDATE/DELETE**: 관리자만 가능 (Phase 1에서는 수동 관리)

---

### 2.3 `recipes` 테이블
환경 설정 레시피의 메인 정보를 저장합니다.

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  
  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,
  
  -- 환경 태그 (배열)
  environment_tags TEXT[] DEFAULT '{}',
  
  -- 트러블슈팅 및 AI 결과
  troubleshooting_text TEXT,
  ai_summary TEXT,
  ai_keywords TEXT[],
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,  -- 소프트 삭제 (Phase 2)
  
  -- 인덱스
  CONSTRAINT recipes_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200)
);
```

**필드 설명:**
- `id`: 레시피 고유 ID
- `user_id`: 작성자 ID (FK → profiles)
- `category_id`: 카테고리 ID (FK → categories)
- `title`: 레시피 제목
- `description`: 레시피 설명
- `environment_tags`: 환경 태그 배열 (예: ["macOS", "M1", "Node.js 18"])
- `troubleshooting_text`: 트러블슈팅 입력 텍스트
- `ai_summary`: AI 요약 결과
- `ai_keywords`: AI 추출 키워드 배열
- `created_at`, `updated_at`: 타임스탬프
- `deleted_at`: 소프트 삭제 (Phase 2에서 활용)

**인덱스:**
```sql
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category_id ON recipes(category_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipes_environment_tags ON recipes USING GIN(environment_tags);
```

**RLS 정책:**
- **SELECT**: 모든 사용자가 공개 레시피 조회 가능
- **INSERT**: 인증된 사용자만 생성 가능
- **UPDATE**: 작성자만 수정 가능
- **DELETE**: 작성자만 삭제 가능 (Phase 1: 하드 삭제, Phase 2: 소프트 삭제)

---

### 2.4 `recipe_steps` 테이블
레시피의 Step-by-Step 설정 과정을 저장합니다.

```sql
CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  
  -- Step 정보
  step_number INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,  -- Supabase Storage URL
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제약 조건
  CONSTRAINT recipe_steps_step_number_check CHECK (step_number > 0),
  CONSTRAINT recipe_steps_content_length CHECK (char_length(content) >= 1),
  UNIQUE(recipe_id, step_number)
);
```

**필드 설명:**
- `id`: Step 고유 ID
- `recipe_id`: 레시피 ID (FK → recipes)
- `step_number`: Step 순서 (1부터 시작)
- `title`: Step 제목 (선택사항)
- `content`: Step 내용
- `image_url`: Step 이미지 URL (Phase 1: 0~1장)

**인덱스:**
```sql
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);
CREATE INDEX idx_recipe_steps_recipe_step ON recipe_steps(recipe_id, step_number);
```

**RLS 정책:**
- **SELECT**: 레시피 조회 권한과 동일
- **INSERT/UPDATE/DELETE**: 레시피 작성자만 가능

---

## 3. Row Level Security (RLS) 정책 상세

### 3.1 `profiles` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 프로필 조회
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 정책: 자신의 프로필 수정
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 정책: 인증된 사용자만 프로필 생성
CREATE POLICY "Authenticated users can insert profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 3.2 `categories` 테이블 RLS

```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자 조회 가능
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);
```

### 3.3 `recipes` 테이블 RLS

```sql
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자가 공개 레시피 조회
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (deleted_at IS NULL);  -- Phase 2: 소프트 삭제 고려

-- 정책: 인증된 사용자만 레시피 생성
CREATE POLICY "Authenticated users can create recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책: 작성자만 레시피 수정
CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

-- 정책: 작성자만 레시피 삭제
CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);
```

### 3.4 `recipe_steps` 테이블 RLS

```sql
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

-- 정책: 레시피 조회 권한과 동일
CREATE POLICY "Recipe steps are viewable with recipe"
  ON recipe_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.deleted_at IS NULL
    )
  );

-- 정책: 레시피 작성자만 Step 생성/수정/삭제
CREATE POLICY "Users can manage steps of own recipes"
  ON recipe_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );
```

---

## 4. 함수 및 트리거

### 4.1 `updated_at` 자동 업데이트 함수

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- recipes 테이블에 트리거 적용
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- recipe_steps 테이블에 트리거 적용
CREATE TRIGGER update_recipe_steps_updated_at
  BEFORE UPDATE ON recipe_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- profiles 테이블에 트리거 적용
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 프로필 자동 생성 함수 (선택사항)

```sql
-- 사용자 가입 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 5. Phase 2 확장 고려사항

### 5.1 추가 테이블 (Phase 2)

#### `bookmarks` 테이블
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);
```

#### `likes` 테이블
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);
```

#### `recipe_images` 테이블 (다중 이미지 지원)
```sql
CREATE TABLE recipe_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_id UUID REFERENCES recipe_steps(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 인덱스 최적화
- 검색 성능 향상을 위한 Full-Text Search 인덱스
- 정렬 알고리즘을 위한 복합 인덱스

---

## 6. 마이그레이션 전략

### 6.1 Supabase 마이그레이션
1. Supabase Dashboard에서 SQL Editor 사용
2. 또는 `supabase migration` CLI 활용

### 6.2 초기 데이터 시딩
```sql
-- categories 초기 데이터
INSERT INTO categories (name, slug) VALUES
  ('전체', 'all'),
  ('Git', 'git'),
  ('Docker', 'docker'),
  ('ROS', 'ros');
```

---

## 7. 보안 체크리스트

- [ ] 모든 테이블에 RLS 활성화
- [ ] 인증되지 않은 사용자의 데이터 수정 방지
- [ ] 작성자만 자신의 레시피 수정/삭제 가능
- [ ] 환경 변수로 민감 정보 관리
- [ ] Supabase Storage 버킷 권한 설정

---

## 8. 참고 자료

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
