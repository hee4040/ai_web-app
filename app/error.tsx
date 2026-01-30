"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/common/ErrorFallback";

/**
 * 앱 세그먼트 오류 바운더리.
 * 레이아웃(Header 등)은 유지된 채, children에서 발생한 오류만 이 화면으로 대체됩니다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 개발 시 콘솔에 오류 로그 출력 (선택사항)
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Boundary]", error);
    }
  }, [error]);

  return (
    <ErrorFallback
      title="문제가 발생했어요"
      description="일시적인 오류일 수 있어요. 메인으로 돌아가거나 다시 시도해 주세요."
      homeButtonLabel="메인으로 돌아가기"
      onRetry={reset}
    />
  );
}
