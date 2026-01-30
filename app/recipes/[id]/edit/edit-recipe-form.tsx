"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRecipe } from "./actions";
import type { Category } from "@/types/database";
import type { StepItem } from "@/types/recipe";

interface Step {
  id: number;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  existingImageUrl: string | null;
}

interface TroubleshootingItem {
  id: number;
  title: string;
  description: string;
}

interface EditRecipeFormProps {
  postId: number;
  categories: Category[];
  initialData: {
    title: string;
    description: string;
    category: string;
    tags: string;
    steps: StepItem[];
    troubleshootingNotes: TroubleshootingItem[];
    isPublic: boolean;
  };
}

export function EditRecipeForm({
  postId,
  categories,
  initialData,
}: EditRecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [category, setCategory] = useState(initialData.category);
  const [tags, setTags] = useState(initialData.tags);
  const [steps, setSteps] = useState<Step[]>(
    initialData.steps.map((step, index) => ({
      id: step.id,
      description: step.content,
      imageFile: null,
      imagePreview: null,
      existingImageUrl: step.imageUrl || null,
    }))
  );
  const [troubleshootingItems, setTroubleshootingItems] = useState<
    TroubleshootingItem[]
  >(initialData.troubleshootingNotes);
  const [isPublic, setIsPublic] = useState(initialData.isPublic);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const addStep = () => {
    const newId = Math.max(...steps.map((s) => s.id), 0) + 1;
    setSteps([
      ...steps,
      { id: newId, description: "", imageFile: null, imagePreview: null, existingImageUrl: null },
    ]);
  };

  const removeStep = (id: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== id));
    }
  };

  const updateStepDescription = (id: number, description: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, description } : s)));
  };

  const handleImageUpload = (id: number, file: File | null) => {
    if (file) {
      const imagePreview = URL.createObjectURL(file);
      setSteps(
        steps.map((s) =>
          s.id === id
            ? { ...s, imageFile: file, imagePreview, existingImageUrl: null }
            : s
        )
      );
    }
  };

  const removeImage = (id: number) => {
    setSteps(
      steps.map((s) =>
        s.id === id
          ? { ...s, imageFile: null, imagePreview: null, existingImageUrl: null }
          : s
      )
    );
  };

  const addTroubleshooting = () => {
    const newId = Math.max(0, ...troubleshootingItems.map((t) => t.id)) + 1;
    setTroubleshootingItems([
      ...troubleshootingItems,
      { id: newId, title: "", description: "" },
    ]);
  };

  const removeTroubleshooting = (id: number) => {
    if (troubleshootingItems.length <= 1) return;
    setTroubleshootingItems(troubleshootingItems.filter((t) => t.id !== id));
  };

  const updateTroubleshootingItem = (
    id: number,
    field: "title" | "description",
    value: string
  ) => {
    setTroubleshootingItems(
      troubleshootingItems.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("tags", tags);
      formData.append(
        "troubleshootingNotes",
        JSON.stringify(troubleshootingItems)
      );
      formData.append("isPublic", isPublic.toString());
      formData.append("stepCount", steps.length.toString());

      steps.forEach((step, index) => {
        formData.append(`step-${index}-content`, step.description);
        if (step.imageFile) {
          formData.append(`step-${index}-image`, step.imageFile);
        } else if (step.existingImageUrl) {
          formData.append(
            `step-${index}-existing-image`,
            step.existingImageUrl
          );
        }
      });

      const result = await updateRecipe(postId, formData);

      if (result && result.success) {
        router.push(`/recipes/${postId}`);
      } else {
        setIsSubmitting(false);
        console.error("Failed to update recipe:", result?.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-8">
      <div className="mb-8">
        <Link
          href={`/recipes/${postId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to recipe
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Edit Recipe
        </h1>
        <p className="mt-1 text-muted-foreground">
          환경 설정 레시피를 수정하세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Basic Information */}
        <section className="flex flex-col gap-4">
          <h2 className="border-b border-border pb-2 text-lg font-semibold text-foreground">
            Basic Information
          </h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="예: Ubuntu에서 Git SSH 설정하기"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              placeholder="이 레시피에서 다루는 내용을 간단히 적어주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Environment Tags</Label>
            <Input
              id="tags"
              placeholder="예: Ubuntu 22.04, Git 2.40, SSH"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              태그는 쉼표(,)로 구분해서 입력하세요
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Macke this recipe public
            </Label>
          </div>
        </section>

        {/* Steps */}
        <section className="flex flex-col gap-4">
          <h2 className="border-b border-border pb-2 text-lg font-semibold text-foreground">
            Steps
          </h2>

          <div className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(step.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Textarea
                    placeholder="이 단계에서 할 일을 적어주세요"
                    value={step.description}
                    onChange={(e) =>
                      updateStepDescription(step.id, e.target.value)
                    }
                    rows={3}
                    required
                  />

                  {step.imagePreview ? (
                    <div className="relative">
                      <img
                        src={step.imagePreview}
                        alt={`Step ${index + 1}`}
                        className="max-h-48 rounded-md border border-border object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(step.id)}
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : step.existingImageUrl ? (
                    <div className="relative">
                      <img
                        src={step.existingImageUrl}
                        alt={`Step ${index + 1}`}
                        className="max-h-48 rounded-md border border-border object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(step.id)}
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
                      <ImagePlus className="h-4 w-4" />
                      Add image (optional)
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => {
                          fileInputRefs.current[step.id] = el;
                        }}
                        onChange={(e) =>
                          handleImageUpload(
                            step.id,
                            e.target.files?.[0] || null
                          )
                        }
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addStep}
            className="gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Add step
          </Button>
        </section>

        {/* Troubleshooting */}
        <section className="flex flex-col gap-4">
          <h2 className="border-b border-border pb-2 text-lg font-semibold text-foreground">
            Troubleshooting
          </h2>
          <p className="text-xs text-muted-foreground">
            겪었던 문제와 해결 방법을 여러 개 추가할 수 있습니다.
          </p>

          <div className="flex flex-col gap-4">
            {troubleshootingItems.map((item, index) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  {troubleshootingItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTroubleshooting(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <Label>제목 (선택)</Label>
                    <Input
                      placeholder="예: 권한 오류"
                      value={item.title}
                      onChange={(e) =>
                        updateTroubleshootingItem(
                          item.id,
                          "title",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>내용</Label>
                    <Textarea
                      placeholder="발생한 문제와 해결 방법을 적어주세요..."
                      value={item.description}
                      onChange={(e) =>
                        updateTroubleshootingItem(
                          item.id,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addTroubleshooting}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Troubleshooting
            </Button>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="ghost"
            asChild
            className="text-muted-foreground"
            disabled={isSubmitting}
          >
            <Link href={`/recipes/${postId}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Recipe"}
          </Button>
        </div>
      </form>
    </main>
  );
}
