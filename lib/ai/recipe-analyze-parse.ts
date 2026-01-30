/**
 * recipe-analyze API에서 AI 응답 텍스트를 RecipeAnalysis 객체로 파싱
 * (테스트 및 검증용으로 분리)
 */

export interface RecipeAnalysis {
  summary: string;
  keywords: string[];
  notes: Array<{ id: number; title: string; description: string }>;
}

export function parseAIRecipeResponse(text: string): RecipeAnalysis | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    const trimmed = text.slice(start, end + 1);
    const parsed = JSON.parse(trimmed) as RecipeAnalysis;
    if (typeof parsed.summary !== "string" || !Array.isArray(parsed.keywords)) {
      return null;
    }
    const notes = Array.isArray(parsed.notes)
      ? parsed.notes.map((n) => ({
          id: Number(n?.id) || 0,
          title: String(n?.title ?? ""),
          description: String(n?.description ?? ""),
        }))
      : [];
    return {
      summary: parsed.summary,
      keywords: parsed.keywords,
      notes,
    };
  } catch {
    return null;
  }
}
