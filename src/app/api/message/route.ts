import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabase, type PieceType } from "@/lib/supabase";

const VALID_PIECE_TYPES: PieceType[] = ["cream", "choco", "strawberry", "blueberry", "lemon"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthdayId, content, author, pieceType = "cream", posX, posY } = body;

    if (!birthdayId || typeof birthdayId !== "string") {
      return NextResponse.json({ error: "birthdayId가 필요합니다." }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "조각 내용을 입력해주세요." }, { status: 400 });
    }
    if (content.trim().length > 500) {
      return NextResponse.json({ error: "조각은 500자 이내로 작성해주세요." }, { status: 400 });
    }

    const validatedPieceType: PieceType = VALID_PIECE_TYPES.includes(pieceType) ? pieceType : "cream";
    const sanitized = content.trim()
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "");

    const { data: birthday, error: bdError } = await supabase
      .from("birthdays").select("id, name").eq("id", birthdayId).single();
    if (bdError || !birthday) {
      return NextResponse.json({ error: "해당 케이크를 찾을 수 없습니다." }, { status: 404 });
    }

    // 위치값: 전달받으면 사용, 없으면 랜덤 생성
    const finalPosX = typeof posX === "number" ? Math.max(0, Math.min(1, posX)) : Math.random();
    const finalPosY = typeof posY === "number" ? Math.max(0, Math.min(1, posY)) : Math.random();

    const id = randomBytes(4).toString("hex");
    const { data: piece, error: insertError } = await supabase
      .from("messages")
      .insert({
        id,
        birthday_id: birthdayId,
        content: sanitized,
        author: author?.trim().slice(0, 20) || "익명",
        piece_type: validatedPieceType,
        pos_x: finalPosX,
        pos_y: finalPosY,
      })
      .select("id, content, author, piece_type, pos_x, pos_y, created_at")
      .single();

    if (insertError) {
      console.error("[POST /api/message] insert error:", insertError);
      return NextResponse.json({ error: "조각을 저장하는 중에 문제가 생겼어요. 조금 후에 다시 시도해주세요 🙏" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: piece }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/message] error:", err);
    return NextResponse.json({ error: "잠시 문제가 생겼어요. 조금 후에 다시 시도해주세요 🙏" }, { status: 500 });
  }
}
