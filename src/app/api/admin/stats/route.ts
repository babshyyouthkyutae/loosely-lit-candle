import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ─── GET /api/admin/stats ────────────────────────────────
// ADMIN_SECRET 헤더로 보호된 관리자 통계 API
export async function GET(request: Request) {
  const secret = request.headers.get("x-admin-secret");
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || secret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. 총 케이크(생일) 수
    const { count: totalCakes } = await supabase
      .from("birthdays")
      .select("id", { count: "exact", head: true });

    // 2. 총 조각(메시지) 수
    const { count: totalPieces } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true });

    // 3. 최근 7일 등록 수
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekCakes } = await supabase
      .from("birthdays")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    // 4. 최근 7일 조각 수
    const { count: weekPieces } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    // 5. 최근 등록된 케이크 10개
    const { data: recentCakes } = await supabase
      .from("birthdays")
      .select("id, name, birthday, email, preferences, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // 6. 최근 조각 10개
    const { data: recentPieces } = await supabase
      .from("messages")
      .select("id, birthday_id, author, piece_type, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // 7. 이메일 등록률
    const { count: emailCount } = await supabase
      .from("birthdays")
      .select("id", { count: "exact", head: true })
      .not("email", "is", null);

    // 8. 인기 토핑 (preferences 집계)
    const { data: allPrefs } = await supabase
      .from("birthdays")
      .select("preferences");

    const toppingCounts: Record<string, number> = {};
    (allPrefs ?? []).forEach((row: { preferences: string[] | null }) => {
      (row.preferences ?? []).forEach((p: string) => {
        toppingCounts[p] = (toppingCounts[p] || 0) + 1;
      });
    });

    const topToppings = Object.entries(toppingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      summary: {
        totalCakes: totalCakes ?? 0,
        totalPieces: totalPieces ?? 0,
        weekCakes: weekCakes ?? 0,
        weekPieces: weekPieces ?? 0,
        emailRegistrationRate: totalCakes
          ? Math.round(((emailCount ?? 0) / totalCakes) * 100)
          : 0,
        avgPiecesPerCake: totalCakes
          ? Math.round(((totalPieces ?? 0) / totalCakes) * 10) / 10
          : 0,
      },
      topToppings,
      recentCakes: recentCakes ?? [],
      recentPieces: recentPieces ?? [],
    });
  } catch (err) {
    console.error("[Admin Stats] error:", err);
    return NextResponse.json(
      { error: "통계 조회 중 오류" },
      { status: 500 }
    );
  }
}
