import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ✅ API Key อยู่ server-side เท่านั้น — ไม่มีทางรั่วไปยัง client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    // ─── 1. ตรวจสอบ Authentication ───────────────────────────────────
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: กรุณา Login ก่อนใช้งาน AI" },
        { status: 401 }
      );
    }

    // ─── 2. อ่าน Request Body ────────────────────────────────────────
    const body = await request.json();
    const { selectedText } = body as { selectedText: string };

    if (!selectedText || selectedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Bad Request: ไม่พบข้อความที่เลือก" },
        { status: 400 }
      );
    }

    // จำกัดความยาวป้องกัน abuse
    if (selectedText.length > 5000) {
      return NextResponse.json(
        { error: "Bad Request: ข้อความยาวเกินไป (สูงสุด 5,000 ตัวอักษร)" },
        { status: 400 }
      );
    }

    // ─── 3. เรียก Gemini API ─────────────────────────────────────────
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // เร็ว + ประหยัด เหมาะกับ use case นี้
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `คุณเป็นผู้ช่วยสอนที่เป็นประโยชน์และเชี่ยวชาญ (Helpful Tutor AI)

งานของคุณคือ: อธิบายหรือสรุปข้อความจากเอกสาร PDF ที่ผู้ใช้เลือกมา ให้กระชับ เข้าใจง่าย และเป็นประโยชน์

กฎ:
- ตอบเป็นภาษาเดียวกับข้อความที่ได้รับ (ถ้าไทยก็ตอบไทย ถ้าอังกฤษก็ตอบอังกฤษ)
- ใช้ Markdown formatting (หัวข้อ, bullet points, bold) เพื่อให้อ่านง่าย
- ถ้าข้อความมีศัพท์เทคนิค ให้อธิบายความหมายด้วย
- ตอบให้กระชับ ไม่เกิน 3-4 ย่อหน้า

ข้อความที่เลือกจาก PDF:
---
${selectedText}
---

กรุณาอธิบายหรือสรุปข้อความด้านบน:`;
    console.log("เช็ค API KEY:", process.env.GEMINI_API_KEY ? "เจอแล้ว!" : "อ้าว หาย!");
    // แล้วค่อยตามด้วย
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // ─── 4. บันทึกประวัติการอ่าน (History) ───────────────────────────
    const { error: historyError } = await supabase.from("history").insert({
      user_id: user.id,
      selected_text: selectedText,
      result_text: text,
    });
    if (historyError) {
      console.error("[history] log error:", historyError);
    }

    // ─── 5. ส่งผลลัพธ์กลับ ───────────────────────────────────────────
    return NextResponse.json({
      result: text,
      usage: {
        // Log usage สำหรับ monitoring (ไม่ส่งไป client จริง แต่เก็บไว้ debug)
        userId: user.id,
        textLength: selectedText.length,
      },
    });
  } catch (error) {
    console.error("[ask-ai] Error:", error);

    // ไม่ expose internal error details ไปยัง client
    return NextResponse.json(
      { error: "Server Error: เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

// ป้องกัน GET request
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
