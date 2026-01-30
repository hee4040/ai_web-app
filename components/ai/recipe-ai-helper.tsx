"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, Zap, Lightbulb } from "lucide-react";

interface RecipeAIHelperProps {
  onSuggestion?: (suggestion: string) => void;
  context?: {
    title?: string;
    description?: string;
    steps?: string[];
  };
}

type AIProvider = "google" | "groq";

const HELPER_PROMPTS = {
  troubleshooting: "이 레시피에서 발생할 수 있는 일반적인 문제와 해결 방법을 알려주세요.",
  improvement: "이 레시피를 개선할 수 있는 방법을 제안해주세요.",
  tags: "이 레시피에 적합한 환경 태그를 추천해주세요.",
  description: "이 레시피에 대한 간단한 설명을 작성해주세요.",
};

export function RecipeAIHelper({ onSuggestion, context }: RecipeAIHelperProps) {
  const [provider, setProvider] = useState<AIProvider>("google");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<keyof typeof HELPER_PROMPTS | "custom">("troubleshooting");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const buildContextualPrompt = (basePrompt: string) => {
    let contextStr = "";
    
    if (context?.title) {
      contextStr += `제목: ${context.title}\n`;
    }
    if (context?.description) {
      contextStr += `설명: ${context.description}\n`;
    }
    if (context?.steps && context.steps.length > 0) {
      contextStr += `단계:\n${context.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n`;
    }

    if (contextStr) {
      return `다음 레시피에 대해 ${basePrompt}\n\n${contextStr}`;
    }
    
    return basePrompt;
  };

  const handleAsk = async () => {
    const promptToUse = selectedPrompt === "custom" 
      ? customPrompt 
      : HELPER_PROMPTS[selectedPrompt];

    if (!promptToUse.trim()) {
      toast.error("질문을 입력하거나 선택해주세요.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const finalPrompt = buildContextualPrompt(promptToUse);

      const res = await fetch("/api/ai/multi-engine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          provider,
          category: "recipe_helper",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.quotaExceeded) {
          toast.error(data.error, {
            duration: 5000,
            description: "Groq 엔진으로 변경하여 다시 시도해보세요.",
          });
          return;
        }
        throw new Error(data.error || "AI 응답 생성에 실패했습니다.");
      }

      setResponse(data.response);
      
      if (onSuggestion) {
        onSuggestion(data.response);
      }

      toast.success(`AI 제안 완료`, {
        description: `${provider === "google" ? "Google Gemini" : "Groq Llama"} | ${data.responseTime}ms`,
      });
    } catch (error: any) {
      console.error("❌ AI 요청 실패:", error);
      toast.error(error.message || "AI 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold">AI 레시피 도우미</h3>
      </div>

      {/* AI 엔진 선택 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">엔진:</label>
        <Select
          value={provider}
          onValueChange={(value) => setProvider(value as AIProvider)}
          disabled={loading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>Google Gemini</span>
              </div>
            </SelectItem>
            <SelectItem value="groq">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>Groq (Llama)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 프롬프트 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">질문 유형:</label>
        <Select
          value={selectedPrompt}
          onValueChange={(value) => setSelectedPrompt(value as any)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="troubleshooting">문제 해결 방법</SelectItem>
            <SelectItem value="improvement">개선 제안</SelectItem>
            <SelectItem value="tags">태그 추천</SelectItem>
            <SelectItem value="description">설명 작성</SelectItem>
            <SelectItem value="custom">직접 입력</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 커스텀 프롬프트 입력 */}
      {selectedPrompt === "custom" && (
        <Textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="AI에게 질문하고 싶은 내용을 입력하세요..."
          disabled={loading}
          rows={3}
        />
      )}

      {/* 질문 버튼 */}
      <Button
        onClick={handleAsk}
        disabled={loading || (selectedPrompt === "custom" && !customPrompt.trim())}
        className="w-full"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AI 분석 중...
          </>
        ) : (
          <>
            {provider === "google" ? (
              <Sparkles className="mr-2 h-4 w-4" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            AI에게 물어보기
          </>
        )}
      </Button>

      {/* 응답 표시 */}
      {response && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI 제안:</span>
          </div>
          <div className="rounded-md border bg-muted/50 p-3">
            <p className="text-sm whitespace-pre-wrap">{response}</p>
          </div>
        </div>
      )}
    </div>
  );
}
