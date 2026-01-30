# EnvRecipe DB Migrations

마이그레이션은 **파일명 타임스탬프 순서**대로 적용됩니다.

| 순서 | 파일 | 내용 |
|------|------|------|
| 1 | `20250129000000_create_profiles.sql` | profiles 테이블 |
| 2 | `20250129000001_create_categories.sql` | categories 테이블 + 시드 |
| 3 | `20250129000002_create_posts.sql` | posts 테이블 + 인덱스 |
| 4 | `20250129000003_create_post_steps.sql` | post_steps 테이블 + 인덱스 |
| 5 | `20250129000004_create_bookmarks.sql` | bookmarks 테이블 |
| 6 | `20250129000005_create_post_likes.sql` | post_likes 테이블 |
| 7 | `20250129000006_create_triggers.sql` | handle_new_user, posts.updated_at 트리거 |
| 8 | `20250129000007_setup_rls_policies.sql` | RLS 활성화 + 정책 |
| 9 | `002_ai_responses.sql` | ai_responses 테이블 (멀티 AI 응답 저장) |
| 10 | `003_ai_responses_allow_null_user.sql` | ai_responses RLS 정책 (user_id null 허용) |

**적용 방법**

- Supabase CLI: `npx supabase db push` 또는 `npx supabase migration up`
- 대시보드: SQL Editor에서 위 순서대로 각 파일 내용 실행
