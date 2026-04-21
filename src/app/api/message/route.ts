import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";

// ─── POST /api/message ────────────────────────────────────
// 메시지 작성은 생일 당일과 무관하게 항상 가능
// (수신자만 당일에 열람 제한, 작성자는 미리 마음을 남길 수 있음)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthdayId, content, author } = body;

    // ── 유효성 검사 ──────────────────────────────────────
    if (!birthdayId || typeof birthdayId !== "string") {
      return NextResponse.json(
        { error: "birthdayId가 필요합니다." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "메시지 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { error: "메시지는 500자 이내로 작성해주세요." },
        { status: 400 }
      );
    }

    // XSS 방어: 기본 HTML 태그 제거
    const sanitized = content.trim()
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "");

    // ── 대상 birthday 존재 여부 확인 ─────────────────────
    const { data: birthday, error: bdError } = await supabase
      .from("birthdays")
      .select("id, name")
      .eq("id", birthdayId)
      .single();

    if (bdError || !birthday) {
      return NextResponse.json(
        { error: "해당 롤링페이퍼를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // ── 메시지 저장 ──────────────────────────────────────
    const id = randomBytes(4).toString("hex");

    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        id,
        birthday_id: birthdayId,
        content: sanitized,
        author: author?.trim().slice(0, 20) || "익명",
      })
      .select("id, content, author, created_at")
      .single();

    if (insertError) {
      console.error("[POST /api/message] insert error:", insertError);
      return NextResponse.json(
        { error: "메시지 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/message] error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
