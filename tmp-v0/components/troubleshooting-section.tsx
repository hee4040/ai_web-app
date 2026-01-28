import { Sparkles } from "lucide-react";

interface TroubleshootingNote {
  id: number;
  title: string;
  description: string;
}

interface TroubleshootingSectionProps {
  aiSummary: string;
  notes: TroubleshootingNote[];
}

export function TroubleshootingSection({
  aiSummary,
  notes,
}: TroubleshootingSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Troubleshooting</h2>

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
    </section>
  );
}
