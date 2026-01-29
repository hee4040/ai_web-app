import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateRecipeForm } from "./create-recipe-form";
import type { Category } from "@/types/database";

/**
 * 레시피 작성 페이지 (서버 컴포넌트)
 * 카테고리 목록을 조회하여 폼 컴포넌트에 전달
 */
export default async function CreateRecipePage() {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 비로그인 시 로그인 페이지로 리다이렉트
    redirect("/login");
  }

  // 카테고리 목록 조회
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
  }

  const categoryList = (categories as Category[]) || [];

  return <CreateRecipeForm categories={categoryList} />;
}
