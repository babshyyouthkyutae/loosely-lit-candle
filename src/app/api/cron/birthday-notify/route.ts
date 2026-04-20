import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendBirthdayReminder } from "@/lib/email";

// ─── GET /api/cron/birthday-notify ───────────────────
// Vercel Cron 또는 수동 트리거
// Headers: { "x-cron-secret": process.env.CRON_SECRET }
export async function GET(request: Request) {
  // 인증 확인 (수동 호출: x-cron-secret / Vercel 자동: Authorization)
  const manualSecret = request.headers.get("x-cron-secret");
  const vercelAuth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    !cronSecret || // secret 미설정 시 개발환경 허용
    manualSecret === cronSecret ||
    vercelAuth === `Bearer ${cronSecret}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // UTC → KST(+9) 기준 날짜
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const today = new Date(now.getTime() + kstOffset);

  // target days: D-7, D-1, D-day
  const targetDays = [7, 1, 0];

  const results: { email: string; daysUntil: number; success: boolean }[] = [];

  // email이 있는 모든 birthday 조회 (한 번에)
  const { data: allBirthdays, error: fetchError } = await supabase
    .from("birthdays")
    .select("id, name, birthday, email")
    .not("email", "is", null);

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    return NextResponse.json({ error: "DB 조회 실패" }, { status: 500 });
  }

  if (!allBirthdays || allBirthdays.length === 0) {
    return NextResponse.json({
      date: today.toISOString().split("T")[0],
      processed: 0,
      results: [],
    });
  }

  for (const daysUntil of targetDays) {
    // daysUntil 일 후의 날짜 (KST 기준)
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    const targetMonth = targetDate.getMonth() + 1; // 1-12
    const targetDay = targetDate.getDate();

    // 월/일이 일치하는 레코드 JS 필터 (연도 무관)
    const matched = allBirthdays.filter((b) => {
      if (!b.birthday || !b.email) return false;
      const parts = (b.birthday as string).split("-"); // ["YYYY", "MM", "DD"]
      const bMonth = parseInt(parts[1], 10);
      const bDay = parseInt(parts[2], 10);
      return bMonth === targetMonth && bDay === targetDay;
    });

    if (matched.length === 0) continue;

    for (const record of matched) {
      // 메시지도 함께 조회 (D-1, D-day에만)
      let messages: { content: string; author: string }[] = [];
      if (daysUntil <= 1) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("content, author")
          .eq("birthday_id", record.id)
          .order("created_at", { ascending: false })
          .limit(3);
        messages = msgs ?? [];
      }

      const result = await sendBirthdayReminder(
        { ...record, messages },
        daysUntil
      );

      results.push({
        email: record.email as string,
        daysUntil,
        success: result.success,
      });

      console.log(
        `[Birthday Notify] D-${daysUntil} → ${record.email}: ${result.success ? "✓" : "✗"}`
      );
    }
  }

  return NextResponse.json({
    date: today.toISOString().split("T")[0],
    processed: results.length,
    results,
  });
}
