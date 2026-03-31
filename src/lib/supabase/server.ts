import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * ใช้ใน Server Components, API Routes, และ Middleware
 * จัดการ cookie-based session อัตโนมัติ
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component ไม่สามารถ set cookie ได้
            // Middleware จะจัดการแทน
          }
        },
      },
    }
  );
}
