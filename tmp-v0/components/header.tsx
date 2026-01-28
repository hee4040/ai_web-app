import Link from "next/link";
import { Terminal, Plus, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            Environment Recipe Platform
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
            <Link href="/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Recipe</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href="/mypage">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">My Page</span>
            </Link>
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
