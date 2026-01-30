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
 * - 성공 시 생성된 post id를 반환하고, 클라이언트에서 라우팅을 처리한다.
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
            .map(
              (n) =>
                (n.title ? `${n.title}: ` : "") + n.description
            )
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
      return { success: false, error: "Invalid category" as const };
    }

    // 태그 파싱
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // posts 테이블에 레시피 메인 정보 INSERT
    const insertPayload = {
      user_id: user.id,
      title,
      description,
      category_id: category.id,
      tags,
      troubleshooting_raw: troubleshootingRaw || null,
      troubleshooting_notes:
        troubleshootingNotes.length > 0 ? troubleshootingNotes : [],
      is_public: isPublic,
    };
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert(insertPayload as never)
      .select()
      .single();

    if (postError || !post) {
      console.error("Error creating post:", postError);
      return { success: false, error: "Failed to create recipe" as const };
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

    // 2.9 AI 보조: 레시피 저장 후 비동기로 AI 분석 호출 (사용자 블로킹 없음)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const troubleshootingForAi =
      troubleshootingRaw ||
      troubleshootingNotes
        .map((n) => (n.title ? `${n.title}: ` : "") + n.description)
        .filter(Boolean)
        .join("\n\n");

    fetch(`${baseUrl}/api/ai/recipe-analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: post.id,
        troubleshooting: troubleshootingForAi || "",
        steps: stepInserts.map((s) => ({ content: s.content })),
        title,
        category: categoryName,
      }),
    }).catch((err) => console.error("Recipe AI analyze trigger failed:", err));

    // 클라이언트에서 후속 라우팅을 할 수 있도록 결과 반환
    return { success: true as const, postId: post.id };
  } catch (error) {
    console.error("Unexpected error creating recipe:", error);
    return { success: false as const, error: "An unexpected error occurred" as const };
  }
}
