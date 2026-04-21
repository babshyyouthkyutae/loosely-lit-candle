import { createClient } from "@supabase/supabase-js";

// ─── 공용 클라이언트 (클라이언트/서버 공용) ──────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── 타입 정의 ───────────────────────────────────────────
export interface Birthday {
  id: string;
  name: string;
  birthday: string;     // "YYYY-MM-DD"
  email: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  birthday_id: string;
  content: string;
  author: string;
  created_at: string;
}

export interface BirthdayWithMessages extends Birthday {
  messages: Message[];
}

// ─── KST 기준 오늘 날짜 "YYYY-MM-DD" ─────────────────────
export function getTodayKST(): string {
  return new Date()
    .toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

// ─── 생일 당일 여부 판단 (서버 사이드) ────────────────────
// birthday: "YYYY-MM-DD" 형식 (연도 무관, 월/일만 비교)
export function isBirthdayToday(birthday: string): boolean {
  const today = getTodayKST(); // e.g. "2026-04-22"
  const [, bdMM, bdDD] = birthday.split("-");
  const [, todayMM, todayDD] = today.split("-");
  return bdMM === todayMM && bdDD === todayDD;
}
