"use client";

import { useState, useMemo } from "react";
import { CategoryTabs } from "@/components/domain/recipe/category-tabs";
import { SortDropdown } from "@/components/domain/recipe/sort-dropdown";
import { TagFilter } from "@/components/domain/recipe/tag-filter";
import { RecipeCard } from "@/components/domain/recipe/recipe-card";

// TODO: Replace with actual data from Supabase
const recipes = [
  {
    id: 1,
    title: "Git Configuration for Team Development",
    description:
      "Standard Git configuration setup with hooks, branch protection rules, and commit conventions for collaborative development workflows.",
    category: "Git",
    tags: ["macOS", "Git 2.40+", "Bash"],
    createdAt: "Jan 25, 2026",
  },
  {
    id: 2,
    title: "Docker Development Environment",
    description:
      "Multi-stage Docker setup with hot reloading, volume mounts, and optimized build caching for Node.js and Python applications.",
    category: "Docker",
    tags: ["Linux", "Docker 24+", "Compose v2"],
    createdAt: "Jan 24, 2026",
  },
  {
    id: 3,
    title: "ROS2 Humble Desktop Setup",
    description:
      "Complete ROS2 Humble installation with workspace configuration, colcon build tools, and common robotics packages pre-configured.",
    category: "ROS",
    tags: ["Ubuntu 22.04", "ROS2 Humble", "Python 3.10"],
    createdAt: "Jan 22, 2026",
  },
  {
    id: 4,
    title: "Kubernetes Local Development",
    description:
      "Kind cluster setup with ingress, cert-manager, and local registry for testing Kubernetes manifests before production deployment.",
    category: "Kubernetes",
    tags: ["Linux/macOS", "Kind 0.20+", "kubectl"],
    createdAt: "Jan 20, 2026",
  },
  {
    id: 5,
    title: "Python Virtual Environment",
    description:
      "Poetry-based Python environment with pre-commit hooks, type checking, and automated dependency updates for data science projects.",
    category: "Python",
    tags: ["Cross-platform", "Python 3.11+", "Poetry"],
    createdAt: "Jan 18, 2026",
  },
  {
    id: 6,
    title: "Git LFS for Large Files",
    description:
      "Git Large File Storage configuration for repositories with binary assets, models, and datasets exceeding standard size limits.",
    category: "Git",
    tags: ["Cross-platform", "Git LFS 3.0+", "Bash"],
    createdAt: "Jan 15, 2026",
  },
  {
    id: 7,
    title: "Docker GPU Passthrough",
    description:
      "NVIDIA GPU container toolkit setup for machine learning workloads with CUDA support and TensorRT optimization.",
    category: "Docker",
    tags: ["Ubuntu 22.04", "Docker 24+", "CUDA 12"],
    createdAt: "Jan 12, 2026",
  },
  {
    id: 8,
    title: "ROS2 Gazebo Simulation",
    description:
      "Gazebo Fortress simulation environment integrated with ROS2 for robot testing, sensor simulation, and algorithm validation.",
    category: "ROS",
    tags: ["Ubuntu 22.04", "Gazebo Fortress", "ROS2 Iron"],
    createdAt: "Jan 10, 2026",
  },
];

const categories = ["All", "Git", "Docker", "ROS", "Kubernetes", "Python"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // TODO: Replace with actual auth state from useAuth hook
  const isLoggedIn = false;

  // 모든 레시피에서 사용 중인 태그 목록 (중복 제거)
  const availableTags = useMemo(() => {
    const allTags = recipes.flatMap((recipe) => recipe.tags);
    return Array.from(new Set(allTags)).sort();
  }, []);

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // 카테고리 필터 (태그 없어도 동작)
    if (activeCategory !== "All") {
      filtered = recipes.filter((recipe) => recipe.category === activeCategory);
    }

    // 태그 필터 (선택된 태그가 모두 포함된 레시피만)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((recipe) =>
        selectedTags.every((tag) => recipe.tags.includes(tag))
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return sorted;
  }, [activeCategory, sortBy, selectedTags]);

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
          {filteredAndSortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              category={recipe.category}
              tags={recipe.tags}
              createdAt={recipe.createdAt}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>

        {filteredAndSortedRecipes.length === 0 && (
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
