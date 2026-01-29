"use client";

import { Badge } from "@/components/ui/badge";
import { StepCard } from "@/components/domain/recipe/step-card";
import { TroubleshootingSection } from "@/components/domain/recipe/troubleshooting-section";
import { BookmarkButton } from "@/components/domain/recipe/bookmark-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { RecipeDetail } from "@/types/recipe";

interface RecipeDetailViewProps {
  recipe: RecipeDetail;
  initialBookmarked?: boolean;
}

const categoryColors: Record<string, string> = {
  Git: "bg-orange-500/15 text-orange-600 border-orange-500/20",
  Docker: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  ROS: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  Kubernetes: "bg-cyan-500/15 text-cyan-600 border-cyan-500/20",
  Python: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
};

export function RecipeDetailView({
  recipe,
  initialBookmarked = false,
}: RecipeDetailViewProps) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to recipes
      </Link>

      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {recipe.title}
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${
                categoryColors[recipe.category] ||
                "bg-muted text-muted-foreground border-border"
              }`}
            >
              {recipe.category}
            </Badge>
          </div>
          <BookmarkButton
            recipeId={recipe.id}
            initialBookmarked={initialBookmarked}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="leading-relaxed text-muted-foreground">
          {recipe.description}
        </p>

        <p className="text-sm text-muted-foreground">
          Created {recipe.createdAt}
        </p>
      </header>

      <section className="mb-12 space-y-6">
        <h2 className="text-xl font-semibold text-foreground">
          Step-by-Step Guide
        </h2>
        <div className="space-y-4">
          {recipe.steps.map((step, index) => (
            <StepCard
              key={step.id}
              stepNumber={index + 1}
              content={step.content}
              imageUrl={step.imageUrl || undefined}
            />
          ))}
        </div>
      </section>

      {recipe.troubleshooting.aiSummary && (
        <TroubleshootingSection
          aiSummary={recipe.troubleshooting.aiSummary}
          notes={recipe.troubleshooting.notes}
        />
      )}
    </main>
  );
}
