import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "./home-client";
import type { Category, Post } from "@/types/database";
import type { RecipeCardItem } from "@/types/recipe";
import { formatDate } from "@/lib/utils/format";

interface HomeProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    tags?: string;
  }>;
}

/**
 * 메인 페이지 (서버 컴포넌트)
 * 카테고리 목록과 공개 레시피 목록을 서버에서 조회하여 클라이언트 컴포넌트에 전달
 */
export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const params = await searchParams;

  // 카테고리 목록 조회
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
  }

  // "All" 카테고리를 맨 앞에 추가
  const categoryNames: string[] = ["All"];
  if (categories) {
    const categoryList = categories as Category[];
    categoryNames.push(...categoryList.map((cat) => cat.name));
  }

  // 공개 레시피 목록 조회
  let query = supabase
    .from("posts")
    .select("*, categories(*)")
    .eq("is_public", true);

  // 카테고리 필터링
  if (params.category && params.category !== "All") {
    const categoryList = (categories as Category[]) || [];
    const categoryId = categoryList.find((c) => c.name === params.category)?.id;
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
  }

  // 정렬
  if (params.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (params.sort === "name") {
    query = query.order("title", { ascending: true });
  } else {
    // 기본값: latest
    query = query.order("created_at", { ascending: false });
  }

  const { data: posts, error: postsError } = await query;

  if (postsError) {
    console.error("Error fetching posts:", postsError);
  }

  // 타입 변환: Post + Category → RecipeCardItem
  const joinedPosts = (posts ?? []) as Array<Post & { categories: Category | null }>;
  
  // 현재 로그인한 사용자의 북마크 정보 조회
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let bookmarkedPostIds = new Set<number>();

  if (user && joinedPosts.length > 0) {
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", user.id)
      .in(
        "post_id",
        joinedPosts.map((post) => post.id)
      );

    if (bookmarksError) {
      console.error("Error fetching bookmarks:", bookmarksError);
    }

    if (bookmarks) {
      bookmarkedPostIds = new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (bookmarks as any[]).map((b) => b.post_id as number)
      );
    }
  }

  const recipes: RecipeCardItem[] = joinedPosts.map((postData) => {
    const category = postData.categories;
    return {
      id: postData.id,
      title: postData.title,
      description: postData.description,
      category: category?.name || "Unknown",
      tags: postData.tags || [],
      createdAt: formatDate(postData.created_at),
       initialBookmarked: bookmarkedPostIds.has(postData.id),
    };
  });

  // 태그 필터링 (클라이언트에서 처리하거나 서버에서 처리 가능)
  // 여기서는 서버에서 처리하지 않고 클라이언트로 전달
  const selectedTags = params.tags ? params.tags.split(",") : [];

  return (
    <HomeClient
      categories={categoryNames}
      initialRecipes={recipes}
      initialCategory={params.category || "All"}
      initialSort={params.sort || "latest"}
      initialTags={selectedTags}
    />
  );
}
