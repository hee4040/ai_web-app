import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { StepCard } from "@/components/step-card";
import { TroubleshootingSection } from "@/components/troubleshooting-section";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const recipeData = {
  id: 1,
  title: "Git Configuration for Team Development",
  description:
    "Standard Git configuration setup with hooks, branch protection rules, and commit conventions for collaborative development workflows. This guide covers everything from initial setup to advanced team collaboration patterns.",
  category: "Git",
  tags: ["macOS", "Git 2.40+", "Bash"],
  createdAt: "Jan 25, 2026",
  steps: [
    {
      id: 1,
      content:
        "Install Git using Homebrew. Open your terminal and run: brew install git. This will install the latest version of Git along with all necessary dependencies.",
    },
    {
      id: 2,
      content:
        "Configure your global Git identity. Set your name and email that will be associated with your commits: git config --global user.name \"Your Name\" and git config --global user.email \"your@email.com\".",
      imageUrl: "/placeholder-git-config.jpg",
    },
    {
      id: 3,
      content:
        "Set up SSH keys for secure authentication with remote repositories. Generate a new SSH key: ssh-keygen -t ed25519 -C \"your@email.com\". Then add it to your SSH agent.",
    },
    {
      id: 4,
      content:
        "Configure Git hooks for your repository. Create a .githooks directory and set up pre-commit hooks for linting and formatting. Update the hooks path: git config core.hooksPath .githooks.",
      imageUrl: "/placeholder-hooks.jpg",
    },
    {
      id: 5,
      content:
        "Set up branch protection rules in your Git hosting platform (GitHub/GitLab). Require pull request reviews, status checks, and prevent force pushes to main/master branches.",
    },
  ],
  troubleshooting: {
    aiSummary:
      "Most issues with this setup stem from SSH key permissions, conflicting global configs, or hook execution permissions. Ensure your SSH key has 600 permissions, check for local .gitconfig files that might override global settings, and make sure hook scripts are executable (chmod +x).",
    notes: [
      {
        id: 1,
        title: "SSH Permission Denied",
        description:
          "If you see 'Permission denied (publickey)', ensure your SSH key is added to the agent with ssh-add and that the public key is registered with your Git provider. Check key permissions with ls -la ~/.ssh/.",
      },
      {
        id: 2,
        title: "Hooks Not Running",
        description:
          "Git hooks must be executable. Run chmod +x .githooks/* to fix permission issues. Also verify the hooks path is set correctly with git config --get core.hooksPath.",
      },
      {
        id: 3,
        title: "Global Config Not Applied",
        description:
          "Local repository configs override global settings. Check for a local .git/config file that might have conflicting values. Use git config --list --show-origin to see all config sources.",
      },
    ],
  },
};

const categoryColors: Record<string, string> = {
  Git: "bg-orange-500/15 text-orange-600 border-orange-500/20",
  Docker: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  ROS: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  Kubernetes: "bg-cyan-500/15 text-cyan-600 border-cyan-500/20",
  Python: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
};

export default function RecipeDetailPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to recipes
        </Link>

        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {recipeData.title}
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${categoryColors[recipeData.category] || "bg-muted text-muted-foreground border-border"}`}
            >
              {recipeData.category}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {recipeData.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="leading-relaxed text-muted-foreground">
            {recipeData.description}
          </p>

          <p className="text-sm text-muted-foreground">
            Created {recipeData.createdAt}
          </p>
        </header>

        <section className="mb-12 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Step-by-Step Guide
          </h2>
          <div className="space-y-4">
            {recipeData.steps.map((step) => (
              <StepCard
                key={step.id}
                stepNumber={step.id}
                content={step.content}
                imageUrl={step.imageUrl}
              />
            ))}
          </div>
        </section>

        <TroubleshootingSection
          aiSummary={recipeData.troubleshooting.aiSummary}
          notes={recipeData.troubleshooting.notes}
        />
      </main>
    </div>
  );
}
