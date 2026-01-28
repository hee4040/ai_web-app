"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkButtonProps {
  recipeId: number;
  initialBookmarked?: boolean;
}

export function BookmarkButton({
  recipeId,
  initialBookmarked = false,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Phase 2 - 북마크 API 연동
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={handleBookmarkClick}
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
