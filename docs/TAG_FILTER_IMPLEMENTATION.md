# 태그 필터 기능 추가 — 변경 사항 및 디자인

## 📋 요약

카테고리별 검색 아래에 **태그 필터**를 추가했습니다. 태그 없이도 카테고리 검색은 정상 동작하며, 태그를 선택하면 **AND 조건**으로 필터링됩니다.

---

## 🎨 디자인

### 레이아웃 구조

```
┌─────────────────────────────────────────────────────────┐
│ [All] [Git] [Docker] [ROS] [Kubernetes] [Python]       │
│                                    [Latest first ▼]     │
├─────────────────────────────────────────────────────────┤
│ Tags: [ macOS × ] [ Ubuntu × ] [ Python × ]           │
│       [+ Add tag ▼]                                    │
└─────────────────────────────────────────────────────────┘
```

### 시각적 특징

- **카테고리 탭**: 기존과 동일 (상단)
- **태그 필터 섹션**: 카테고리 탭 아래, 회색 배경 박스
  - 선택된 태그: Badge 형태, × 버튼으로 제거
  - **태그 추가 방법 2가지**:
    1. **직접 입력**: 입력 필드에 태그를 입력하고 `Enter` 키 누르기
    2. **드롭다운 선택**: 기존에 사용된 태그 목록에서 선택
- **정렬 드롭다운**: 우측 상단 (기존 위치 유지)

---

## 🔄 변경 사항

### 1. 신규 컴포넌트

**`components/domain/recipe/tag-filter.tsx`**
- 선택된 태그 표시 (Badge + × 버튼)
- **태그 추가 방법 2가지**:
  1. **직접 입력 필드**: 태그를 입력하고 `Enter` 키로 추가
  2. **드롭다운**: 기존에 사용된 태그 목록에서 선택 (선택되지 않은 태그만 표시)
- Props: `selectedTags`, `availableTags`, `onTagAdd`, `onTagRemove`
- 내부 state: `inputValue` (입력 필드 값)

### 2. 수정된 파일

**`app/page.tsx`**
- `selectedTags` state 추가
- `availableTags` 계산 (모든 레시피의 태그 중복 제거)
- `filteredAndSortedRecipes`에 태그 필터 로직 추가
  - 선택된 태그가 **모두 포함**된 레시피만 표시 (AND 조건)
- `TagFilter` 컴포넌트 렌더링 (CategoryTabs 아래)

### 3. DB 스키마

**변경 없음** ✅
- `posts.tags` (text[]) 이미 존재
- GIN 인덱스 (`idx_posts_tags_gin`) 이미 추가됨

---

## 🔍 필터링 로직

### 현재 (클라이언트 사이드)

```typescript
// 1. 카테고리 필터
if (activeCategory !== "All") {
  filtered = recipes.filter((recipe) => recipe.category === activeCategory);
}

// 2. 태그 필터 (AND 조건)
if (selectedTags.length > 0) {
  filtered = filtered.filter((recipe) =>
    selectedTags.every((tag) => recipe.tags.includes(tag))
  );
}
```

### Supabase 연동 시 (서버 사이드)

```typescript
let query = supabase
  .from('posts')
  .select('*, categories(name)');

// 카테고리 필터
if (categoryId) {
  query = query.eq('category_id', categoryId);
}

// 태그 필터 (AND 조건: 모든 선택된 태그 포함)
if (selectedTags.length > 0) {
  query = query.contains('tags', selectedTags);
  // 또는
  // selectedTags.forEach(tag => {
  //   query = query.contains('tags', [tag]);
  // });
}
```

---

## 📊 동작 예시

### 시나리오 1: 카테고리만 선택
- 카테고리: `Git` 선택
- 태그: 없음
- 결과: Git 카테고리의 모든 레시피 표시 ✅

### 시나리오 2: 태그만 선택
- 카테고리: `All`
- 태그: `macOS`, `Ubuntu` 선택
- 결과: `macOS`와 `Ubuntu` 태그를 **모두** 포함한 레시피만 표시

### 시나리오 3: 카테고리 + 태그
- 카테고리: `Docker` 선택
- 태그: `Linux` 선택
- 결과: Docker 카테고리이면서 `Linux` 태그를 포함한 레시피만 표시

---

## 🚀 향후 개선 사항

1. ~~**태그 직접 입력**: 입력 필드 추가~~ ✅ 완료
2. **태그 자동완성**: 입력 필드에 타이핑 시 기존 태그 자동완성 제안
3. **태그 통계**: 각 태그 옆에 사용 빈도 표시
4. **OR 조건 옵션**: AND/OR 선택 가능
5. **태그 색상**: 카테고리처럼 태그별 색상 구분

---

## ✅ 테스트 체크리스트

- [ ] 카테고리만 선택 시 정상 동작
- [ ] 태그만 선택 시 정상 동작
- [ ] 카테고리 + 태그 조합 시 정상 동작
- [ ] 태그 제거 (× 버튼) 시 필터 업데이트
- [ ] **직접 입력**: 입력 필드에 태그 입력 후 Enter 키로 추가
- [ ] **드롭다운 선택**: 기존 태그 목록에서 선택하여 추가
- [ ] 태그 추가 시 드롭다운에서 사라짐
- [ ] 중복 태그 추가 방지 (이미 선택된 태그는 추가되지 않음)
- [ ] 빈 태그 입력 방지 (공백만 입력 시 무시)
- [ ] 필터 결과 없을 때 적절한 메시지 표시
