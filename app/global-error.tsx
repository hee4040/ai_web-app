"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * 루트 글로벌 오류 바운더리.
 * root layout 자체에서 오류가 나면 이 파일이 전체를 대체하므로
 * <html>, <body>를 직접 정의하고, 공통 레이아웃(Header 등) 없이
 * 부드러운 메시지와 메인으로 돌아가기 버튼만 표시합니다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Global Error Boundary]", error);
    }
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "oklch(0.985 0 0)",
          color: "oklch(0.145 0 0)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            width: "100%",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            문제가 발생했어요
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "oklch(0.45 0 0)",
              marginBottom: "1.5rem",
            }}
          >
            일시적인 오류일 수 있어요. 메인으로 돌아가서 다시 시도해 주세요.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                height: "2.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                backgroundColor: "oklch(0.205 0 0)",
                color: "oklch(0.985 0 0)",
                borderRadius: "0.375rem",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              메인으로 돌아가기
            </Link>

            <button
              type="button"
              onClick={() => reset()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                height: "2.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                backgroundColor: "transparent",
                color: "oklch(0.205 0 0)",
                border: "1px solid oklch(0.90 0 0)",
                borderRadius: "0.375rem",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "oklch(0.96 0 0)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
