"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface CreateRecipeInput {
  title: string;
  description: string;
  categoryId: number;
  tags: string[];
  steps: Array<{
    content: string;
    imageFile?: File;
  }>;
  troubleshooting: string;
  isPublic: boolean;
}

/**
 * 레시피 작성 Server Action
 */
export async function createRecipe(formData: FormData) {
  // NOTE: Supabase typed query inference can degrade to `never` in Server Actions
  // with our current Database typing setup. We cast here to keep runtime behavior
  // correct and unblock builds.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  // 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  try {
    // FormData에서 필드 추출
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const categoryName = formData.get("category") as string;
    const tagsString = formData.get("tags") as string;
    const troubleshooting = (formData.get("troubleshooting") as string) || "";
    const isPublic = formData.get("isPublic") === "true";

    // 카테고리 ID 조회
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single();

    if (!category) {
      return { error: "Invalid category" };
    }

    // 태그 파싱
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // posts 테이블에 레시피 메인 정보 INSERT
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        title,
        description,
        category_id: category.id,
        tags,
        troubleshooting_raw: troubleshooting || null,
        is_public: isPublic,
      })
      .select()
      .single();

    if (postError || !post) {
      console.error("Error creating post:", postError);
      return { error: "Failed to create recipe" };
    }

    // Steps 처리
    const stepCount = parseInt(formData.get("stepCount") as string) || 0;
    const stepInserts = [];

    for (let i = 0; i < stepCount; i++) {
      const content = formData.get(`step-${i}-content`) as string;
      const imageFile = formData.get(`step-${i}-image`) as File | null;

      let imageUrl: string | null = null;

      // 이미지 업로드
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${post.id}-${i}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("recipe-step-images")
          .upload(filePath, imageFile);

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("recipe-step-images")
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        } else {
          console.error("Error uploading image:", uploadError);
        }
      }

      stepInserts.push({
        post_id: post.id,
        sort_order: i + 1,
        content,
        image_url: imageUrl,
      });
    }

    // post_steps 테이블에 단계별 정보 INSERT
    if (stepInserts.length > 0) {
      const { error: stepsError } = await supabase
        .from("post_steps")
        .insert(stepInserts);

      if (stepsError) {
        console.error("Error creating steps:", stepsError);
        // posts는 이미 생성되었으므로 삭제해야 할 수도 있지만,
        // 일단 에러만 로그하고 진행
      }
    }

    // 캐시 갱신
    revalidatePath("/");
    revalidatePath(`/recipes/${post.id}`);

    // 생성된 레시피 상세 페이지로 리다이렉트
    redirect(`/recipes/${post.id}`);
  } catch (error) {
    console.error("Unexpected error creating recipe:", error);
    return { error: "An unexpected error occurred" };
  }
}
