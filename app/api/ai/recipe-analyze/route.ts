import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseAIRecipeResponse } from "@/lib/ai/recipe-analyze-parse";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

interface RecipeAnalyzeRequest {
  postId: number;
  troubleshooting: string;
  steps: Array<{ content: string }>;
  title: string;
  category: string;
}

const SYSTEM_PROMPT = `당신은 개발 환경/레시피 문서를 분석하는 AI입니다.
주어진 레시피(제목, 단계, 트러블슈팅)를 바탕으로 다음 JSON만 출력하세요. 다른 설명은 붙이지 마세요.

{
  "summary": "레시피 요약 문장 (1~2문장, 100자 이내)",
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "notes": [
    { "id": 1, "title": "문제 제목", "description": "해결 방법 설명" },
    { "id": 2, "title": "문제 제목", "description": "해결 방법 설명" }
  ]
}

- summary: 레시피 전체를 한두 문장으로 요약
- keywords: 환경/도구/기술 관련 키워드 5개 이내 (영문 또는 한글)
- notes: 사용자가 적은 트러블슈팅 내용을 바탕으로, 문제-해결 쌍으로 정리. 없으면 빈 배열 []`;

export async function POST(request: NextRequest) {
  try {
    const body: RecipeAnalyzeRequest = await request.json();
    const { postId, troubleshooting, steps, title, category } = body;

    if (!postId || typeof postId !== "number") {
      return NextResponse.json(
        { error: "postId is required and must be a number" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Recipe analyze: GOOGLE_GENERATIVE_AI_API_KEY not set");
      return NextResponse.json(
        { error: "AI not configured" },
        { status: 500 }
      );
    }

    const stepsText =
      steps && steps.length > 0
        ? steps.map((s, i) => `${i + 1}. ${s.content}`).join("\n")
        : "(없음)";

    const prompt = `제목: ${title}
카테고리: ${category}

단계:
${stepsText}

트러블슈팅(사용자 입력):
${troubleshooting || "(없음)"}

위 내용을 분석하여 요청한 JSON 형식으로만 답하세요.`;

    const model = google("gemini-1.5-flash-latest");

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      maxOutputTokens: 600,
    });

    const analysis = parseAIRecipeResponse(text);
    if (!analysis) {
      console.error("Recipe analyze: failed to parse AI JSON", text);
      return NextResponse.json(
        { error: "AI response was not valid JSON" },
        { status: 500 }
      );
    }

    const notes = analysis.notes;

    const supabase = createAdminClient();
    const updatePayload = {
      ai_summary: analysis.summary,
      ai_keywords: analysis.keywords.slice(0, 10),
      troubleshooting_notes: notes,
      updated_at: new Date().toISOString(),
    };
    // @ts-expect-error - Supabase Update 타입 추론 이슈
    const { error } = await supabase.from("posts").update(updatePayload).eq("id", postId);

    if (error) {
      console.error("Recipe analyze: DB update failed", error);
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      postId,
      summary: analysis.summary,
      keywordsCount: analysis.keywords.length,
      notesCount: notes.length,
    });
  } catch (err) {
    console.error("Recipe analyze error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
