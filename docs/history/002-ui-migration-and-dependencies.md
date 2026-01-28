# UI 마이그레이션 및 의존성 추가 이력

**작업 날짜:** 2026년 1월 28일  
**작업자:** 시니어 개발자 & AI 파트너 (Cursor)

---

## 개요

`tmp-v0` 폴더의 UI 컴포넌트와 페이지 로직을 현재 프로젝트로 이식하면서 필요한 라이브러리들을 추가했습니다. shadcn/ui 패턴을 따르는 재사용 가능한 UI 컴포넌트 시스템을 구축하기 위한 작업이었습니다.

---

## 설치된 라이브러리 목록

### 1. Radix UI Primitives (접근성 기반 UI 컴포넌트)

#### `@radix-ui/react-alert-dialog` (^1.1.4)
- **목적:** 접근성 준수 다이얼로그 컴포넌트
- **사용처:** 마이페이지의 레시피 삭제 확인 다이얼로그
- **이유:** 키보드 네비게이션, 스크린 리더 지원 등 접근성 기능이 내장된 다이얼로그가 필요했음

#### `@radix-ui/react-label` (^2.1.1)
- **목적:** 접근성 준수 라벨 컴포넌트
- **사용처:** 레시피 작성 폼의 입력 필드 라벨
- **이유:** 폼 입력 필드와 라벨을 시맨틱하게 연결하기 위해 필요

#### `@radix-ui/react-select` (^2.1.4)
- **목적:** 접근성 준수 셀렉트 드롭다운 컴포넌트
- **사용처:** 메인 페이지의 정렬 드롭다운 (Latest first, Oldest first, Name A-Z)
- **이유:** 기본 HTML select보다 더 나은 커스터마이징과 접근성 제공

#### `@radix-ui/react-slot` (^1.1.1)
- **목적:** 컴포넌트 합성(Composition) 유틸리티
- **사용처:** Button, Card 등 재사용 가능한 UI 컴포넌트
- **이유:** shadcn/ui 패턴에서 컴포넌트의 props를 자식 요소로 전달하기 위해 필요

---

### 2. 스타일 유틸리티

#### `class-variance-authority` (^0.7.1)
- **목적:** 컴포넌트 variant 관리 라이브러리
- **사용처:** Button, Badge 컴포넌트의 variant (default, outline, ghost, destructive 등)
- **이유:** 타입 안전한 variant 시스템을 구축하여 일관된 스타일링 관리

#### `clsx` (^2.1.1)
- **목적:** 조건부 CSS 클래스명 조합 유틸리티
- **사용처:** 모든 UI 컴포넌트의 className 조건부 적용
- **이유:** 복잡한 조건부 스타일링을 깔끔하게 처리하기 위해 필요

#### `tailwind-merge` (^3.3.1)
- **목적:** Tailwind CSS 클래스명 충돌 해결 유틸리티
- **사용처:** `lib/utils/cn.ts` 유틸리티 함수
- **이유:** 동일한 유틸리티 클래스가 중복될 때 자동으로 병합하고 충돌을 해결

**참고:** `clsx`와 `tailwind-merge`를 결합한 `cn()` 유틸리티 함수를 `lib/utils/cn.ts`에 생성하여 프로젝트 전역에서 사용

---

### 3. 아이콘 라이브러리

#### `lucide-react` (^0.454.0)
- **목적:** 통일된 아이콘 라이브러리
- **사용처:** Header, Button, RecipeCard, MyPage 등 전역 아이콘 사용
- **이유:** 
  - `tmp-v0`에서도 사용 중이었고, 일관성 유지를 위해 동일한 라이브러리 채택
  - Tree-shaking 지원으로 번들 크기 최적화
  - React 컴포넌트로 제공되어 사용이 간편

---

### 4. 애니메이션

#### `tailwindcss-animate` (^1.0.7) - devDependencies
- **목적:** Tailwind CSS 애니메이션 유틸리티 플러그인
- **사용처:** shadcn/ui 컴포넌트의 기본 애니메이션 (fade-in, slide-in 등)
- **이유:** shadcn/ui 컴포넌트가 기본적으로 사용하는 애니메이션 유틸리티 제공

---

## 제거된 라이브러리

### `tw-animate-css` (1.3.3) - 제거됨
- **제거 날짜:** 2026년 1월 28일
- **제거 이유:** 
  - 빌드 오류 발생: Next.js 16 + Turbopack 환경에서 모듈 해결 실패
  - 실제 사용되지 않음: `tmp-v0` 코드 분석 결과 `animate-` 클래스가 실제로 사용되지 않았음
  - 대체 라이브러리 존재: `tailwindcss-animate`로 충분히 대체 가능
- **해결 방법:** `globals.css`에서 `@import "tw-animate-css";` 제거, `package.json`에서 의존성 제거

---

## 발생했던 에러와 해결 과정

### 1. 빌드 오류: 빈 모듈 파일들
**오류 내용:**
```
Type error: File '.../page.tsx' is not a module.
```

**원인:**
- 여러 `page.tsx`와 `layout.tsx` 파일이 주석만 있고 실제 모듈 코드가 없었음
- Next.js는 각 페이지 파일이 기본 export를 가진 React 컴포넌트를 export해야 함

**해결:**
- `tmp-v0`의 해당 페이지 코드를 참고하여 각 파일에 최소한의 기본 컴포넌트 추가
- 문제 파일들:
  - `app/(auth)/callback/page.tsx`
  - `app/(auth)/login/page.tsx`
  - `app/recipes/[id]/page.tsx`
  - `app/recipes/create/page.tsx`
  - `app/(dashboard)/page.tsx`
  - `app/(dashboard)/layout.tsx`
  - `app/api/ai/route.ts`

---

### 2. 빌드 오류: TypeScript가 tmp-v0 파일 컴파일 시도
**오류 내용:**
```
Type error: Cannot find module '@vercel/analytics/next' in tmp-v0/app/layout.tsx
```

**원인:**
- `tsconfig.json`의 `include` 패턴이 너무 넓어서 `tmp-v0` 폴더도 컴파일 대상에 포함됨
- `tmp-v0/app/layout.tsx`가 `@vercel/analytics/next`를 import했지만 현재 프로젝트에는 해당 의존성이 없음

**해결:**
- `tsconfig.json`의 `exclude` 배열에 `"tmp-v0"` 추가
- 이후 `tmp-v0` 폴더는 TypeScript 컴파일에서 완전히 제외됨

---

### 3. 빌드 오류: useSearchParams Suspense 경계
**오류 내용:**
```
useSearchParams() should be wrapped in a suspense boundary at page "/callback".
```

**원인:**
- Next.js App Router에서 `useSearchParams()`는 동적 함수이므로 빌드 시 정적 생성(prerendering)이 불가능
- Suspense boundary로 감싸야 함

**해결:**
- `app/(auth)/callback/page.tsx`를 리팩토링:
  - `useSearchParams()` 로직을 `CallbackContent` 컴포넌트로 분리
  - 페이지 컴포넌트에서 `<Suspense>`로 감싸기
  - 로딩 상태를 fallback으로 제공

---

### 4. 빌드 오류: tw-animate-css 모듈 해결 실패
**오류 내용:**
```
Error: Can't resolve 'tw-animate-css' in '/Users/hee/Desktop/envrecipe/app'
```

**원인:**
- `globals.css`에서 `@import "tw-animate-css";`를 사용했지만, Next.js 16 + Turbopack 환경에서 모듈을 찾지 못함
- 패키지는 `package.json`에 있었지만 실제로 사용되지 않았음

**해결:**
- `tmp-v0` 코드 분석 결과 `animate-` 클래스가 실제로 사용되지 않음을 확인
- `globals.css`에서 `@import "tw-animate-css";` 제거
- `package.json`에서 `tw-animate-css` 의존성 제거
- `tailwindcss-animate`만으로 충분함을 확인

---

### 5. 빌드 오류: Next.js 16 Turbopack과 Webpack 충돌
**오류 내용:**
```
ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
```

**원인:**
- Next.js 16은 기본적으로 Turbopack을 사용
- `next.config.ts`에 `webpack` 설정을 추가했지만 `turbopack` 설정이 없어 충돌 발생
- `tmp-v0` 폴더를 watch에서 제외하기 위해 webpack 설정을 추가했었음

**해결:**
- `next.config.ts`에서 `webpack` 설정 제거
- `tsconfig.json`의 `exclude` 설정만으로도 빌드에서 `tmp-v0`가 제외됨을 확인
- Next.js는 `tsconfig.json`의 `exclude`를 따르므로 추가 설정 불필요

---

## 최종 의존성 구조

### Dependencies
```
@radix-ui/react-alert-dialog  - AlertDialog 컴포넌트
@radix-ui/react-label          - Label 컴포넌트
@radix-ui/react-select         - Select 컴포넌트
@radix-ui/react-slot           - 컴포넌트 합성
class-variance-authority        - Variant 관리
clsx                           - 클래스명 조합
lucide-react                   - 아이콘 라이브러리
tailwind-merge                 - Tailwind 클래스 병합
```

### DevDependencies
```
tailwindcss-animate            - 애니메이션 유틸리티
```

---

## 참고 사항

1. **shadcn/ui 패턴:** 모든 UI 컴포넌트는 shadcn/ui 패턴을 따르며, Radix UI Primitives를 기반으로 구축됨

2. **유틸리티 함수:** `lib/utils/cn.ts`에 `cn()` 함수를 정의하여 프로젝트 전역에서 사용:
   ```typescript
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";
   
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

3. **tmp-v0 폴더 제외:** 
   - `tsconfig.json`의 `exclude`에 포함
   - `eslint.config.mjs`의 `globalIgnores`에 포함
   - `.gitignore`에 포함 (선택적)
   - 빌드 및 기능 개발에서 완전히 제외됨

4. **아이콘 통일:** 모든 아이콘은 `lucide-react`를 사용하여 일관성 유지

---

## 다음 단계

- Phase 2에서 추가 UI 컴포넌트가 필요할 경우, 동일한 패턴(shadcn/ui + Radix UI)을 따를 예정
- 현재 설치된 라이브러리들은 Phase 1 MVP 구현에 충분함
