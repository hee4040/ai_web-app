"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        console.error("OAuth error:", errorParam);
        setError(errorParam);
        router.push("/login?error=" + encodeURIComponent(errorParam));
        return;
      }

      if (code) {
        try {
          // OAuth 코드를 세션으로 교환
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("Error exchanging code for session:", exchangeError);
            setError(exchangeError.message);
            router.push("/login?error=" + encodeURIComponent(exchangeError.message));
            return;
          }

          // 성공 시 홈으로 리다이렉트
          router.push("/");
        } catch (err) {
          console.error("Unexpected error during OAuth callback:", err);
          setError("An unexpected error occurred");
          router.push("/login?error=unexpected_error");
        }
      } else {
        // 코드가 없으면 로그인 페이지로 리다이렉트
        router.push("/login");
      }
    };

    handleCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
