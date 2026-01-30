import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyPageClient } from "./mypage-client";
import type { Post, Category } from "@/types/database";
import { postToMyRecipeItem } from "@/types/recipe";
import { formatDate } from "@/lib/utils/format";

/**
 * 마이페이지 (서버 컴포넌트)
 * 내가 작성한 레시피와 북마크한 레시피 조회
 */
export default async function MyPage() {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 내가 작성한 레시피 조회
  const { data: myPosts, error: myPostsError } = await supabase
    .from("posts")
    .select("*, categories(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (myPostsError) {
    console.error("Error fetching my recipes:", myPostsError);
  }

  // 북마크한 레시피 조회
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("*, posts(*, categories(*), profiles!posts_user_id_fkey(display_name))")
    .eq("user_id", user.id);

  if (bookmarksError) {
    console.error("Error fetching bookmarks:", bookmarksError);
  }

  // 타입 변환
  const joinedMyPosts = (myPosts ?? []) as Array<Post & { categories: Category | null }>;
  const myRecipes = joinedMyPosts.map((postData) => {
    return postToMyRecipeItem(
      postData,
      postData.categories?.name || "Unknown",
      formatDate(postData.created_at)
    );
  });

  const joinedBookmarks = (bookmarks ?? []) as Array<{
    posts: (Post & {
      categories: Category | null;
      profiles: { display_name: string | null } | null;
    }) | null;
  }>;
  const bookmarkedRecipes = joinedBookmarks
    .map((bookmark) => bookmark.posts)
    .filter((post): post is NonNullable<typeof post> => !!post)
    .map((post) => {
    return {
      id: post.id,
      title: post.title,
      category: post.categories?.name || "Unknown",
      tags: post.tags || [],
      author: post.profiles?.display_name || "Unknown",
    };
  });

  return (
    <MyPageClient
      myRecipes={myRecipes}
      bookmarkedRecipes={bookmarkedRecipes}
    />
  );
}
