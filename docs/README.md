# EnvRecipe 문서 인덱스

프로젝트 문서 목록과 용도를 정리한 인덱스입니다.

**문서 파일명 규칙**: 기획/스펙은 `UPPER_SNAKE.md` 또는 `PascalCase.md`, 가이드/설정은 `kebab-case.md`가 혼용됩니다. 링크는 이 인덱스와 각 문서 내 상대 경로를 기준으로 합니다.

---

## 📋 기획·요구사항

| 문서 | 설명 |
|------|------|
| [PRD.md](PRD.md) | 제품 요구사항, Phase 1/2 목표, 기능 범위 |
| [roadmap.md](roadmap.md) | 로드맵 및 향후 계획 |
| [functional_flow.md](functional_flow.md) | **기능별 구현 체크리스트** (데이터 흐름·Phase 1~3·진행률) |

---

## 🛠 기술·설계

| 문서 | 설명 |
|------|------|
| [tech-stack.md](tech-stack.md) | 기술 스택 (Next.js, Supabase, AI, UI) |
| [db-schema.md](db-schema.md) | DB 스키마 개요 |
| [SCHEMA_ANALYSIS_AND_DESIGN.md](SCHEMA_ANALYSIS_AND_DESIGN.md) | 스키마 분석·설계 |
| [FLOW.md](FLOW.md) | 화면/데이터 흐름 |

---

## 🤖 AI 관련

| 문서 | 설명 |
|------|------|
| [ai-setup-guide.md](ai-setup-guide.md) | **AI 설정 가이드** (API 키, 마이그레이션, 사용법) |
| [AI_MULTI_ENGINE_README.md](AI_MULTI_ENGINE_README.md) | 멀티 AI 엔진(Google/Groq) 시스템 개요 |
| [recipe-analyze-verification.md](recipe-analyze-verification.md) | 레시피 AI 분석(2.9) 검증·테스트 방법 |

**루트 문서**

- [../QUICK_START_AI.md](../QUICK_START_AI.md) — AI 5분 빠른 시작
- [../AI_IMPLEMENTATION_SUMMARY.md](../AI_IMPLEMENTATION_SUMMARY.md) — AI 구현 요약

---

## ✅ 검증·리포트

| 문서 | 설명 |
|------|------|
| [PHASE1_VERIFICATION_REPORT.md](PHASE1_VERIFICATION_REPORT.md) | Phase 1 검증 리포트 |
| [AUTH_UX_VERIFICATION.md](AUTH_UX_VERIFICATION.md) | 인증·UX 검증 |
| [CODE_DB_VERIFICATION.md](CODE_DB_VERIFICATION.md) | 코드·DB 검증 |
| [DEVELOPMENT_VOLUME_ANALYSIS.md](DEVELOPMENT_VOLUME_ANALYSIS.md) | 개발량 분석 |

---

## 📁 기타

| 문서 | 설명 |
|------|------|
| [STEP3_STEP4_PLAN.md](STEP3_STEP4_PLAN.md) | Step 3/4 계획 |
| [TAG_FILTER_IMPLEMENTATION.md](TAG_FILTER_IMPLEMENTATION.md) | 태그 필터 구현 |
| [history/](history/) | 변경 이력 (001-initial-setup, 002-ui-migration 등) |
| [CLEANUP_NOTES.md](CLEANUP_NOTES.md) | 코드·문서 정리 노트 (미사용 파일, README Git 점검) |

---

## 빠른 참조

- **기능 구현 진행률**: [functional_flow.md](functional_flow.md) 하단 체크리스트
- **AI 설정·테스트**: [ai-setup-guide.md](ai-setup-guide.md) + [../QUICK_START_AI.md](../QUICK_START_AI.md)
- **DB 마이그레이션**: `supabase/migrations/` SQL 순서대로 실행
