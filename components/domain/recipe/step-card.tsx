import Image from "next/image";

interface StepCardProps {
  stepNumber: number;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function StepCard({
  stepNumber,
  content,
  imageUrl,
  imageAlt,
}: StepCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {stepNumber}
        </div>
        <div className="flex-1 space-y-4">
          <p className="leading-relaxed text-card-foreground">{content}</p>
          {imageUrl && (
            <div className="overflow-hidden rounded-md border border-border">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={imageAlt || `Step ${stepNumber} illustration`}
                width={800}
                height={450}
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
