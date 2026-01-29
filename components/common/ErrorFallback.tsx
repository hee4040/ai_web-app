"use client";

import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface ErrorFallbackProps {
  /** 화면에 표시할 제목 */
  title?: string;
  /** 화면에 표시할 부가 설명 */
  description?: string;
  /** 메인으로 가기 버튼 라벨 */
  homeButtonLabel?: string;
  /** 다시 시도 버튼 클릭 시 호출 (에러 바운더리 reset). 없으면 버튼 미표시 */
  onRetry?: () => void;
  /** 추가 클래스명 */
  className?: string;
  /** 글로벌 에러용: true면 Link 대신 a + window.location 사용 (root layout 없음) */
  usePlainLink?: boolean;
}

const defaultTitle = "문제가 발생했어요";
const defaultDescription =
  "일시적인 오류일 수 있어요. 메인으로 돌아가서 다시 시도해 주세요.";
const defaultHomeLabel = "메인으로 돌아가기";

export function ErrorFallback({
  title = defaultTitle,
  description = defaultDescription,
  homeButtonLabel = defaultHomeLabel,
  onRetry,
  className,
  usePlainLink = false,
}: ErrorFallbackProps) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              {homeButtonLabel}
            </Link>
          </Button>

          {onRetry && (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
