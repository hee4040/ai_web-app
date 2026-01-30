"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toggleBookmark } from "@/app/recipes/[id]/actions";
import { toast } from "sonner";

interface BookmarkButtonProps {
  recipeId: number;
  initialBookmarked?: boolean;
}

export function BookmarkButton({
  recipeId,
  initialBookmarked = false,
}: BookmarkButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmarkClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 비로그인 시 로그인 안내
    if (!user) {
      toast.info("로그인이 필요합니다", {
        description: "북마크 기능을 사용하려면 로그인해주세요.",
        action: {
          label: "로그인",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    setIsLoading(true);
    const result = await toggleBookmark(recipeId);
    if (result.success) {
      setIsBookmarked(result.bookmarked ?? false);
      router.refresh();
      toast.success(
        result.bookmarked ? "북마크에 추가되었습니다" : "북마크에서 제거되었습니다"
      );
    } else {
      toast.error("북마크 처리 중 오류가 발생했습니다");
    }
    setIsLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={handleBookmarkClick}
      disabled={isLoading}
    >
      <Bookmark
        className={`h-4 w-4 ${
          isBookmarked
            ? "fill-current text-foreground"
            : "text-muted-foreground"
        }`}
      />
      <span className="sr-only">
        {isBookmarked ? "Remove bookmark" : "Add bookmark"}
      </span>
    </Button>
  );
}
