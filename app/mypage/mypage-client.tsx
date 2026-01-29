"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pencil,
  Trash2,
  Globe,
  Lock,
  Bookmark,
  FileText,
  ExternalLink,
} from "lucide-react";
import { deleteRecipe, toggleRecipeVisibility } from "./actions";
import type { MyRecipeItem } from "@/types/recipe";

interface BookmarkedRecipe {
  id: number;
  title: string;
  category: string;
  tags: string[];
  author: string;
}

interface MyPageClientProps {
  myRecipes: MyRecipeItem[];
  bookmarkedRecipes: BookmarkedRecipe[];
}

const categoryColors: Record<string, string> = {
  Git: "bg-orange-500/15 text-orange-600 border-orange-500/20",
  Docker: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  ROS: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  Kubernetes: "bg-cyan-500/15 text-cyan-600 border-cyan-500/20",
  Python: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
};

export function MyPageClient({
  myRecipes,
  bookmarkedRecipes,
}: MyPageClientProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [localRecipes, setLocalRecipes] = useState(myRecipes);

  const handleToggleVisibility = async (id: number) => {
    const result = await toggleRecipeVisibility(id);
    if (result.success) {
      setLocalRecipes((recipes) =>
        recipes.map((recipe) =>
          recipe.id === id
            ? { ...recipe, isPublic: result.isPublic ?? !recipe.isPublic }
            : recipe
        )
      );
      router.refresh();
    }
  };

  const handleDelete = async (id: number) => {
    const result = await deleteRecipe(id);
    if (result.success) {
      setLocalRecipes((recipes) => recipes.filter((recipe) => recipe.id !== id));
      setDeleteTarget(null);
      router.refresh();
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-8">
      <h1 className="mb-8 text-2xl font-semibold text-foreground">My Page</h1>

      {/* My Recipes Section */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground">My Recipes</h2>
          <span className="text-sm text-muted-foreground">
            ({localRecipes.length})
          </span>
        </div>

        {localRecipes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              You haven&apos;t written any recipes yet
            </p>
            <p className="mb-4 text-xs text-muted-foreground/70">
              Share your environment setup knowledge with the community
            </p>
            <Button size="sm" asChild>
              <Link href="/recipes/create">Create your first recipe</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {localRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="font-semibold text-card-foreground hover:underline"
                      >
                        {recipe.title}
                      </Link>
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
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-1">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {recipe.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {/* Visibility Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVisibility(recipe.id)}
                      className={`gap-1.5 bg-transparent text-xs ${
                        recipe.isPublic
                          ? "text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                          : "text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {recipe.isPublic ? (
                        <>
                          <Globe className="h-3.5 w-3.5" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          Private
                        </>
                      )}
                    </Button>

                    {/* Edit and Delete Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link href={`/recipes/${recipe.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(recipe.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    Created {recipe.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bookmarked Recipes Section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground">
            Bookmarked Recipes
          </h2>
          <span className="text-sm text-muted-foreground">
            ({bookmarkedRecipes.length})
          </span>
        </div>

        {bookmarkedRecipes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              No bookmarked recipes yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Save recipes you find useful for quick access later
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarkedRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30 hover:bg-accent/50"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-card-foreground group-hover:underline">
                      {recipe.title}
                    </span>
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
                  <div className="flex flex-wrap items-center gap-2">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground">
                      by {recipe.author}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recipe? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
