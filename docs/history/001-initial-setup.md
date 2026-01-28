# 초기 환경 구축 이력

**작업 날짜:** 2026년 1월 28일  
**작업자:** 시니어 개발자 & AI 파트너 (Cursor)

---

## 1. 프로젝트 개요

### 프로젝트명
**envrecipe**

### 목적
envrecipe는 개발자, 대학생, 취업 준비생을 위한 개발 환경 설정 사례 공유 및 탐색 플랫폼이다.

개발 환경 설정 과정에서 발생하는 반복적인 오류와 시행착오를 개인 블로그, 노션, 메모 등 파편화된 정보가 아닌 구조화된 "레시피(Recipe)" 형태로 축적하고 공유하는 것을 목표로 한다.

### 핵심 가치

- **환경(OS, 도구, 버전)에 맞는 실제 성공 사례 제공**
  - 단일 정답이 아닌 다양한 설정 접근 방식 비교
  - 재현 가능한 Step-by-Step 설정 과정 제공
  - AI 요약을 통한 빠른 맥락 이해 지원

이를 통해 개발 환경 설정 과정에서의 시간 낭비와 진입 장벽을 줄이는 것이 envrecipe의 핵심 목표다.

---

## 2. 기술 스택 선정 이유 (Tech Stack)

### Framework

#### Next.js 16.1.6 (App Router)
- **선정 이유:**
  - App Router 기반으로 페이지 책임을 명확히 분리
  - Server Component 중심 설계로 초기 로딩 및 SEO 최적화
  - 문서/레시피 탐색 서비스에 적합한 구조
  - 파일 기반 라우팅으로 직관적인 페이지 관리
  - API Routes를 통한 서버 사이드 로직 처리

#### React 19.2.3
- **선정 이유:**
  - 최신 React 기능 활용
  - 서버 컴포넌트 지원
  - 향상된 성능 및 개발자 경험

#### TypeScript 5
- **선정 이유:**
  - 타입 안정성 보장
  - Supabase 타입 자동 생성 활용
  - 개발 시 오류 사전 방지

---

### Styling

#### Tailwind CSS 4
- **선정 이유:**
  - 빠른 UI 프로토타이핑 및 반복 개선
  - 컴포넌트 스타일 일관성 유지
  - 유틸리티 퍼스트 접근으로 빠른 개발
  - 반응형 디자인 지원
  - 다크 모드 지원 (Phase 2 확장 가능)

#### Lucide React (^0.454.0)
- **선정 이유:**
  - 가벼운 아이콘 사용으로 정보 중심 UI 구현
  - Tree-shaking 지원으로 번들 크기 최적화
  - React 컴포넌트로 제공되어 사용이 간편
  - 일관된 아이콘 디자인 시스템

#### shadcn/ui 패턴
- **선정 이유:**
  - 재사용 가능한 UI 컴포넌트 시스템
  - Radix UI 기반으로 접근성(A11y) 고려
  - Tailwind CSS와 완벽한 통합
  - 컴포넌트를 직접 소유하여 커스터마이징 용이

---

### Backend / Database

#### Supabase
- **선정 이유:**
  - Auth, Database, Storage를 하나의 플랫폼에서 관리
  - 서버리스 환경으로 MVP 구현 속도 향상
  - Recipe, Step, AI 결과 데이터 관리에 적합
  - PostgreSQL 기반의 강력한 관계형 데이터베이스
  - Row Level Security (RLS)를 통한 데이터 보안
  - Google OAuth 인증 지원
  - 이미지 파일 저장을 위한 Storage 기능

---

### Package Manager

#### pnpm
- **선정 이유:**
  - 빠른 의존성 설치
  - 디스크 공간 효율성 (symlink 기반)
  - 개발/실험 코드가 많은 프로젝트에 적합
  - 모노레포 지원 (향후 확장 가능)

---

### AI Tooling

#### Cursor
- **선정 이유:**
  - v0.dev 기반 UI 시안 이식
  - Vibe Coding 전략을 통한 빠른 반복 개발
  - `.cursor/rules`를 통한 PRD, Phase, 스타일 통제형 협업
  - AI와의 체계적인 협업을 통한 개발 속도 향상

---

## 3. 초기 환경 구축 내역

### Boilerplate 구성

#### Next.js App Router 기반 기본 구조 세팅
```
envrecipe/
├── app/                    # 라우팅 및 페이지
│   ├── (auth)/            # 인증 관련 라우트 그룹
│   ├── (dashboard)/       # 대시보드 라우트 그룹
│   ├── recipes/           # 레시피 관련 페이지
│   └── api/               # API Routes
├── components/            # 공용 UI 컴포넌트
│   ├── ui/                # 재사용 가능한 UI 컴포넌트
│   ├── common/            # 공통 컴포넌트 (Header, Footer)
│   └── domain/            # 도메인별 컴포넌트
│       ├── auth/          # 인증 관련
│       ├── recipe/        # 레시피 관련
│       └── ai/            # AI 관련
├── lib/                   # Supabase 클라이언트 및 유틸
│   ├── supabase/          # Supabase 클라이언트 (client, server, types)
│   ├── ai/                # AI 통합 로직
│   └── utils/             # 유틸리티 함수 (cn, format)
├── hooks/                 # 커스텀 훅
│   ├── use-auth.ts        # 인증 상태 관리
│   ├── use-recipes.ts     # 레시피 데이터 fetching
│   ├── use-recipe-form.ts # 레시피 폼 상태 관리
│   └── use-ai-assist.ts   # AI 보조 기능
└── types/                 # 공통 타입 정의
    ├── database.ts        # Supabase 자동 생성 타입
    ├── recipe.ts          # 레시피 도메인 타입
    ├── auth.ts            # 인증 관련 타입
    └── api.ts             # API 응답 타입
```

**역할 분리 중심 디렉토리 구성:**
- `app/`: 라우팅 및 페이지 컴포넌트
- `components/`: 재사용 가능한 UI 컴포넌트
- `lib/`: 비즈니스 로직 및 유틸리티
- `hooks/`: 상태 관리 및 데이터 페칭 로직
- `types/`: 타입 정의

---

### Design Assets

#### v0.dev를 활용한 초기 UI 설계
- **메인 페이지 (Recipe List)**: 카테고리 탭, 정렬 드롭다운, 레시피 카드 리스트
- **레시피 상세 페이지**: Step-by-Step 가이드, AI 요약 섹션
- **레시피 작성 페이지**: 폼 기반 입력, Step 배열 관리, 이미지 업로드
- **로그인 페이지**: Google OAuth 연동 UI
- **마이페이지**: 내가 작성한 레시피, 북마크한 레시피 (Phase 2)

**실제 구현 시 참고용 디자인 자산으로 활용:**
- `tmp-v0/` 폴더에 백업용 소스 코드 보관
- UI 컴포넌트 및 스타일 참고용으로 활용
- 빌드 및 기능 개발에서는 제외 (tsconfig.json, eslint.config.mjs에서 제외 설정)

---

### Project Rules

#### `.cursor/rules/*` 설정을 통해 AI 협업 규칙 수립

**규칙 파일 구조:**
```
.cursor/rules/
├── 01_prd_and_flow.mdc      # PRD 및 사용자 흐름 준수 규칙
├── 02_style_and_ui.mdc      # 스타일 및 UX 일관성 규칙
├── 03_cursor_standards.mdc  # Cursor 행동 원칙 및 Phase 구분
├── 04_project_structure.mdc # 프로젝트 구조 및 제외 규칙
└── 05_history_logging.mdc   # 히스토리 로깅 규칙
```

**주요 규칙 내용:**
- **Phase 1 / Phase 2 기능 범위 엄격 분리**
  - Phase 1: 기본 CRUD, 단일 이미지 업로드, 텍스트 기반 Step 편집, AI 요약 (1회 호출)
  - Phase 2: 다중 이미지, Drag & Drop, 고급 에디터, 검색/필터링 고도화, 북마크/공감 기능
- **PRD 및 사용자 흐름 준수 강제**
  - 로그인 → 레시피 작성 → 카테고리 탐색 → 정렬된 리스트 확인 → 상세 확인 → AI 보조 결과 확인
- **스타일 및 UX 일관성 유지**
  - 단순하고 정보 중심적인 UI
  - "개발자 문서"에 가까운 톤
  - 불필요한 애니메이션 배제

---

## 4. 주요 문서화 현황

### `docs/PRD.md`
→ envrecipe 서비스의 제품 요구사항 정의서
- **내용:**
  - 서비스 비전 및 목표
  - Phase 1 / Phase 2 기능 범위 분리
  - 인증 및 유저 관리 (Google OAuth)
  - 환경 설정 레시피 관리 (Recipe CRUD)
  - AI 보조 기능 (트러블슈팅 요약, 키워드 추출)
  - 성공 기준 및 제약사항
- **역할:** 모든 개발 결정의 기준이 되는 최우선 문서

---

### `docs/FLOW.md`
→ 사용자 흐름 및 데이터 흐름 문서
- **내용:**
  - 서비스 아키텍처 및 페이지 구조 (Mermaid 다이어그램)
  - 사용자 여정 및 로직 흐름 (Sequence 다이어그램)
  - 로그인 → 레시피 작성/탐색 → AI 보조 흐름 정리
  - Supabase (Auth, DB, Storage) 연동 흐름
- **역할:** UI/UX 설계 및 개발 시 필수 참고 문서

---

### `docs/tech-stack.md`
→ 기술 스택 상세 명세서
- **내용:**
  - 핵심 기술 스택 (Framework, Styling, Backend, AI)
  - 프로젝트 구조 원칙 (App Router, 컴포넌트 아키텍처)
  - 컴포넌트 설계 원칙
  - 개발 워크플로우
  - Phase 1 vs Phase 2 비교
  - 성능 최적화 및 보안 고려사항
- **역할:** 기술적 의사결정 및 아키텍처 참고 문서

---

### `docs/history/`
→ 프로젝트 개발 이력 문서
- **`001-initial-setup.md`**: 초기 환경 구축 이력 (본 문서)
- **`002-ui-migration-and-dependencies.md`**: UI 마이그레이션 및 의존성 추가 이력
- **역할:** 프로젝트 진행 과정 기록 및 향후 참고용

---

### `docs/db-schema.md`
→ 데이터베이스 스키마 문서
- **내용:**
  - Supabase PostgreSQL 테이블 구조
  - Recipe, Step, User, AI_Summary 등 테이블 정의
  - 관계 및 제약조건
- **역할:** 데이터 모델링 및 쿼리 작성 시 참고 문서

---

## 5. 초기 설정 완료 사항

### ✅ 완료된 작업
1. Next.js 16.1.6 프로젝트 초기화
2. TypeScript 설정 완료
3. Tailwind CSS 4 설정 완료
4. 기본 디렉토리 구조 생성
5. `.cursor/rules/` 규칙 파일 생성
6. 주요 문서 작성 (PRD, FLOW, tech-stack)
7. `tmp-v0` 백업 소스 보관 (빌드에서 제외 설정)

### 🔄 진행 중인 작업
1. UI 컴포넌트 마이그레이션 (tmp-v0 → 현재 프로젝트)
2. Supabase 연동 준비
3. 인증 시스템 구현

### 📋 향후 작업
1. Supabase 프로젝트 생성 및 스키마 설정
2. 인증 시스템 구현 (Google OAuth)
3. Recipe CRUD 기능 구현
4. AI 보조 기능 연동
5. 이미지 업로드 기능 구현

---

## 6. 참고 사항

### 프로젝트 규칙 준수
- 모든 개발 작업은 `.cursor/rules/`의 규칙을 엄격히 준수해야 함
- PRD에 명시되지 않은 기능은 Phase 2로 분류
- 사용자 흐름(FLOW)을 벗어나는 구현 금지

### tmp-v0 폴더 처리
- `tmp-v0/` 폴더는 백업용 소스로만 사용
- 빌드 및 기능 개발에서 완전히 제외됨
- 참고용으로만 활용하며, 직접 import 금지

### 개발 원칙
- Server Component 우선 설계
- 클라이언트 컴포넌트는 필요한 경우에만 사용 (`'use client'`)
- 타입 안정성 최우선
- 단순함과 명확성 추구

---

**작성일:** 2026년 1월 28일  
**작성자:** 시니어 개발자 & AI 파트너 (Cursor)
