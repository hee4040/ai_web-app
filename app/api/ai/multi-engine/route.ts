import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

type AIResponseInsert = Database["public"]["Tables"]["ai_responses"]["Insert"];

// AI 요청 타입
interface MultiEngineAIRequest {
  prompt: string;
  provider: "google" | "groq";
  category: string;
  userId?: string;
}

// AI 응답 타입
interface MultiEngineAIResponse {
  response: string;
  provider: "google" | "groq";
  responseTime: number;
  saved: boolean;
}

// 시스템 프롬프트 (비용 절감을 위한 간결한 답변 유도)
const SYSTEM_PROMPT = `당신은 간결하고 핵심적인 답변을 제공하는 AI 어시스턴트입니다.
- 핵심만 간결하게 답변하세요
- 불필요한 부연 설명은 생략하세요
- 구체적이고 실용적인 정보를 제공하세요
- 답변은 300 토큰 이내로 제한됩니다`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 요청 본문 파싱
    const body: MultiEngineAIRequest = await request.json();
    const { prompt, provider, category, userId } = body;

    // 입력 검증
    if (!prompt || !provider || !category) {
      return NextResponse.json(
        { error: "prompt, provider, category는 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (provider !== "google" && provider !== "groq") {
      return NextResponse.json(
        { error: "provider는 'google' 또는 'groq'만 가능합니다." },
        { status: 400 }
      );
    }

    // 환경 변수 확인
    if (provider === "google" && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    if (provider === "groq" && !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // AI 모델 선택 (Google은 v1beta에서 버전 명시 모델명 사용 권장)
    const model =
      provider === "google"
        ? google("gemini-2.0-flash") // 비용 효율적 (gemini-1.5-flash 단축명 미지원 시 대체)
        : groq("llama-3.3-70b-versatile"); // 압도적 속도

    console.log(`🤖 AI 엔진 호출 시작: ${provider}`);

    // AI 텍스트 생성
    let aiResponse: string;
    try {
      const result = await generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt,
        maxOutputTokens: 300, // 비용 절감을 위한 토큰 제한
      });

      aiResponse = result.text;
    } catch (aiError: any) {
      console.error(`❌ AI 엔진 에러 (${provider}):`, aiError);

      // Google 할당량 초과 에러 처리
      if (
        provider === "google" &&
        (aiError.message?.includes("quota") ||
          aiError.message?.includes("RESOURCE_EXHAUSTED"))
      ) {
        return NextResponse.json(
          {
            error:
              "구글 할당량이 초과되었습니다. Groq 엔진으로 변경하여 시도해 보세요.",
            quotaExceeded: true,
          },
          { status: 429 }
        );
      }

      // 기타 AI 에러
      return NextResponse.json(
        { error: `AI 응답 생성 실패: ${aiError.message}` },
        { status: 500 }
      );
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ AI 응답 완료 (${provider}): ${responseTime}ms`);

    // Supabase에 저장
    let saved = false;
    try {
      const supabase = await createClient();

      // 현재 사용자 정보 가져오기 (userId가 없는 경우)
      let finalUserId = userId;
      if (!finalUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        finalUserId = user?.id;
      }

      // ai_responses 테이블에 저장 (Supabase 클라이언트 타입 동기화 전까지 단언 사용)
      const row: AIResponseInsert = {
        user_id: finalUserId ?? null,
        prompt,
        response: aiResponse,
        provider,
        category,
        response_time_ms: responseTime,
      };
      const { error: dbError } = await supabase.from("ai_responses").insert(row as any);

      if (dbError) {
        console.error("❌ DB 저장 실패:", dbError);
      } else {
        saved = true;
        console.log("💾 DB 저장 완료");
      }
    } catch (dbError) {
      console.error("❌ DB 저장 중 예외 발생:", dbError);
    }

    // 성공 응답
    const response: MultiEngineAIResponse = {
      response: aiResponse,
      provider,
      responseTime,
      saved,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("❌ API 에러:", error);
    return NextResponse.json(
      { error: `서버 에러: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET: 헬스 체크 및 설정 확인
export async function GET() {
  const googleConfigured = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const groqConfigured = !!process.env.GROQ_API_KEY;

  return NextResponse.json(
    {
      status: "ok",
      message: "Multi-Engine AI API is available",
      providers: {
        google: googleConfigured ? "configured" : "not configured",
        groq: groqConfigured ? "configured" : "not configured",
      },
    },
    { status: 200 }
  );
}
