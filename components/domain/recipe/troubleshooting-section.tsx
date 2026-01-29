import { Sparkles } from "lucide-react";

interface TroubleshootingNote {
  id: number;
  title: string;
  description: string;
}

interface TroubleshootingSectionProps {
  aiSummary?: string;
  raw?: string;
  notes?: TroubleshootingNote[];
}

export function TroubleshootingSection({
  aiSummary,
  raw,
  notes = [],
}: TroubleshootingSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Troubleshooting</h2>

      {/* AI Summary가 있으면 파란 박스로 표시 */}
      {aiSummary && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/15">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-500">AI Summary</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {aiSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 수동으로 작성한 텍스트가 있으면 별도 섹션으로 표시 */}
      {raw && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-medium text-card-foreground">
            Common Issues & Solutions
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {raw}
          </p>
        </div>
      )}

      {/* Notes가 있으면 카드 리스트로 표시 */}
      {notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <h4 className="mb-2 font-medium text-card-foreground">
                {note.title}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {note.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
