/**
 * 레시피 도메인 타입 — UI/API에서 그대로 사용
 * DB Row와 매핑 가능 (types/database.ts 참고)
 */

import type { Post, PostStep, Category } from "./database";

// =============================================================================
// DB Row 기반 (그대로 사용 가능)
// =============================================================================
export type { Post, PostStep, Category };

// =============================================================================
// Troubleshooting notes (posts.troubleshooting_notes JSONB 구조)
// =============================================================================
export interface TroubleshootingNote {
  id: number;
  title: string;
  description: string;
}

// =============================================================================
// UI: 레시피 카드 / 리스트
// =============================================================================
export interface RecipeCardItem {
  id: number;
  title: string;
  description: string;
  category: string; // categories.name (표시용)
  tags: string[];
  createdAt: string; // 포맷된 날짜 문자열
  initialBookmarked?: boolean;
}

// =============================================================================
// UI: Step (StepCard, 작성/수정 폼)
// =============================================================================
export interface StepItem {
  id: number;
  content: string;
  imageUrl?: string | null;
}

/** PostStep Row → StepItem (image_url → imageUrl) */
export function postStepToStepItem(row: PostStep): StepItem {
  return {
    id: row.id,
    content: row.content,
    imageUrl: row.image_url ?? undefined,
  };
}

// =============================================================================
// UI: 레시피 상세 (상세 페이지, 수정 폼 로드)
// =============================================================================
export interface RecipeDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  steps: StepItem[];
  troubleshooting: {
    aiSummary: string;
    raw: string;
    notes: TroubleshootingNote[];
  };
}

/** DB 조회 결과(post + post_steps[] + category name) → RecipeDetail */
export interface RecipeDetailRow {
  post: Post;
  steps: PostStep[];
  categoryName: string;
}

export function recipeDetailRowToDetail(row: RecipeDetailRow, createdAtFormatted: string): RecipeDetail {
  const notes = ((row.post.troubleshooting_notes as unknown) as TroubleshootingNote[]) ?? [];
  return {
    id: row.post.id,
    title: row.post.title,
    description: row.post.description,
    category: row.categoryName,
    tags: row.post.tags,
    createdAt: createdAtFormatted,
    steps: row.steps
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(postStepToStepItem),
    troubleshooting: {
      aiSummary: row.post.ai_summary ?? "",
      raw: row.post.troubleshooting_raw ?? "",
      notes,
    },
  };
}

// =============================================================================
// UI: 마이페이지 내가 쓴 레시피
// =============================================================================
export interface MyRecipeItem {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

/** Post + category name → MyRecipeItem */
export function postToMyRecipeItem(
  post: Post,
  categoryName: string,
  createdAtFormatted: string
): MyRecipeItem {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    category: categoryName,
    tags: post.tags,
    isPublic: post.is_public,
    createdAt: createdAtFormatted,
  };
}

// =============================================================================
// UI: 마이페이지 북마크 리스트
// =============================================================================
export interface BookmarkedRecipeItem {
  id: number;
  title: string;
  category: string;
  tags: string[];
  author: string; // profiles.display_name
}

// =============================================================================
// 작성/수정 폼: Step 입력 (이미지는 업로드 후 URL로)
// =============================================================================
export interface StepFormInput {
  id: number; // 클라이언트 임시 id 또는 저장 후 post_steps.id
  description: string;
  image: string | null; // blob URL 또는 Storage URL
}

/** StepFormInput → PostStep Insert (post_id는 호출부에서) */
export function stepFormToInsert(
  step: StepFormInput,
  postId: number,
  sortOrder: number
): { post_id: number; sort_order: number; content: string; image_url: string | null } {
  return {
    post_id: postId,
    sort_order: sortOrder,
    content: step.description,
    image_url: step.image ?? null,
  };
}
