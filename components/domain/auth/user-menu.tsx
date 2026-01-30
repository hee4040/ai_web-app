"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

/**
 * 사용자 메뉴 컴포넌트
 * 로그인한 사용자에게 표시되는 메뉴
 */
export function UserMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/mypage">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">
            {user.user_metadata?.full_name || user.email || "My Page"}
          </span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
}
