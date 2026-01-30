import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * 서버 전용 Supabase Admin 클라이언트 (Service Role)
 * RLS를 우회하여 사용. API Route 등 서버 내부에서만 사용.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey);
}
