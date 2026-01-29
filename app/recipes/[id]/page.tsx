import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipeDetailView } from "./recipe-detail-view";
import type { Post, PostStep, Category } from "@/types/database";
import { recipeDetailRowToDetail } from "@/types/recipe";
import { formatDate } from "@/lib/utils/format";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 레시피 상세 페이지 (서버 컴포넌트)
 * posts + post_steps + categories + profiles 조회
 */
export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  const supabase = await createClient();

  // posts 테이블에서 레시피 조회 (categories, profiles 조인)
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*, categories(*), profiles!posts_user_id_fkey(display_name)")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    console.error("Error fetching post:", postError);
    notFound();
  }

  const postData = post as Post & {
    categories: Category | null;
    profiles: { display_name: string | null } | null;
  };

  // 비공개 레시피 접근 제한 (RLS 정책으로도 보호되지만 이중 체크)
  if (!postData.is_public) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== postData.user_id) {
      notFound();
    }
  }

  // post_steps 테이블에서 단계별 정보 조회
  const { data: steps, error: stepsError } = await supabase
    .from("post_steps")
    .select("*")
    .eq("post_id", postId)
    .order("sort_order", { ascending: true });

  if (stepsError) {
    console.error("Error fetching steps:", stepsError);
  }

  const stepsData = (steps || []) as PostStep[];

  // 타입 변환
  const recipeDetail = recipeDetailRowToDetail(
    {
      post: postData,
      steps: stepsData,
      categoryName: postData.categories?.name || "Unknown",
    },
    formatDate(postData.created_at)
  );

  // 북마크 상태 확인 (로그인한 경우)
  let isBookmarked = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: bookmark } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .single();
    isBookmarked = !!bookmark;
  }

  return (
    <RecipeDetailView
      recipe={recipeDetail}
      initialBookmarked={isBookmarked}
    />
  );
}
