# EnvRecipe 기능적 흐름 리스트

> **데이터 흐름 중심의 구현 우선순위 가이드**

본 문서는 화면 중심이 아닌 **데이터 흐름 중심**으로 기능을 나열한 구현 가이드입니다.  
각 단계는 "데이터 페칭 → 상태 관리 → UI 바인딩" 순서로 구성되어 있으며,  
하나씩 컨펌하며 개발을 진행할 수 있도록 번호를 매겼습니다.

---

## 📋 목차

- [Phase 1: Foundation](#phase-1-foundation)
- [Phase 2: Core Logic](#phase-2-core-logic)
- [Phase 3: Interaction & Feedback](#phase-3-interaction--feedback)
- [구현 체크리스트](#구현-체크리스트)

---

## Phase 1: Foundation

**목표**: 공통 유틸리티 및 기본 데이터 연결 인프라 구축

---

### 1.1 Supabase 클라이언트 인스턴스 생성 (클라이언트 사이드)

**데이터 흐름**: 환경 변수 → Supabase 클라이언트 생성 → 전역 사용 가능한 인스턴스

**기술 스택**:
- `@supabase/supabase-js` / `@supabase/ssr`
- `lib/supabase/client.ts`
- Client Component

**구현 내용**:
- [ ] `pnpm add @supabase/supabase-js @supabase/ssr` 패키지 설치
- [ ] `lib/supabase/client.ts`에 `createBrowserClient` 구현
- [ ] `Database` 타입 제네릭 적용
- [ ] 환경 변수 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) 검증

**상태 관리**: 없음 (단순 유틸리티 함수)

**UI 바인딩**: 없음

---

### 1.2 Supabase 클라이언트 인스턴스 생성 (서버 사이드)

**데이터 흐름**: 쿠키 스토어 → Supabase 서버 클라이언트 생성 → Server Component/Server Action에서 사용

**기술 스택**:
- `@supabase/ssr`
- `lib/supabase/server.ts`
- Server Component / Server Action
- Next.js `cookies()` API

**구현 내용**:
- [ ] `lib/supabase/server.ts`에 `createServerClient` 구현
- [ ] 쿠키 기반 세션 관리 로직
- [ ] `Database` 타입 제네릭 적용
- [ ] Server Component와 Server Action에서 사용 가능하도록 async 함수로 구현

**상태 관리**: 없음 (서버 사이드, 쿠키 기반)

**UI 바인딩**: 없음

---

### 1.3 인증 상태 페칭 및 관리 (클라이언트)

**데이터 흐름**: Supabase Auth → `auth.getUser()` → 사용자 정보 상태 저장 → 컴포넌트 구독

**기술 스택**:
- `hooks/use-auth.ts`
- `supabase.auth.getUser()`
- `supabase.auth.onAuthStateChange()`
- React `useState`, `useEffect`
- Client Component

**구현 내용**:
- [ ] `hooks/use-auth.ts`에 `useAuth` 훅 구현
- [ ] 초기 사용자 정보 페칭 (`getUser()`)
- [ ] 인증 상태 변경 구독 (`onAuthStateChange()`)
- [ ] `user`, `loading` 상태 반환
- [ ] 메모리 누수 방지 (구독 해제)

**상태 관리**:
- `user: User | null` - 현재 로그인한 사용자
- `loading: boolean` - 초기 로딩 상태

**UI 바인딩**:
- `components/common/Header.tsx` - 로그인/로그아웃 버튼 표시
- `app/(auth)/login/page.tsx` - 이미 로그인한 경우 리다이렉트

---

### 1.4 Google OAuth 로그인 플로우

**데이터 흐름**: 로그인 버튼 클릭 → `signInWithOAuth()` → Google 리다이렉트 → 콜백 처리 → 세션 생성

**기술 스택**:
- `supabase.auth.signInWithOAuth()`
- `app/(auth)/login/page.tsx` (Client Component)
- `app/(auth)/callback/page.tsx` (Client Component)
- `supabase.auth.exchangeCodeForSession()`
- Google OAuth Provider

**구현 내용**:
- [ ] `hooks/use-auth.ts`에 `signInWithGoogle()` 함수 추가
- [ ] 로그인 페이지에서 버튼 클릭 핸들러 연결
- [ ] OAuth 리다이렉트 URL 설정 (`redirectTo`)
- [ ] 콜백 페이지에서 `code` 파라미터 추출
- [ ] `exchangeCodeForSession()` 호출하여 세션 생성
- [ ] 성공 시 홈으로 리다이렉트, 실패 시 에러 처리

**상태 관리**:
- `useAuth` 훅의 `user` 상태 자동 업데이트 (1.3에서 구독)

**UI 바인딩**:
- `app/(auth)/login/page.tsx` - Google 로그인 버튼
- `app/(auth)/callback/page.tsx` - 로딩 인디케이터

---

### 1.5 로그아웃 플로우

**데이터 흐름**: 로그아웃 버튼 클릭 → `auth.signOut()` → 세션 삭제 → 상태 업데이트

**기술 스택**:
- `supabase.auth.signOut()`
- `hooks/use-auth.ts`
- `components/domain/auth/user-menu.tsx`

**구현 내용**:
- [ ] `hooks/use-auth.ts`에 `signOut()` 함수 추가
- [ ] `components/domain/auth/user-menu.tsx`에 로그아웃 버튼 연결
- [ ] 로그아웃 후 홈으로 리다이렉트

**상태 관리**:
- `useAuth` 훅의 `user` 상태가 `null`로 업데이트

**UI 바인딩**:
- `components/domain/auth/user-menu.tsx` - 로그아웃 메뉴 항목

---

### 1.6 카테고리 목록 데이터 페칭 (서버)

**데이터 흐름**: Server Component 마운트 → `categories` 테이블 조회 → UI에 전달

**기술 스택**:
- `app/page.tsx` (Server Component)
- `supabase.from('categories').select().order('sort_order')`
- `lib/supabase/server.ts`

**구현 내용**:
- [ ] 메인 페이지에서 `categories` 테이블 조회
- [ ] `sort_order` 기준 정렬
- [ ] `CategoryTabs` 컴포넌트에 데이터 전달
- [ ] 에러 처리 (없는 경우 빈 배열)

**상태 관리**: 없음 (서버 사이드 페칭, 정적 데이터)

**UI 바인딩**:
- `components/domain/recipe/category-tabs.tsx` - 카테고리 탭 렌더링

---

### 1.7 미들웨어 설정 (인증 상태 동기화)

**데이터 흐름**: 요청 → 미들웨어 → 쿠키에서 세션 확인 → 쿠키 갱신

**기술 스택**:
- `middleware.ts` (루트)
- `@supabase/ssr`
- Next.js Middleware API

**구현 내용**:
- [ ] `middleware.ts` 파일 생성
- [ ] 모든 요청에서 Supabase 클라이언트 생성
- [ ] `auth.getUser()` 호출하여 세션 갱신
- [ ] 쿠키 동기화 로직
- [ ] 정적 파일 제외 설정 (`matcher`)

**상태 관리**: 없음 (쿠키 기반)

**UI 바인딩**: 없음 (백그라운드 동작)

---

## Phase 2: Core Logic

**목표**: 주요 비즈니스 기능의 Read/Write 구현

---

### 2.1 공개 레시피 목록 페칭 (서버)

**데이터 흐름**: Server Component 마운트 → `posts` 테이블 조회 (조인) → 필터링/정렬 → UI 바인딩

**기술 스택**:
- `app/page.tsx` (Server Component)
- `supabase.from('posts').select('..., categories(*)').eq('is_public', true)`
- `lib/supabase/server.ts`
- URL Search Params (카테고리 필터, 정렬)

**구현 내용**:
- [ ] `posts` 테이블에서 `is_public = true` 레시피만 조회
- [ ] `categories` 테이블 조인 (`select('..., categories(*)')`)
- [ ] URL 파라미터 기반 카테고리 필터링 (`searchParams.category`)
- [ ] 정렬 옵션 적용 (`created_at DESC/ASC`, `title ASC`)
- [ ] 타입 변환 (`Post` + `Category` → `RecipeWithCategory`)
- [ ] 에러 처리

**상태 관리**: 없음 (서버 사이드 페칭)

**UI 바인딩**:
- `components/domain/recipe/recipe-list.tsx` - 레시피 목록 렌더링
- `components/domain/recipe/recipe-card.tsx` - 개별 레시피 카드

---

### 2.2 레시피 상세 데이터 페칭 (서버)

**데이터 흐름**: 동적 라우트 파라미터 → `posts` + `post_steps` + `profiles` 조회 → UI 바인딩

**기술 스택**:
- `app/recipes/[id]/page.tsx` (Server Component)
- `supabase.from('posts').select('..., categories(*), profiles!posts_user_id_fkey(...)').eq('id', id).single()`
- `supabase.from('post_steps').select().eq('post_id', id).order('sort_order')`
- `notFound()` (Next.js)

**구현 내용**:
- [ ] URL 파라미터에서 `id` 추출
- [ ] `posts` 테이블에서 단일 레시피 조회 (조인: `categories`, `profiles`)
- [ ] `post_steps` 테이블에서 해당 레시피의 모든 단계 조회
- [ ] `sort_order` 기준 정렬
- [ ] 존재하지 않는 레시피 → `notFound()` 호출
- [ ] 비공개 레시피 접근 제한 (RLS 정책 활용)

**상태 관리**: 없음 (서버 사이드 페칭)

**UI 바인딩**:
- `components/domain/recipe/recipe-detail.tsx` - 레시피 상세 정보
- `components/domain/recipe/step-card.tsx` - 단계별 카드
- `components/domain/recipe/troubleshooting-section.tsx` - 트러블슈팅 섹션

---

### 2.3 레시피 작성 폼 데이터 제출 (Server Action)

**데이터 흐름**: 폼 제출 → Server Action → `posts` INSERT → `post_steps` INSERT → 이미지 업로드 → 리다이렉트

**기술 스택**:
- `app/recipes/create/actions.ts` (Server Action)
- `supabase.from('posts').insert()`
- `supabase.from('post_steps').insert()`
- `supabase.storage.from('recipe-step-images').upload()`
- `revalidatePath()` (Next.js)
- FormData 처리

**구현 내용**:
- [ ] 인증 확인 (`auth.getUser()`)
- [ ] FormData에서 필드 추출 (title, description, categoryId, tags, troubleshooting)
- [ ] `posts` 테이블에 레시피 메인 정보 INSERT
- [ ] `post_steps` 테이블에 단계별 정보 INSERT (반복)
- [ ] 이미지 파일이 있으면 Supabase Storage에 업로드
- [ ] 업로드된 이미지 URL을 `post_steps.image_url`에 저장
- [ ] 트랜잭션 처리 (에러 시 롤백 고려)
- [ ] `revalidatePath('/')` 호출하여 캐시 갱신
- [ ] 생성된 레시피 ID 반환

**상태 관리**:
- 클라이언트: 폼 상태 (`useState`)
- 서버: 없음 (Server Action)

**UI 바인딩**:
- `app/recipes/create/page.tsx` - 폼 제출 핸들러
- `components/domain/recipe/recipe-form.tsx` - 폼 컴포넌트

---

### 2.4 내가 작성한 레시피 목록 페칭 (서버)

**데이터 흐름**: 인증 확인 → `posts` 테이블 조회 (user_id 필터) → UI 바인딩

**기술 스택**:
- `app/mypage/page.tsx` (Server Component)
- `supabase.auth.getUser()`
- `supabase.from('posts').select('..., categories(*)').eq('user_id', userId)`
- `redirect()` (Next.js)

**구현 내용**:
- [ ] 인증 확인 (비로그인 시 `/login`으로 리다이렉트)
- [ ] `posts` 테이블에서 `user_id = auth.uid()` 레시피만 조회
- [ ] `categories` 테이블 조인
- [ ] `created_at DESC` 정렬
- [ ] 타입 변환

**상태 관리**: 없음 (서버 사이드 페칭)

**UI 바인딩**:
- `app/mypage/page.tsx` - "My Recipes" 섹션
- `components/domain/recipe/recipe-list.tsx` - 레시피 목록 (수정/삭제 버튼 포함)

---

### 2.5 레시피 수정 데이터 로드 (서버)

**데이터 흐름**: 동적 라우트 파라미터 → 인증 확인 → 작성자 확인 → `posts` + `post_steps` 조회 → 폼에 초기값 설정

**기술 스택**:
- `app/recipes/[id]/edit/page.tsx` (Server Component)
- `supabase.from('posts').select().eq('id', id).eq('user_id', userId).single()`
- `supabase.from('post_steps').select().eq('post_id', id).order('sort_order')`
- `notFound()`, `redirect()` (Next.js)

**구현 내용**:
- [ ] 인증 확인
- [ ] 레시피 존재 및 작성자 확인 (`user_id` 일치)
- [ ] `posts` 테이블에서 레시피 메인 정보 조회
- [ ] `post_steps` 테이블에서 단계별 정보 조회
- [ ] 권한 없음 → `notFound()` 또는 에러 처리
- [ ] 폼 컴포넌트에 `initialData` prop 전달

**상태 관리**: 없음 (서버 사이드 페칭)

**UI 바인딩**:
- `components/domain/recipe/recipe-form.tsx` - 수정 모드 (initialData 사용)

---

### 2.6 레시피 수정 데이터 제출 (Server Action)

**데이터 흐름**: 폼 제출 → Server Action → 작성자 확인 → `posts` UPDATE → 기존 `post_steps` DELETE → 새 `post_steps` INSERT → 이미지 업로드 → 리다이렉트

**기술 스택**:
- `app/recipes/[id]/edit/actions.ts` (Server Action)
- `supabase.from('posts').update().eq('id', id).eq('user_id', userId)`
- `supabase.from('post_steps').delete().eq('post_id', id)`
- `supabase.from('post_steps').insert()` (반복)
- `supabase.storage.from('recipe-step-images').upload()`
- `revalidatePath()` (Next.js)

**구현 내용**:
- [ ] 인증 확인
- [ ] 작성자 확인 (RLS 정책으로도 보호되지만 이중 체크)
- [ ] `posts` 테이블 UPDATE (title, description, categoryId, tags, troubleshooting, updated_at)
- [ ] 기존 `post_steps` 모두 DELETE
- [ ] 새 `post_steps` INSERT (순서 유지)
- [ ] 새로 업로드된 이미지 처리
- [ ] 기존 이미지 URL 유지 또는 삭제 처리
- [ ] `revalidatePath()` 호출

**상태 관리**:
- 클라이언트: 폼 상태
- 서버: 없음

**UI 바인딩**:
- `app/recipes/[id]/edit/page.tsx` - 폼 제출 핸들러

---

### 2.7 레시피 삭제 (Server Action)

**데이터 흐름**: 삭제 버튼 클릭 → Server Action → 작성자 확인 → `posts` DELETE (CASCADE로 `post_steps` 자동 삭제) → 리다이렉트

**기술 스택**:
- `app/mypage/actions.ts` 또는 `app/recipes/[id]/actions.ts` (Server Action)
- `supabase.from('posts').delete().eq('id', id).eq('user_id', userId)`
- `revalidatePath()` (Next.js)

**구현 내용**:
- [ ] 인증 확인
- [ ] 작성자 확인
- [ ] `posts` DELETE (CASCADE로 `post_steps` 자동 삭제)
- [ ] Storage 이미지 삭제 (선택사항, 정리 목적)
- [ ] `revalidatePath('/')`, `revalidatePath('/mypage')` 호출
- [ ] 성공 응답 반환

**상태 관리**:
- 클라이언트: 삭제 확인 다이얼로그 상태
- 서버: 없음

**UI 바인딩**:
- `app/mypage/page.tsx` - 삭제 버튼 및 확인 다이얼로그
- `components/ui/alert-dialog.tsx` - 삭제 확인 UI

---

### 2.8 공개/비공개 토글 (Server Action)

**데이터 흐름**: 토글 버튼 클릭 → Server Action → 작성자 확인 → `posts.is_public` UPDATE → 상태 반영

**기술 스택**:
- `app/mypage/actions.ts` (Server Action)
- `supabase.from('posts').update({ is_public: !currentValue }).eq('id', id).eq('user_id', userId)`
- `revalidatePath()` (Next.js)

**구현 내용**:
- [ ] 인증 확인
- [ ] 작성자 확인
- [ ] 현재 `is_public` 값 조회
- [ ] 반대 값으로 UPDATE
- [ ] `revalidatePath('/mypage')` 호출
- [ ] 성공 응답 반환

**상태 관리**:
- 클라이언트: 낙관적 업데이트 (즉시 UI 반영)
- 서버: 없음

**UI 바인딩**:
- `app/mypage/page.tsx` - 공개/비공개 토글 버튼
- `components/ui/button.tsx` - Globe/Lock 아이콘 표시

---

### 2.9 AI 보조 기능 호출 및 결과 저장 (API Route + Server Action)

**데이터 흐름**: 레시피 저장 후 → AI API 호출 → 결과 파싱 → `posts` UPDATE (ai_summary, ai_keywords, troubleshooting_notes)

**기술 스택**:
- `app/api/ai/route.ts` (API Route)
- `app/recipes/create/actions.ts` 또는 백그라운드 작업
- 외부 AI API (OpenAI, Anthropic 등)
- `supabase.from('posts').update().eq('id', postId)`

**구현 내용**:
- [ ] 레시피 저장 후 비동기로 AI API 호출 (사용자 블로킹 없음)
- [ ] AI API에 troubleshooting 텍스트, steps, title, category 전달
- [ ] AI 응답 파싱 (summary, keywords, notes)
- [ ] `posts` 테이블 UPDATE (ai_summary, ai_keywords, troubleshooting_notes)
- [ ] 에러 처리 (AI 실패해도 레시피는 저장됨)

**상태 관리**:
- 클라이언트: 없음 (백그라운드 작업)
- 서버: 없음

**UI 바인딩**:
- `components/domain/recipe/troubleshooting-section.tsx` - AI 결과 표시 (있으면)

---

### 2.10 북마크한 레시피 목록 페칭 (서버)

**데이터 흐름**: 인증 확인 → `bookmarks` 조회 → `posts` 조인 → `profiles` 조인 (작성자) → UI 바인딩

**기술 스택**:
- `app/mypage/page.tsx` (Server Component)
- `supabase.from('bookmarks').select('..., posts(..., categories(*), profiles!posts_user_id_fkey(display_name))').eq('user_id', userId)`
- `redirect()` (Next.js)

**구현 내용**:
- [ ] 인증 확인
- [ ] `bookmarks` 테이블에서 `user_id = auth.uid()` 조회
- [ ] `posts` 테이블 조인 (중첩 쿼리)
- [ ] `categories`, `profiles` 조인
- [ ] 타입 변환 (중첩 구조 평탄화)
- [ ] 빈 배열 처리

**상태 관리**: 없음 (서버 사이드 페칭)

**UI 바인딩**:
- `app/mypage/page.tsx` - "Bookmarked Recipes" 섹션
- `components/domain/recipe/recipe-list.tsx` - 북마크 목록 렌더링

---

### 2.11 북마크 추가/삭제 (Server Action)

**데이터 흐름**: 북마크 버튼 클릭 → Server Action → 인증 확인 → `bookmarks` INSERT/DELETE → 상태 반영

**기술 스택**:
- `app/recipes/[id]/actions.ts` 또는 `components/domain/recipe/bookmark-button.tsx` (Server Action)
- `supabase.from('bookmarks').insert({ user_id, post_id })`
- `supabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId)`
- `revalidatePath()` (Next.js)

**구현 내용**:
- [ ] 인증 확인 (비로그인 시 로그인 페이지로 리다이렉트)
- [ ] 현재 북마크 상태 확인 (`bookmarks` 테이블 조회)
- [ ] 있으면 DELETE, 없으면 INSERT
- [ ] `ON CONFLICT DO NOTHING` 또는 중복 체크
- [ ] `revalidatePath('/mypage')` 호출
- [ ] 성공 응답 반환

**상태 관리**:
- 클라이언트: 낙관적 업데이트 (즉시 UI 반영)
- 서버: 없음

**UI 바인딩**:
- `components/domain/recipe/bookmark-button.tsx` - 북마크 버튼 (filled/outline 아이콘)
- `components/domain/recipe/recipe-card.tsx` - 북마크 버튼 표시

---

## Phase 3: Interaction & Feedback

**목표**: 상태 변경, 알림, 에러 핸들링 등 사용자 경험 개선

---

### 3.1 로딩 상태 관리 (클라이언트)

**데이터 흐름**: 데이터 페칭 시작 → `loading = true` → 페칭 완료 → `loading = false` → UI 업데이트

**기술 스택**:
- React `useState`
- `hooks/use-recipes.ts` (클라이언트 사이드 페칭 시)
- Suspense (서버 컴포넌트)

**구현 내용**:
- [ ] 클라이언트 사이드 페칭 훅에 `loading` 상태 추가
- [ ] 서버 컴포넌트는 Next.js Suspense 활용
- [ ] 로딩 인디케이터 컴포넌트 생성
- [ ] 스켈레톤 UI 적용 (선택사항)

**상태 관리**:
- `loading: boolean` - 페칭 중 여부

**UI 바인딩**:
- `components/ui/skeleton.tsx` - 스켈레톤 로더
- 각 페이지/컴포넌트에 로딩 상태 표시

---

### 3.2 에러 상태 관리 및 표시

**데이터 흐름**: 에러 발생 → 에러 상태 저장 → 에러 UI 표시 → 사용자 액션 (재시도 등)

**기술 스택**:
- React `useState`
- `try-catch` 블록
- `components/ui/alert.tsx` 또는 Toast

**구현 내용**:
- [ ] 각 데이터 페칭 함수에 `try-catch` 추가
- [ ] 에러 상태 저장 (`error: Error | null`)
- [ ] 에러 메시지 사용자 친화적으로 변환
- [ ] 에러 UI 컴포넌트 표시
- [ ] 재시도 버튼 제공 (선택사항)

**상태 관리**:
- `error: Error | null` - 에러 객체

**UI 바인딩**:
- `components/ui/alert.tsx` - 에러 알림
- 각 페이지에 에러 상태 표시

---

### 3.3 폼 유효성 검사 (클라이언트)

**데이터 흐름**: 입력 값 변경 → 유효성 검사 → 에러 메시지 표시 → 제출 가능 여부 결정

**기술 스택**:
- React `useState`
- `components/domain/recipe/recipe-form.tsx`
- HTML5 validation 또는 커스텀 검사

**구현 내용**:
- [ ] 필수 필드 검증 (title, description, category, steps)
- [ ] 태그 형식 검증 (콤마 구분)
- [ ] Steps 최소 개수 검증 (최소 1개)
- [ ] 실시간 에러 메시지 표시
- [ ] 제출 버튼 비활성화 (유효하지 않을 때)

**상태 관리**:
- `errors: Record<string, string>` - 필드별 에러 메시지
- `isValid: boolean` - 폼 유효성

**UI 바인딩**:
- `components/domain/recipe/recipe-form.tsx` - 각 필드에 에러 표시
- `components/ui/button.tsx` - 제출 버튼 disabled 상태

---

### 3.4 낙관적 업데이트 (Optimistic Update)

**데이터 흐름**: 액션 트리거 → 즉시 UI 업데이트 → 서버 요청 → 성공/실패에 따라 롤백 또는 유지

**기술 스택**:
- React `useState`, `useTransition`
- Server Action
- `useOptimistic` (React 19, 선택사항)

**구현 내용**:
- [ ] 북마크 토글 시 즉시 UI 반영
- [ ] 공개/비공개 토글 시 즉시 UI 반영
- [ ] 서버 요청 실패 시 이전 상태로 롤백
- [ ] 성공 시 상태 유지

**상태 관리**:
- 각 기능별 로컬 상태 (북마크, 공개/비공개 등)

**UI 바인딩**:
- `components/domain/recipe/bookmark-button.tsx` - 북마크 아이콘 즉시 변경
- `app/mypage/page.tsx` - 공개/비공개 아이콘 즉시 변경

---

### 3.5 성공 피드백 (Toast 알림)

**데이터 흐름**: 액션 성공 → Toast 알림 표시 → 자동 사라짐

**기술 스택**:
- `sonner` 또는 `react-hot-toast`
- Server Action 성공 응답

**구현 내용**:
- [ ] Toast 라이브러리 설치 및 설정
- [ ] 레시피 생성 성공 시 알림
- [ ] 레시피 수정 성공 시 알림
- [ ] 레시피 삭제 성공 시 알림
- [ ] 북마크 추가/삭제 성공 시 알림

**상태 관리**: 없음 (Toast 라이브러리 내부 관리)

**UI 바인딩**:
- `app/layout.tsx` - Toast Provider
- 각 Server Action 호출 후 Toast 표시

---

### 3.6 이미지 업로드 진행 상태 표시

**데이터 흐름**: 파일 선택 → 업로드 시작 → 진행률 표시 → 완료

**기술 스택**:
- `supabase.storage.from().upload()`
- React `useState`
- Progress 이벤트 (선택사항)

**구현 내용**:
- [ ] 파일 선택 시 미리보기 표시
- [ ] 업로드 중 진행률 표시 (가능한 경우)
- [ ] 업로드 완료 시 체크 표시
- [ ] 업로드 실패 시 에러 메시지

**상태 관리**:
- `uploading: boolean` - 업로드 중 여부
- `uploadProgress: number` - 진행률 (0-100)

**UI 바인딩**:
- `components/domain/recipe/step-editor.tsx` - 이미지 업로드 UI
- `components/ui/progress.tsx` - 진행률 바 (선택사항)

---

### 3.7 검색 기능 (제목 기반)

**데이터 흐름**: 검색어 입력 → URL 파라미터 업데이트 → 서버에서 `posts.title ILIKE` 쿼리 → 결과 표시

**기술 스택**:
- `app/page.tsx` (Server Component)
- `supabase.from('posts').select().ilike('title', `%${query}%`)`
- URL Search Params
- `components/domain/recipe/search-bar.tsx` (Client Component)

**구현 내용**:
- [ ] 검색 입력 컴포넌트 생성
- [ ] 검색어를 URL 파라미터로 전달 (`?search=...`)
- [ ] 서버에서 `ILIKE` 쿼리 실행
- [ ] 검색 결과 필터링
- [ ] 빈 검색어 처리 (전체 목록 표시)

**상태 관리**:
- 클라이언트: 검색어 입력 상태
- 서버: 없음 (URL 파라미터 기반)

**UI 바인딩**:
- `components/domain/recipe/search-bar.tsx` - 검색 입력 필드
- `app/page.tsx` - 검색 결과 표시

---

### 3.8 태그 필터링 (다중 선택)

**데이터 흐름**: 태그 선택 → URL 파라미터 업데이트 → 서버에서 `posts.tags @> ARRAY[...]` 쿼리 → 결과 표시

**기술 스택**:
- `app/page.tsx` (Server Component)
- `supabase.from('posts').select().contains('tags', selectedTags)`
- URL Search Params
- `components/domain/recipe/tag-filter.tsx` (Client Component)

**구현 내용**:
- [ ] 태그 필터 컴포넌트에서 다중 선택 지원
- [ ] 선택된 태그를 URL 파라미터로 전달 (`?tags=tag1,tag2`)
- [ ] 서버에서 PostgreSQL 배열 포함 연산자 사용
- [ ] 모든 선택된 태그가 포함된 레시피만 필터링
- [ ] 태그 제거 시 필터 해제

**상태 관리**:
- 클라이언트: 선택된 태그 배열
- 서버: 없음 (URL 파라미터 기반)

**UI 바인딩**:
- `components/domain/recipe/tag-filter.tsx` - 태그 필터 UI (이미 존재)
- `app/page.tsx` - 필터링된 결과 표시

---

### 3.9 무한 스크롤 또는 페이지네이션 (선택사항)

**데이터 흐름**: 스크롤 하단 도달 → 다음 페이지 데이터 페칭 → 기존 목록에 추가

**기술 스택**:
- `useInfiniteQuery` (React Query, 선택사항) 또는 커스텀 훅
- `supabase.from('posts').select().range(start, end)`
- Intersection Observer API

**구현 내용**:
- [ ] 페이지 크기 설정 (예: 20개)
- [ ] 스크롤 하단 감지
- [ ] 다음 페이지 데이터 페칭
- [ ] 기존 목록에 추가
- [ ] 로딩 상태 표시
- [ ] 더 이상 데이터 없음 표시

**상태 관리**:
- `page: number` - 현재 페이지
- `hasMore: boolean` - 더 있는지 여부
- `items: Post[]` - 누적된 아이템 목록

**UI 바인딩**:
- `components/domain/recipe/recipe-list.tsx` - 무한 스크롤 트리거
- 로딩 인디케이터

---

### 3.10 프로필 정보 표시 및 업데이트

**데이터 흐름**: 인증 확인 → `profiles` 조회 → UI 표시 → 수정 시 UPDATE

**기술 스택**:
- `app/mypage/page.tsx` 또는 별도 프로필 페이지
- `supabase.from('profiles').select().eq('id', userId).single()`
- `supabase.from('profiles').update().eq('id', userId)`
- Server Action

**구현 내용**:
- [ ] 프로필 정보 조회 (display_name, avatar_url)
- [ ] 프로필 이미지 표시 (없으면 기본 아바타)
- [ ] 프로필 수정 폼 (선택사항)
- [ ] `display_name`, `avatar_url` 업데이트
- [ ] `updated_at` 자동 갱신

**상태 관리**:
- 클라이언트: 프로필 폼 상태 (수정 시)
- 서버: 없음

**UI 바인딩**:
- `components/domain/auth/user-menu.tsx` - 프로필 정보 표시
- `app/mypage/page.tsx` - 프로필 섹션 (선택사항)

---

## 구현 우선순위 요약

### Phase 1 (필수 인프라)
1. Supabase 클라이언트 설정 (1.1, 1.2)
2. 인증 상태 관리 (1.3)
3. Google OAuth 로그인 (1.4)
4. 로그아웃 (1.5)
5. 카테고리 목록 페칭 (1.6)
6. 미들웨어 설정 (1.7)

### Phase 2 (핵심 기능)
1. 레시피 목록 페칭 (2.1)
2. 레시피 상세 페칭 (2.2)
3. 레시피 작성 (2.3)
4. 내 레시피 목록 (2.4)
5. 레시피 수정 (2.5, 2.6)
6. 레시피 삭제 (2.7)
7. 공개/비공개 토글 (2.8)
8. AI 보조 기능 (2.9)
9. 북마크 기능 (2.10, 2.11)

### Phase 3 (UX 개선)
1. 로딩/에러 상태 (3.1, 3.2)
2. 폼 유효성 검사 (3.3)
3. 낙관적 업데이트 (3.4)
4. 성공 피드백 (3.5)
5. 이미지 업로드 진행 상태 (3.6)
6. 검색/태그 필터링 (3.7, 3.8)
7. 프로필 관리 (3.10)

---

## 체크리스트 사용법

각 항목의 체크박스를 하나씩 완료하며 진행하세요:

1. **구현 완료** → 체크박스 체크
2. **테스트 완료** → 해당 기능 동작 확인
3. **다음 항목으로 진행** → 순서대로 진행

---

## 구현 체크리스트

아래 체크리스트를 복사하여 진행 상황을 추적하세요. `[ ]` → `[x]` 로 변경하며 완료 표시합니다.

### Phase 1: Foundation

| # | 항목 | 구현 | 테스트 | 관련 파일 |
|---|------|:----:|:------:|-----------|
| 1.1 | Supabase 클라이언트 (클라이언트) | [x] | [ ] | `lib/supabase/client.ts` |
| 1.2 | Supabase 클라이언트 (서버) | [x] | [ ] | `lib/supabase/server.ts` |
| 1.3 | 인증 상태 페칭 및 관리 | [x] | [ ] | `hooks/use-auth.ts` |
| 1.4 | Google OAuth 로그인 플로우 | [x] | [ ] | `app/(auth)/login/page.tsx`, `app/(auth)/callback/page.tsx` |
| 1.5 | 로그아웃 플로우 | [x] | [ ] | `hooks/use-auth.ts`, `components/domain/auth/user-menu.tsx` |
| 1.6 | 카테고리 목록 데이터 페칭 | [x] | [ ] | `app/page.tsx` |
| 1.7 | 미들웨어 설정 | [x] | [ ] | `middleware.ts` |

**Phase 1 완료율**: 7 / 7 (구현 완료)

---

### Phase 2: Core Logic

| # | 항목 | 구현 | 테스트 | 관련 파일 |
|---|------|:----:|:------:|-----------|
| 2.1 | 공개 레시피 목록 페칭 | [x] | [ ] | `app/page.tsx` |
| 2.2 | 레시피 상세 데이터 페칭 | [x] | [ ] | `app/recipes/[id]/page.tsx` |
| 2.3 | 레시피 작성 폼 제출 | [x] | [ ] | `app/recipes/create/actions.ts`, `app/recipes/create/page.tsx` |
| 2.4 | 내가 작성한 레시피 목록 페칭 | [x] | [ ] | `app/mypage/page.tsx` |
| 2.5 | 레시피 수정 데이터 로드 | [x] | [ ] | `app/recipes/[id]/edit/page.tsx` |
| 2.6 | 레시피 수정 데이터 제출 | [x] | [ ] | `app/recipes/[id]/edit/actions.ts` |
| 2.7 | 레시피 삭제 | [x] | [ ] | `app/mypage/actions.ts` |
| 2.8 | 공개/비공개 토글 | [x] | [ ] | `app/mypage/actions.ts`, `app/mypage/page.tsx` |
| 2.9 | AI 보조 기능 호출 및 결과 저장 | [ ] | [ ] | `app/api/ai/route.ts`, `app/recipes/create/actions.ts` (제외) |
| 2.10 | 북마크한 레시피 목록 페칭 | [x] | [ ] | `app/mypage/page.tsx` |
| 2.11 | 북마크 추가/삭제 | [x] | [ ] | `app/recipes/[id]/actions.ts`, `components/domain/recipe/bookmark-button.tsx` |

**Phase 2 완료율**: 10 / 11 (AI 보조 기능 제외)

---

### Phase 3: Interaction & Feedback

| # | 항목 | 구현 | 테스트 | 관련 파일 |
|---|------|:----:|:------:|-----------|
| 3.1 | 로딩 상태 관리 | [ ] | [ ] | `hooks/use-recipes.ts`, Suspense |
| 3.2 | 에러 상태 관리 및 표시 | [ ] | [ ] | 각 페이지, `components/ui/alert.tsx` |
| 3.3 | 폼 유효성 검사 | [ ] | [ ] | `components/domain/recipe/recipe-form.tsx` |
| 3.4 | 낙관적 업데이트 | [ ] | [ ] | 북마크/공개토글 관련 컴포넌트 |
| 3.5 | 성공 피드백 (Toast) | [x] | [ ] | `app/layout.tsx`, Server Action 호출부 |
| 3.6 | 이미지 업로드 진행 상태 | [ ] | [ ] | `components/domain/recipe/step-editor.tsx` |
| 3.7 | 검색 기능 (제목 기반) | [ ] | [ ] | `app/page.tsx`, 검색 컴포넌트 |
| 3.8 | 태그 필터링 (다중 선택) | [ ] | [ ] | `app/page.tsx`, `components/domain/recipe/tag-filter.tsx` |
| 3.9 | 무한 스크롤/페이지네이션 (선택) | [ ] | [ ] | `components/domain/recipe/recipe-list.tsx` |
| 3.10 | 프로필 정보 표시 및 업데이트 | [ ] | [ ] | `components/domain/auth/user-menu.tsx`, `app/mypage/page.tsx` |

**Phase 3 완료율**: 1 / 10

---

### 전체 진행률

| Phase | 완료 | 전체 | 비율 |
|-------|-----:|-----:|------|
| Phase 1 | 7 | 7 | 100% |
| Phase 2 | 10 | 11 | 91% (AI 제외) |
| Phase 3 | 1 | 10 | 10% |
| **합계** | **18** | **28** | **64%** |

---

### 상세 구현 체크리스트 (복사용)

아래는 각 항목별 **구현 내용**을 한 줄씩 나열한 체크리스트입니다. 세부 작업 단위로 진행할 때 사용하세요.

#### 1.1 Supabase 클라이언트 (클라이언트)
- [x] 패키지 설치 (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] `createBrowserClient` 구현
- [x] `Database` 타입 제네릭 적용
- [x] 환경 변수 검증

#### 1.2 Supabase 클라이언트 (서버)
- [x] `createServerClient` 구현
- [x] 쿠키 기반 세션 관리
- [x] `Database` 타입 제네릭 적용
- [x] async 함수로 구현

#### 1.3 인증 상태 페칭 및 관리
- [x] `useAuth` 훅 구현
- [x] `getUser()` 초기 페칭
- [x] `onAuthStateChange()` 구독
- [x] `user`, `loading` 반환
- [x] 구독 해제 (cleanup)

#### 1.4 Google OAuth 로그인
- [x] `signInWithGoogle()` 함수 추가
- [x] 로그인 버튼 핸들러 연결
- [x] `redirectTo` 설정
- [x] 콜백에서 `code` 추출
- [x] `exchangeCodeForSession()` 호출
- [x] 성공/실패 리다이렉트 처리

#### 1.5 로그아웃
- [x] `signOut()` 함수 추가
- [x] UserMenu 로그아웃 버튼 연결
- [x] 로그아웃 후 홈 리다이렉트

#### 1.6 카테고리 목록 페칭
- [x] Server Component에서 `categories` 조회
- [x] `sort_order` 정렬
- [x] CategoryTabs에 데이터 전달

#### 1.7 미들웨어
- [x] `middleware.ts` 생성
- [x] Supabase 클라이언트 생성 및 `getUser()` 호출
- [x] 쿠키 동기화
- [x] matcher 설정

#### 2.1 공개 레시피 목록 페칭
- [x] `posts` + `categories` 조인 조회
- [x] `is_public = true` 필터
- [x] URL 파라미터 기반 카테고리/정렬
- [x] RecipeList에 데이터 전달
- [x] 북마크 상태 조회 및 전달 (로그인한 사용자)

#### 2.2 레시피 상세 페칭
- [x] `posts` 단건 조회 (categories, profiles 조인)
- [x] `post_steps` 조회 및 정렬
- [x] `notFound()` 처리
- [x] RecipeDetail, StepCard, TroubleshootingSection 바인딩
- [x] Troubleshooting 섹션에 raw 필드 표시 (AI 요약 없어도 수동 작성 내용 표시)

#### 2.3 레시피 작성
- [x] Server Action 인증 확인
- [x] FormData 파싱
- [x] `posts` INSERT
- [x] `post_steps` INSERT (반복)
- [x] Storage 이미지 업로드
- [x] `revalidatePath` 호출

#### 2.4 내 레시피 목록
- [x] 인증 확인 및 리다이렉트
- [x] `posts` where `user_id = auth.uid()` 조회
- [x] categories 조인
- [x] My Recipes 섹션 바인딩

#### 2.5 레시피 수정 로드
- [x] edit 페이지 인증/작성자 확인
- [x] `posts` + `post_steps` 조회
- [x] RecipeForm에 initialData 전달

#### 2.6 레시피 수정 제출
- [x] Server Action 작성자 확인
- [x] `posts` UPDATE
- [x] 기존 `post_steps` DELETE 후 재INSERT
- [x] 이미지 업로드 처리
- [x] `revalidatePath` 호출

#### 2.7 레시피 삭제
- [x] Server Action 작성자 확인
- [x] `posts` DELETE
- [x] `revalidatePath` 호출
- [x] 마이페이지 삭제 버튼/다이얼로그 연동

#### 2.8 공개/비공개 토글
- [x] Server Action 작성자 확인
- [x] `posts.is_public` UPDATE
- [x] `revalidatePath` 호출
- [x] 마이페이지 토글 버튼 연동

#### 2.9 AI 보조 기능
- [ ] AI API Route 구현 (이번 작업 범위에서 제외)
- [ ] 레시피 저장 후 비동기 AI 호출 (이번 작업 범위에서 제외)
- [ ] `posts` UPDATE (ai_summary, ai_keywords, troubleshooting_notes) (이번 작업 범위에서 제외)
- [ ] 에러 처리 (실패해도 레시피 유지) (이번 작업 범위에서 제외)

#### 2.10 북마크 목록 페칭
- [x] `bookmarks` + `posts` + `categories` + `profiles` 조인 조회
- [x] Bookmarked Recipes 섹션 바인딩

#### 2.11 북마크 추가/삭제
- [x] Server Action 인증 확인
- [x] `bookmarks` INSERT/DELETE
- [x] BookmarkButton 연동
- [x] `revalidatePath` 호출
- [x] 메인 페이지 레시피 카드에서도 북마크 상태 표시 및 토글 가능

#### 3.1 로딩 상태
- [ ] 페칭 훅에 `loading` 상태 추가
- [ ] Suspense 또는 스켈레톤 UI 적용

#### 3.2 에러 상태
- [ ] try-catch 및 에러 상태 저장
- [ ] 에러 UI 표시 및 재시도 옵션

#### 3.3 폼 유효성
- [ ] 필수 필드/형식 검증
- [ ] 필드별 에러 메시지 표시
- [ ] 제출 버튼 disabled 처리

#### 3.4 낙관적 업데이트
- [ ] 북마크 토글 즉시 UI 반영
- [ ] 공개/비공개 토글 즉시 UI 반영
- [ ] 실패 시 롤백

#### 3.5 성공 피드백
- [x] Toast 라이브러리 설정 (sonner)
- [x] 생성/수정/삭제/북마크 성공 시 Toast 표시
- [x] 비로그인 시 로그인 안내 Toast 표시

#### 3.6 이미지 업로드 진행
- [ ] 업로드 중 상태 표시
- [ ] 진행률 또는 로딩 인디케이터

#### 3.7 검색 기능
- [ ] 검색 입력 컴포넌트
- [ ] URL 파라미터 연동
- [ ] `posts.title ILIKE` 쿼리

#### 3.8 태그 필터링
- [ ] 태그 다중 선택 UI
- [ ] URL 파라미터 연동
- [ ] `posts.tags` 포함 쿼리

#### 3.9 무한 스크롤 (선택)
- [ ] 페이지 크기 및 range 쿼리
- [ ] 스크롤 하단 감지
- [ ] 누적 목록 상태 관리

#### 3.10 프로필 표시/업데이트
- [ ] `profiles` 조회 및 표시
- [ ] 프로필 수정 폼 및 UPDATE (선택)

---

**마지막 업데이트**: 2025-01-29

**최근 업데이트 내용**:
- 3.5 성공 피드백 (Toast) 구현 완료
- 2.1 공개 레시피 목록에 북마크 상태 포함
- 2.2 Troubleshooting 섹션에 raw 필드 표시 개선
- 2.11 메인 페이지 레시피 카드에서 북마크 토글 기능 추가
