import { MultiEngineChat } from "@/components/ai/multi-engine-chat";

export default function AITestPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 space-y-1">
          <h1 className="text-2xl font-bold">AI 채팅</h1>
          <p className="text-sm text-muted-foreground">
            Google Gemini 또는 Groq과 대화해 보세요. 메시지는 DB에 저장됩니다.
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <MultiEngineChat
            category="test"
            placeholder="메시지를 입력하세요... (Enter로 전송)"
          />
        </div>
      </div>
    </div>
  );
}
