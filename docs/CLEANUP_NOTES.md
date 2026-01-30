# 코드·문서 정리 노트

> 삭제/변경 전 확인용 메모. 정리 후 이 파일은 삭제하거나 history로 이동 가능.

---

## 1. README가 Git/원격에서 안 보일 때

**로컬에서는 `README.md`가 Git에 추적되고 있습니다** (`git ls-files README.md` 확인).

원격(GitHub/GitLab 등)에서 안 보인다면 아래를 순서대로 확인하세요.

| 가능 원인 | 확인 방법 |
|-----------|-----------|
| **아직 푸시 안 함** | `git status`, `git log origin/feature/develop-start..HEAD` 로 로컬 커밋이 있는지 확인 후 `git push` |
| **다른 브랜치를 보고 있음** | 원격 저장소 웹에서 현재 브랜치가 `feature/develop-start`(또는 README를 넣은 브랜치)인지 확인 |
| **기본 브랜치가 main/master** | README를 올린 브랜치가 기본 브랜치가 아니면, 해당 브랜치로 전환하면 보임 |
| **대소문자/이름** | 일부 시스템은 `Readme.md` vs `README.md` 구분함. 프로젝트는 `README.md` 사용 중 |

**요약**: 로컬에 README.md 있고 추적 중이면, 원격에 안 보이는 건 대부분 **푸시 누락** 또는 **브랜치 선택** 때문입니다.

---

## 2. 사용하지 않는 코드·파일 (삭제 완료)

아래 파일들은 **삭제 완료**되었습니다.

| 파일 | 이유 |
|------|------|
| `app/api/ai/route.ts` | Mock API만 있음. 실제 사용처는 `recipe-analyze`, `multi-engine` 루트. |
| `lib/ai/assistant.ts` | 내용 거의 없음(주석만). 어디서도 import 안 함. |
| `hooks/use-ai-assist.ts` | 스텁만 있음. 어디서도 import 안 함. |
| `components/ai/recipe-ai-helper.tsx` | 레시피 작성/수정 폼에서 사용 안 함. 문서 예시에만 등장. |


---

## 3. 문서 파일명·형식 규칙 제안

현재 `docs/` 내 이름 규칙이 혼재되어 있습니다.

- **대문자/스네이크**: `PRD.md`, `FLOW.md`, `AI_MULTI_ENGINE_README.md`, `SCHEMA_ANALYSIS_AND_DESIGN.md` 등  
- **소문자 케밥**: `functional_flow.md`, `ai-setup-guide.md`, `db-schema.md`, `roadmap.md` 등  

**제안** (선택 사항):

- **기획/스펙/리포트**: `UPPER_SNAKE.md` 또는 `PascalCase.md` 유지 (예: PRD, FLOW, 검증 리포트).
- **가이드/설정/일반**: `kebab-case.md` (예: `ai-setup-guide.md`, `functional_flow.md` → `functional-flow.md`).

파일명을 대량으로 바꾸면 링크가 깨지므로, **이름 변경은 필요 시 하나씩 진행하고, 링크 갱신 후 커밋**하는 것을 권장합니다.  
이번에는 **형식(헤딩, 표, 링크 스타일)만 통일**하고, 파일명은 `docs/README.md`에 “현재 규칙”만 적어 두었습니다.

---

## 4. tmp-v0 폴더

- `tmp-v0/`는 **백업용**이며, `tsconfig.json`의 `exclude`로 빌드에서 제외되어 있습니다.
- 삭제 여부는 별도로 결정하면 됩니다. (삭제 시 `.gitignore`의 `# tmp-v0` 주석 해제 후 제외할 수 있음.)
