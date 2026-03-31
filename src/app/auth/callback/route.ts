import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * หลังจาก Google OAuth สำเร็จ
 * Supabase จะ redirect มาที่ route นี้พร้อม code
 * เราแลก code เป็น session แล้ว redirect ไปหน้าหลัก
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // ถ้า error → redirect ไปหน้า error
  return NextResponse.redirect(`${origin}/auth/error`);
}
