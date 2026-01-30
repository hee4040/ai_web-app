"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TagFilterProps {
  selectedTags: string[];
  availableTags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export function TagFilter({
  selectedTags,
  availableTags,
  onTagAdd,
  onTagRemove,
}: TagFilterProps) {
  const [inputValue, setInputValue] = useState("");

  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.includes(tag)
  );

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글/일본어/중국어 IME 조합 중일 때는 Enter로 태그 추가하지 않음
    // (조합 완료용 Enter와 태그 추가용 Enter 구분)
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      e.stopPropagation(); // Enter가 Select로 전파되어 드롭다운이 열리며 항목이 선택되는 것 방지
      const tag = inputValue.trim();
      if (!selectedTags.includes(tag)) {
        onTagAdd(tag);
        setInputValue("");
      }
    }
  };

  const handleSelectChange = (value: string) => {
    if (value && !selectedTags.includes(value)) {
      onTagAdd(value);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      {/* 1행: Tags 라벨 + 선택된 태그 칩 (넘치면 줄바꿈) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Tags:</span>
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1.5 px-2.5 py-1 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onTagRemove(tag)}
              className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              aria-label={`Remove ${tag} tag`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* 2행: 태그 고르는 상자 (항상 아래 줄이라 화면에서 잘리지 않음) */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="text"
          placeholder="Type tag and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="h-7 min-w-0 flex-1 text-xs sm:w-[180px] sm:flex-none"
        />
        {unselectedTags.length > 0 && (
          <>
            <span className="text-xs text-muted-foreground">or</span>
            <Select value="" onValueChange={handleSelectChange}>
              <SelectTrigger className="h-7 w-[120px] shrink-0 border-border bg-transparent text-xs">
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent
                className="border-border bg-popover"
                position="popper"
                sideOffset={4}
                collisionPadding={8}
              >
                {unselectedTags.map((tag) => (
                  <SelectItem key={tag} value={tag} className="text-xs">
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}
