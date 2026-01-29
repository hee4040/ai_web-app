"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryTabs } from "@/components/domain/recipe/category-tabs";
import { SortDropdown } from "@/components/domain/recipe/sort-dropdown";
import { TagFilter } from "@/components/domain/recipe/tag-filter";
import { RecipeCard } from "@/components/domain/recipe/recipe-card";
import type { RecipeCardItem } from "@/types/recipe";

interface HomeClientProps {
  categories: string[];
  initialRecipes: RecipeCardItem[];
  initialCategory: string;
  initialSort: string;
  initialTags: string[];
}

export function HomeClient({
  categories,
  initialRecipes,
  initialCategory,
  initialSort,
  initialTags,
}: HomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  // URL 파라미터 업데이트
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (activeCategory !== "All") {
      params.set("category", activeCategory);
    } else {
      params.delete("category");
    }

    if (sortBy !== "latest") {
      params.set("sort", sortBy);
    } else {
      params.delete("sort");
    }

    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }

    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    router.push(newUrl, { scroll: false });
  }, [activeCategory, sortBy, selectedTags, router, searchParams]);

  // 모든 레시피에서 사용 중인 태그 목록 (중복 제거)
  const availableTags = useMemo(() => {
    const allTags = initialRecipes.flatMap((recipe) => recipe.tags);
    return Array.from(new Set(allTags)).sort();
  }, [initialRecipes]);

  // 태그 필터링만 클라이언트에서 처리 (카테고리와 정렬은 서버에서 처리됨)
  const filteredRecipes = useMemo(() => {
    if (selectedTags.length === 0) {
      return initialRecipes;
    }

    return initialRecipes.filter((recipe) =>
      selectedTags.every((tag) => recipe.tags.includes(tag))
    );
  }, [initialRecipes, selectedTags]);

  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            <SortDropdown value={sortBy} onValueChange={setSortBy} />
          </div>

          {/* Tag Filter */}
          <TagFilter
            selectedTags={selectedTags}
            availableTags={availableTags}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
          />
        </div>

        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              category={recipe.category}
              tags={recipe.tags}
              createdAt={recipe.createdAt}
            />
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">
              {selectedTags.length > 0
                ? "No recipes found matching the selected tags."
                : "No recipes found for this category."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
