"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 레시피 수정 Server Action
 * - 성공 시 클라이언트에서 라우팅할 수 있도록 결과만 반환한다.
 */
export async function updateRecipe(postId: number, formData: FormData) {
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
    // 작성자 확인
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return { success: false as const, error: "Forbidden" as const };
    }

    // FormData에서 필드 추출
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const categoryName = formData.get("category") as string;
    const tagsString = formData.get("tags") as string;
    const troubleshootingNotesRaw = formData.get("troubleshootingNotes") as
      | string
      | null;
    let troubleshootingNotes: Array<{ id: number; title: string; description: string }> = [];
    let troubleshootingRaw: string | null = null;

    if (troubleshootingNotesRaw) {
      try {
        const parsed = JSON.parse(troubleshootingNotesRaw) as Array<{
          id?: number;
          title?: string;
          description?: string;
        }>;
        if (Array.isArray(parsed) && parsed.length > 0) {
          troubleshootingNotes = parsed.map((item, idx) => ({
            id: Number(item?.id) ?? idx + 1,
            title: String(item?.title ?? "").trim(),
            description: String(item?.description ?? "").trim(),
          }));
          const forAi = troubleshootingNotes
            .map((n) => (n.title ? `${n.title}: ` : "") + n.description)
            .filter(Boolean)
            .join("\n\n");
          if (forAi) troubleshootingRaw = forAi;
        }
      } catch {
        // ignore invalid JSON
      }
    }

    const isPublic = formData.get("isPublic") === "true";

    // 카테고리 ID 조회
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single();

    if (!category) {
      return { success: false as const, error: "Invalid category" as const };
    }

    // 태그 파싱
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // posts 테이블 UPDATE
    const updatePayload = {
      title,
      description,
      category_id: category.id,
      tags,
      troubleshooting_raw: troubleshootingRaw || null,
      troubleshooting_notes:
        troubleshootingNotes.length > 0 ? troubleshootingNotes : [],
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    };
    const { error: postError } = await supabase
      .from("posts")
      .update(updatePayload as never)
      .eq("id", postId)
      .eq("user_id", user.id);

    if (postError) {
      console.error("Error updating post:", postError);
      return { success: false as const, error: "Failed to update recipe" as const };
    }

    // 기존 post_steps 모두 DELETE
    const { error: deleteError } = await supabase
      .from("post_steps")
      .delete()
      .eq("post_id", postId);

    if (deleteError) {
      console.error("Error deleting steps:", deleteError);
    }

    // Steps 처리
    const stepCount = parseInt(formData.get("stepCount") as string) || 0;
    const stepInserts = [];

    for (let i = 0; i < stepCount; i++) {
      const content = formData.get(`step-${i}-content`) as string;
      const imageFile = formData.get(`step-${i}-image`) as File | null;
      const existingImageUrl = formData.get(
        `step-${i}-existing-image`
      ) as string | null;

      let imageUrl: string | null = null;

      if (imageFile && imageFile.size > 0) {
        // 새 이미지 업로드
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${postId}-${i}-${Date.now()}.${fileExt}`;
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
      } else if (existingImageUrl) {
        // 기존 이미지 URL 유지
        imageUrl = existingImageUrl;
      }

      stepInserts.push({
        post_id: postId,
        sort_order: i + 1,
        content,
        image_url: imageUrl,
      });
    }

    // 새 post_steps INSERT
    if (stepInserts.length > 0) {
      const { error: stepsError } = await supabase
        .from("post_steps")
        .insert(stepInserts);

      if (stepsError) {
        console.error("Error creating steps:", stepsError);
      }
    }

    // 캐시 갱신
    revalidatePath("/");
    revalidatePath(`/recipes/${postId}`);
    revalidatePath("/mypage");

    // 클라이언트에서 후속 라우팅을 할 수 있도록 결과 반환
    return { success: true as const };
  } catch (error) {
    console.error("Unexpected error updating recipe:", error);
    return { success: false as const, error: "An unexpected error occurred" as const };
  }
}
