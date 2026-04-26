import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase, isBirthdayToday } from "@/lib/supabase";

// ─── GET /api/birthday?id=xxx ────────────────────────────
// 서버 사이드 생일 당일 체크:
//   - 생일 당일이면 → messages 포함해서 반환
//   - 그 외에는   → messages: [] (빈 배열) + locked: true
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
  }

  // 1. birthdays 레코드 조회
  const { data: birthday, error: bdError } = await supabase
    .from("birthdays")
    .select("id, name, birthday, email, preferences, created_at")
    .eq("id", id)
    .single();

  if (bdError || !birthday) {
    return NextResponse.json(
      { error: "찾을 수 없는 케이크입니다." },
      { status: 404 }
    );
  }

  // 2. 서버 사이드 생일 당일 체크 (KST 기준)
  const isToday = isBirthdayToday(birthday.birthday);

  if (!isToday) {
    // 생일 아님 → 메시지 0건 + locked 플래그 반환
    // (클라이언트에서 잠금 UI 표시용)
    return NextResponse.json(
      {
        ...birthday,
        messages: [],
        locked: true,
        lockedReason: "birthday_not_today",
      },
      {
        status: 200,
        headers: {
          // 캐시 방지: 날짜가 바뀌면 즉시 반영
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  }

  // 3. 생일 당일 → 메시지 전체 조회
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("id, content, author, piece_type, pos_x, pos_y, created_at")
    .eq("birthday_id", id)
    .order("created_at", { ascending: true });

  if (msgError) {
    console.error("[GET /api/birthday] messages fetch error:", msgError);
    return NextResponse.json(
      { error: "조각들을 불러오는 중에 문제가 생겼어요. 잠시 후 다시 시도해주세요 🙏" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ...birthday,
      messages: messages ?? [],
      locked: false,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    }
  );
}

// ─── POST /api/birthday ──────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthday, name, email, preferences } = body;

    // 유효성 검사
    if (!birthday) {
      return NextResponse.json(
        { error: "생일을 입력해주세요. 한 줄의 날짜면 충분해요." },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthday)) {
      return NextResponse.json(
        { error: "날짜를 다시 확인해주세요 🙏" },
        { status: 400 }
      );
    }

    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      return NextResponse.json(
        { error: "날짜를 다시 확인해주세요 🙏" },
        { status: 400 }
      );
    }

    // 미래 날짜 방지 (KST 기준 내일 이후는 불가)
    const nowKST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    nowKST.setHours(23, 59, 59, 999);
    if (birthdayDate > nowKST) {
      return NextResponse.json(
        { error: "아직 오지 않은 생일이에요. 날짜를 다시 확인해주세요." },
        { status: 400 }
      );
    }

    const id = randomBytes(4).toString("hex");
    const validPrefs = Array.isArray(preferences)
      ? preferences.filter((p: unknown) => typeof p === "string").slice(0, 20)
      : [];

    const { error } = await supabase.from("birthdays").insert({
      id,
      name: name?.trim() || "익명",
      birthday,
      email: email?.trim() || null,
      preferences: validPrefs,
    });

    if (error) {
      console.error("[POST /api/birthday] Supabase insert error:", error);
      return NextResponse.json(
        { error: "잠시 문제가 생겼어요. 조금 후에 다시 시도해주세요. 🙏" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/birthday] error:", err);
    return NextResponse.json(
      { error: "잠시 문제가 생겼어요. 조금 후에 다시 시도해주세요. 🙏" },
      { status: 500 }
    );
  }
}
