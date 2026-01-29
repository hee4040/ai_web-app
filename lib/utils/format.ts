/**
 * 날짜/텍스트 포맷팅 유틸리티
 */

/**
 * 날짜를 포맷된 문자열로 변환
 * 예: "Jan 25, 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
