# 기술 명세서 (Tech Stack)

## 1. 핵심 기술 스택

### 1.1 프레임워크 및 런타임
- **Next.js 15** (App Router)
  - 서버 컴포넌트 우선 아키텍처
  - Server Actions 및 API Routes 활용
  - 파일 기반 라우팅 시스템

- **React 19**
  - 최신 React 기능 활용
  - 서버 컴포넌트 지원

- **TypeScript 5**
  - 타입 안정성 보장
  - Supabase 타입 자동 생성 활용

### 1.2 스타일링
- **Tailwind CSS 4**
  - 유틸리티 퍼스트 CSS 프레임워크
  - 반응형 디자인 지원
  - 다크 모드 지원 (Phase 2 확장 가능)

- **shadcn/ui**
  - 재사용 가능한 UI 컴포넌트 라이브러리
  - Tailwind CSS 기반
  - 접근성(A11y) 고려된 컴포넌트

- **Lucide React**
  - 아이콘 라이브러리
  - 일관된 아이콘 디자인 시스템

### 1.3 백엔드 및 데이터베이스
- **Supabase**
  - **Auth**: Google OAuth 인증
  - **PostgreSQL**: 관계형 데이터베이스
  - **Storage**: 이미지 파일 저장
  - **RLS (Row Level Security)**: 데이터 보안 정책

### 1.4 AI 통합
- **AI API** (Phase 1: Mock 또는 실제 API)
  - 트러블슈팅 요약
  - 키워드 추출
  - 향후 확장 가능한 구조

---

## 2. 프로젝트 구조 원칙

### 2.1 App Router 구조
```
app/
├── (auth)/          # 인증 관련 라우트 그룹
├── (dashboard)/     # 대시보드 라우트 그룹
├── recipes/         # 레시피 관련 페이지
└── api/             # API Routes
```

**설계 원칙:**
- 라우트 그룹 `()`을 활용한 논리적 그룹화
- 동적 라우트 `[id]`를 통한 상세 페이지 처리
- 서버 컴포넌트 우선, 클라이언트 컴포넌트는 `'use client'` 명시

### 2.2 컴포넌트 아키텍처

#### 2.2.1 UI 컴포넌트 (`components/ui/`)
- **역할**: 재사용 가능한 범용 UI 컴포넌트
- **특징**:
  - shadcn/ui 기반
  - 비즈니스 로직 없음
  - Props 기반 커스터마이징
- **예시**: `Button`, `Input`, `Card`, `Select`

#### 2.2.2 도메인 컴포넌트 (`components/domain/`)
- **역할**: 비즈니스 로직이 포함된 도메인별 컴포넌트
- **구조**:
  ```
  components/domain/
  ├── auth/          # 인증 관련
  ├── recipe/        # 레시피 관련
  └── ai/            # AI 관련
  ```
- **특징**:
  - 도메인별 폴더 분리로 응집도 향상
  - 커스텀 훅과 함께 사용
  - 재사용 가능하지만 도메인 특화

### 2.3 라이브러리 및 유틸리티

#### 2.3.1 Supabase 클라이언트
- **`lib/supabase/client.ts`**: 클라이언트 사이드 (브라우저)
- **`lib/supabase/server.ts`**: 서버 사이드 (Server Components, API Routes)
- **`lib/supabase/types.ts`**: 자동 생성된 DB 타입

#### 2.3.2 유틸리티 함수
- **`lib/utils/cn.ts`**: className 병합 유틸 (clsx + tailwind-merge)
- **`lib/utils/format.ts`**: 날짜, 텍스트 포맷팅

#### 2.3.3 AI 통합
- **`lib/ai/assistant.ts`**: AI API 호출 로직
  - 트러블슈팅 요약
  - 키워드 추출
  - 에러 처리

### 2.4 커스텀 훅 (`hooks/`)
- **`use-auth.ts`**: 인증 상태 관리
- **`use-recipes.ts`**: 레시피 데이터 fetching
- **`use-recipe-form.ts`**: 레시피 폼 상태 관리
- **`use-ai-assist.ts`**: AI 보조 기능

**설계 원칙:**
- 로직과 UI 분리
- 재사용성 극대화
- 타입 안정성 보장

### 2.5 타입 정의 (`types/`)
- **`database.ts`**: Supabase 자동 생성 타입
- **`recipe.ts`**: 레시피 도메인 타입
- **`auth.ts`**: 인증 관련 타입
- **`api.ts`**: API 응답 타입

---

## 3. 컴포넌트 설계 원칙

### 3.1 컴포넌트 분리 전략
1. **UI 컴포넌트**: 순수한 프레젠테이션 컴포넌트
2. **도메인 컴포넌트**: 비즈니스 로직 포함
3. **페이지 컴포넌트**: 라우트별 페이지 구성

### 3.2 데이터 페칭 전략
- **서버 컴포넌트**: 초기 데이터 로딩
- **클라이언트 컴포넌트**: 인터랙티브 기능
- **Server Actions**: 폼 제출 및 데이터 변경

### 3.3 상태 관리
- **로컬 상태**: `useState`, `useReducer`
- **서버 상태**: React Query (Phase 2 고려) 또는 직접 fetching
- **전역 상태**: Context API (필요시)

### 3.4 에러 처리
- **에러 바운더리**: 페이지 레벨 에러 처리
- **Try-Catch**: API 호출 에러 처리
- **사용자 피드백**: Toast 알림 (Phase 2)

---

## 4. 개발 워크플로우

### 4.1 타입 생성
```bash
# Supabase 타입 자동 생성
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

### 4.2 컴포넌트 추가
1. **UI 컴포넌트**: shadcn/ui CLI 사용
   ```bash
   npx shadcn@latest add button
   ```
2. **도메인 컴포넌트**: 수동 생성 후 비즈니스 로직 구현

### 4.3 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_API_KEY=  # Phase 1: 선택사항
```

---

## 5. Phase 1 vs Phase 2

### Phase 1 (현재)
- 기본 CRUD 기능
- 단일 이미지 업로드
- 텍스트 기반 Step 편집
- AI 요약 (1회 호출)

### Phase 2 (향후)
- 다중 이미지 업로드
- Drag & Drop 정렬
- 고급 에디터
- 검색/필터링 고도화
- 북마크, 공감 기능
- React Query 도입 고려

---

## 6. 성능 최적화

### 6.1 이미지 최적화
- Next.js Image 컴포넌트 활용
- Supabase Storage CDN 활용

### 6.2 코드 스플리팅
- App Router 자동 코드 스플리팅
- 동적 import 활용 (필요시)

### 6.3 캐싱 전략
- 서버 컴포넌트 캐싱
- Supabase 쿼리 최적화

---

## 7. 보안 고려사항

### 7.1 인증
- Supabase Auth 활용
- RLS 정책으로 데이터 접근 제어

### 7.2 환경 변수
- 클라이언트/서버 분리
- 민감 정보 서버 사이드만 사용

### 7.3 입력 검증
- 클라이언트 사이드 검증
- 서버 사이드 검증 (Server Actions)

---

## 8. 참고 자료

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
