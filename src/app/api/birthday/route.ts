import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";

// ─── GET /api/birthday?id=xxx ────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
  }

  // birthdays 레코드 조회
  const { data: birthday, error: bdError } = await supabase
    .from("birthdays")
    .select("*")
    .eq("id", id)
    .single();

  if (bdError || !birthday) {
    return NextResponse.json(
      { error: "찾을 수 없는 롤링페이퍼입니다." },
      { status: 404 }
    );
  }

  // 연결된 messages 조회 (최신순)
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("*")
    .eq("birthday_id", id)
    .order("created_at", { ascending: true });

  if (msgError) {
    return NextResponse.json(
      { error: "메시지를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ...birthday, messages: messages ?? [] },
    { status: 200 }
  );
}

// ─── POST /api/birthday ───────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthday, name, email } = body;

    // 유효성 검사
    if (!birthday) {
      return NextResponse.json(
        { error: "생일은 필수 입력값입니다." },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthday)) {
      return NextResponse.json(
        { error: "올바른 날짜 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      return NextResponse.json(
        { error: "유효하지 않은 날짜입니다." },
        { status: 400 }
      );
    }

    const id = randomBytes(4).toString("hex");

    const { error } = await supabase.from("birthdays").insert({
      id,
      name: name?.trim() || "익명",
      birthday,
      email: email?.trim() || null,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (err) {
    console.error("Birthday POST error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
