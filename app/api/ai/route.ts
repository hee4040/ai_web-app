import { NextRequest, NextResponse } from "next/server";

// TODO: Implement actual AI API integration
// Phase 1: Mock response for now
// Phase 2: Integrate with actual AI service (OpenAI, Anthropic, etc.)

interface AIRequest {
  troubleshooting: string;
  steps?: Array<{ description: string }>;
  title?: string;
  category?: string;
}

interface AIResponse {
  summary: string;
  keywords: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();

    // TODO: Replace with actual AI API call
    // For now, return mock response
    const mockResponse: AIResponse = {
      summary:
        "This is a mock AI summary. Common issues include configuration errors, permission problems, and dependency conflicts. Ensure all prerequisites are met before proceeding.",
      keywords: [
        "configuration",
        "permissions",
        "dependencies",
        "setup",
        "troubleshooting",
      ],
    };

    // TODO: Save AI result to database (Supabase)
    // await saveAIResult(recipeId, mockResponse);

    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}

// Optional: GET handler for health check
export async function GET() {
  return NextResponse.json(
    { status: "ok", message: "AI API endpoint is available" },
    { status: 200 }
  );
}
