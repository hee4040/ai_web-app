"use client";

import { cn } from "@/lib/utils/cn";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          className={cn(
            "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeCategory === category
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
