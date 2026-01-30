/**
 * parseAIRecipeResponse 검증 (lib/ai/recipe-analyze-parse.ts와 동일 로직)
 * 실행: node --test lib/ai/__tests__/recipe-analyze-parse.test.mjs
 */
import { describe, it } from "node:test";
import assert from "node:assert";

function parseAIRecipeResponse(text) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    const trimmed = text.slice(start, end + 1);
    const parsed = JSON.parse(trimmed);
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

describe("parseAIRecipeResponse", () => {
  it("유효한 JSON 텍스트를 RecipeAnalysis로 파싱한다", () => {
    const text = `{
      "summary": "Ubuntu에서 Git SSH 키 설정 방법 요약",
      "keywords": ["Git", "SSH", "Ubuntu", "GitHub", "키 설정"],
      "notes": [
        { "id": 1, "title": "권한 오류", "description": "chmod 600 ~/.ssh/id_rsa 적용" }
      ]
    }`;
    const result = parseAIRecipeResponse(text);
    assert.ok(result !== null);
    assert.strictEqual(result.summary, "Ubuntu에서 Git SSH 키 설정 방법 요약");
    assert.deepStrictEqual(result.keywords, ["Git", "SSH", "Ubuntu", "GitHub", "키 설정"]);
    assert.strictEqual(result.notes.length, 1);
    assert.strictEqual(result.notes[0].title, "권한 오류");
    assert.strictEqual(result.notes[0].description, "chmod 600 ~/.ssh/id_rsa 적용");
  });

  it("앞뒤 설명이 붙은 텍스트에서 JSON만 추출해 파싱한다", () => {
    const text = `Here is the analysis:
    {
      "summary": "Docker 환경 설정",
      "keywords": ["Docker", "컨테이너"],
      "notes": []
    }
    End.`;
    const result = parseAIRecipeResponse(text);
    assert.ok(result !== null);
    assert.strictEqual(result.summary, "Docker 환경 설정");
    assert.deepStrictEqual(result.keywords, ["Docker", "컨테이너"]);
    assert.strictEqual(result.notes.length, 0);
  });

  it("summary가 없으면 null을 반환한다", () => {
    const text = `{ "keywords": ["a"], "notes": [] }`;
    const result = parseAIRecipeResponse(text);
    assert.strictEqual(result, null);
  });

  it("keywords가 배열이 아니면 null을 반환한다", () => {
    const text = `{ "summary": "요약", "keywords": "invalid", "notes": [] }`;
    const result = parseAIRecipeResponse(text);
    assert.strictEqual(result, null);
  });

  it("잘못된 JSON이면 null을 반환한다", () => {
    assert.strictEqual(parseAIRecipeResponse("not json"), null);
    assert.strictEqual(parseAIRecipeResponse("{ invalid }"), null);
  });

  it("notes가 null이어도 빈 배열로 정규화한다", () => {
    const text = `{ "summary": "요약", "keywords": ["a"], "notes": null }`;
    const result = parseAIRecipeResponse(text);
    assert.ok(result !== null);
    assert.deepStrictEqual(result.notes, []);
  });
});
