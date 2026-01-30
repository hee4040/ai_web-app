"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 레시피 삭제 Server Action
 */
export async function deleteRecipe(postId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // 작성자 확인
  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) {
    return { error: "Forbidden" };
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting post:", error);
    return { error: "Failed to delete recipe" };
  }

  revalidatePath("/");
  revalidatePath("/mypage");

  return { success: true };
}

/**
 * 공개/비공개 토글 Server Action
 */
export async function toggleRecipeVisibility(postId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // 현재 상태 조회
  const { data: post } = await supabase
    .from("posts")
    .select("is_public, user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) {
    return { error: "Forbidden" };
  }

  const { error } = await supabase
    .from("posts")
    .update({ is_public: !post.is_public })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error toggling visibility:", error);
    return { error: "Failed to toggle visibility" };
  }

  revalidatePath("/mypage");

  return { success: true, isPublic: !post.is_public };
}
