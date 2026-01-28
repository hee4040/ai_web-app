"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
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
import { Header } from "@/components/header";

interface Step {
  id: number;
  description: string;
  image: string | null;
}

export default function NewRecipePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, description: "", image: null },
  ]);
  const [troubleshooting, setTroubleshooting] = useState("");

  const addStep = () => {
    const newId = Math.max(...steps.map((s) => s.id), 0) + 1;
    setSteps([...steps, { id: newId, description: "", image: null }]);
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
      const imageUrl = URL.createObjectURL(file);
      setSteps(steps.map((s) => (s.id === id ? { ...s, image: imageUrl } : s)));
    }
  };

  const removeImage = (id: number) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, image: null } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      title,
      description,
      category,
      tags: tags.split(",").map((t) => t.trim()),
      steps,
      troubleshooting,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to recipes
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Create New Recipe
          </h1>
          <p className="mt-1 text-muted-foreground">
            Share your environment setup with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Basic Information */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Basic Information
            </h2>

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Setting up Git with SSH on Ubuntu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what this recipe covers..."
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
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Git">Git</SelectItem>
                  <SelectItem value="Docker">Docker</SelectItem>
                  <SelectItem value="ROS">ROS</SelectItem>
                  <SelectItem value="Kubernetes">Kubernetes</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">Environment Tags</Label>
              <Input
                id="tags"
                placeholder="e.g., Ubuntu 22.04, Git 2.40, SSH"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>
          </section>

          {/* Steps */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Steps
            </h2>

            <div className="flex flex-col gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between mb-3">
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
                      placeholder="Describe this step..."
                      value={step.description}
                      onChange={(e) =>
                        updateStepDescription(step.id, e.target.value)
                      }
                      rows={3}
                    />

                    {step.image ? (
                      <div className="relative">
                        <img
                          src={step.image || "/placeholder.svg"}
                          alt={`Step ${index + 1}`}
                          className="rounded-md border border-border max-h-48 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(step.id)}
                          className="absolute top-2 right-2 h-8 w-8 p-0"
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
              Add Step
            </Button>
          </section>

          {/* Troubleshooting */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Troubleshooting
            </h2>

            <div className="flex flex-col gap-2">
              <Label htmlFor="troubleshooting">Common Issues & Solutions</Label>
              <Textarea
                id="troubleshooting"
                placeholder="Describe any errors you encountered and how you resolved them..."
                value={troubleshooting}
                onChange={(e) => setTroubleshooting(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Help others avoid common pitfalls by documenting issues you
                faced
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="ghost"
              asChild
              className="text-muted-foreground"
            >
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit">Publish Recipe</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
