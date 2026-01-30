import { ErrorFallback } from "@/components/common/ErrorFallback";

/**
 * 404 Not Found 전역 처리.
 * 존재하지 않는 경로 접근 시 부드러운 메시지와 메인으로 돌아가기 버튼을 표시합니다.
 */
export default function NotFound() {
  return (
    <ErrorFallback
      title="페이지를 찾을 수 없어요"
      description="요청하신 주소가 없거나 변경되었을 수 있어요. 메인으로 돌아가서 다시 이용해 주세요."
      homeButtonLabel="메인으로 돌아가기"
    />
  );
}
