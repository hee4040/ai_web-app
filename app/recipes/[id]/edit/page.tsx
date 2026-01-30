import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditRecipeForm } from "./edit-recipe-form";
import type { Post, PostStep, Category } from "@/types/database";
import type { TroubleshootingNote } from "@/types/recipe";
import { postStepToStepItem } from "@/types/recipe";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

/**
 * 레시피 수정 페이지 (서버 컴포넌트)
 * 레시피 데이터를 로드하여 폼에 전달
 */
export default async function EditRecipePage({
  params,
}: EditRecipePageProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 레시피 조회 및 작성자 확인
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*, categories(*)")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    notFound();
  }

  const postData = post as Post & { categories: Category | null };

  // 작성자 확인
  if (postData.user_id !== user.id) {
    notFound();
  }

  // post_steps 조회
  const { data: steps, error: stepsError } = await supabase
    .from("post_steps")
    .select("*")
    .eq("post_id", postId)
    .order("sort_order", { ascending: true });

  if (stepsError) {
    console.error("Error fetching steps:", stepsError);
  }

  const stepsData = (steps || []) as PostStep[];

  // 카테고리 목록 조회
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // 트러블슈팅: notes 배열이 있으면 사용, 없으면 raw로 1개 항목 구성
  const notes = (postData.troubleshooting_notes as TroubleshootingNote[] | null) ?? [];
  const troubleshootingNotes =
    notes.length > 0
      ? notes.map((n, idx) => ({
          id: n.id ?? idx + 1,
          title: n.title ?? "",
          description: n.description ?? "",
        }))
      : [
          {
            id: 1,
            title: "",
            description: postData.troubleshooting_raw || "",
          },
        ];

  // 초기 데이터 준비
  const initialData = {
    title: postData.title,
    description: postData.description,
    category: postData.categories?.name || "",
    tags: postData.tags.join(", "),
    steps: stepsData.map(postStepToStepItem),
    troubleshootingNotes,
    isPublic: postData.is_public,
  };

  return (
    <EditRecipeForm
      postId={postId}
      categories={(categories as Category[]) || []}
      initialData={initialData}
    />
  );
}
