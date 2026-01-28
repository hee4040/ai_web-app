"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecipeCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  isLoggedIn?: boolean;
  initialBookmarked?: boolean;
}

export function RecipeCard({
  id,
  title,
  description,
  category,
  tags,
  createdAt,
  isLoggedIn = false,
  initialBookmarked = false,
}: RecipeCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };
  const categoryColors: Record<string, string> = {
    Git: "bg-orange-500/15 text-orange-600 border-orange-500/20",
    Docker: "bg-blue-500/15 text-blue-600 border-blue-500/20",
    ROS: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
    Kubernetes: "bg-cyan-500/15 text-cyan-600 border-cyan-500/20",
    Python: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
  };

  return (
    <Link
      href={`/recipe/${id}`}
      className="group block rounded-lg border border-border bg-card p-5 transition-colors hover:border-muted-foreground/30 hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-card-foreground">{title}</h3>
              <Badge
                variant="outline"
                className={`text-xs font-medium ${categoryColors[category] || "bg-muted text-muted-foreground border-border"}`}
              >
                {category}
              </Badge>
            </div>
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleBookmarkClick}
              >
                <Bookmark
                  className={`h-4 w-4 ${isBookmarked ? "fill-current text-foreground" : "text-muted-foreground"}`}
                />
              </Button>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">{createdAt}</span>
      </div>
    </Link>
  );
}
