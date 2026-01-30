"use client";

import { useState, useRef, useEffect } from "react";
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
import { Loader2, Sparkles, Zap, Send, Bot, User } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: "google" | "groq";
  responseTime?: number;
}

interface MultiEngineChatProps {
  category: string;
  onResponse?: (response: string) => void;
  placeholder?: string;
}

type AIProvider = "google" | "groq";

export function MultiEngineChat({
  category,
  onResponse,
  placeholder = "메시지를 입력하세요...",
}: MultiEngineChatProps) {
  const [provider, setProvider] = useState<AIProvider>("google");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/multi-engine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          provider,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.quotaExceeded) {
          toast.error(data.error, {
            duration: 5000,
            description: "Groq 엔진으로 변경하여 다시 시도해보세요.",
          });
        } else {
          throw new Error(data.error || "AI 응답 생성에 실패했습니다.");
        }
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        return;
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        provider,
        responseTime: data.responseTime,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (onResponse) onResponse(data.response);

      toast.success(
        `${provider === "google" ? "Google Gemini" : "Groq Llama"} · ${data.responseTime}ms`
      );
    } catch (error: unknown) {
      console.error("❌ AI 요청 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "AI 요청에 실패했습니다."
      );
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full min-h-[480px] flex-col rounded-xl border bg-card overflow-hidden">
      {/* 상단: 엔진 선택 */}
      <div className="flex shrink-0 items-center justify-between border-b bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">AI 어시스턴트</span>
        </div>
        <Select
          value={provider}
          onValueChange={(value: string) => setProvider(value as AIProvider)}
          disabled={loading}
        >
          <SelectTrigger className="w-[160px] border-0 bg-background shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                Google Gemini
              </span>
            </SelectItem>
            <SelectItem value="groq">
              <span className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-orange-500" />
                Groq (Llama)
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 대화 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">무엇이든 물어보세요</p>
            <p className="mt-1 text-xs">
              Google Gemini 또는 Groq 엔진으로 답변해 드려요
            </p>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="flex max-w-[85%] items-end gap-2">
                <div className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-start">
              <div className="flex max-w-[85%] items-end gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl rounded-bl-md border bg-muted/50 px-4 py-2.5 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.responseTime != null && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {msg.responseTime}ms
                      {msg.provider && (
                        <span className="ml-1">
                          · {msg.provider === "google" ? "Gemini" : "Groq"}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] items-end gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border bg-muted/50 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">답변 생성 중...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="shrink-0 border-t bg-background p-3">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            rows={1}
            className="min-h-[44px] max-h-32 resize-none rounded-2xl border-2 px-4 py-3 text-base focus-visible:ring-2"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
