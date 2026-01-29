"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 북마크 추가/삭제 Server Action
 */
export async function toggleBookmark(postId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // 현재 북마크 상태 확인
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existing) {
    // 북마크 삭제
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) {
      console.error("Error removing bookmark:", error);
      return { error: "Failed to remove bookmark" };
    }

    revalidatePath("/mypage");
    return { success: true, bookmarked: false };
  } else {
    // 북마크 추가
    const { error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        post_id: postId,
      });

    if (error) {
      console.error("Error adding bookmark:", error);
      return { error: "Failed to add bookmark" };
    }

    revalidatePath("/mypage");
    return { success: true, bookmarked: true };
  }
}
