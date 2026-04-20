import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";

// ─── POST /api/message ────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthdayId, content, author } = body;

    // 유효성 검사
    if (!birthdayId) {
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

    // 대상 birthday 존재 여부 확인
    const { data: birthday, error: bdError } = await supabase
      .from("birthdays")
      .select("id")
      .eq("id", birthdayId)
      .single();

    if (bdError || !birthday) {
      return NextResponse.json(
        { error: "해당 롤링페이퍼를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const id = randomBytes(4).toString("hex");

    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        id,
        birthday_id: birthdayId,
        content: content.trim(),
        author: author?.trim() || "익명",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase message insert error:", insertError);
      return NextResponse.json(
        { error: "메시지 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err) {
    console.error("Message POST error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
