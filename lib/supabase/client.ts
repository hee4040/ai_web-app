import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * 클라이언트 사이드 Supabase 클라이언트
 * Client Component에서 사용
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
