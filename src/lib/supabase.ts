import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("[Supabase] 환경변수가 설정되지 않았습니다.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── 조각 타입 정의 ───────────────────────────────────────
export type PieceType = "cream" | "choco" | "strawberry" | "blueberry" | "lemon";

export const PIECE_META: Record<PieceType, {
  label: string;
  emoji: string;
  bg: string;
  border: string;
  topColor: string;
  creamColor: string;
}> = {
  cream: {
    label: "생크림",
    emoji: "🤍",
    bg: "#FFF8F0",
    border: "#E8D5B5",
    topColor: "#FFFDF5",
    creamColor: "#F5EBD5",
  },
  choco: {
    label: "초코",
    emoji: "🤎",
    bg: "#3D2010",
    border: "#6B3E26",
    topColor: "#5C2D0E",
    creamColor: "#4A2215",
  },
  strawberry: {
    label: "딸기",
    emoji: "🍓",
    bg: "#FFE4EA",
    border: "#F4637A",
    topColor: "#FFB3C1",
    creamColor: "#FFD6DE",
  },
  blueberry: {
    label: "블루베리",
    emoji: "🫐",
    bg: "#EDE4FF",
    border: "#9B7FD4",
    topColor: "#C4ACFF",
    creamColor: "#D8CCFF",
  },
  lemon: {
    label: "레몬",
    emoji: "🍋",
    bg: "#FFFBE0",
    border: "#D4C320",
    topColor: "#FFF176",
    creamColor: "#FFF8B0",
  },
};

// ─── 타입 정의 ───────────────────────────────────────────
export interface Birthday {
  id: string;
  name: string;
  birthday: string;
  email: string | null;
  created_at: string;
}

export interface Piece {
  id: string;
  birthday_id: string;
  content: string;
  author: string;
  piece_type: PieceType;
  pos_x: number;
  pos_y: number;
  created_at: string;
}

export interface BirthdayWithPieces extends Birthday {
  messages: Piece[];
  locked: boolean;
  lockedReason?: string;
}

// ─── KST 기준 오늘 날짜 "YYYY-MM-DD" ─────────────────────
export function getTodayKST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

// ─── 생일 당일 여부 판단 ─────────────────────────────────
export function isBirthdayToday(birthday: string): boolean {
  const today = getTodayKST();
  const [, bdMM, bdDD] = birthday.split("-");
  const [, todayMM, todayDD] = today.split("-");
  return bdMM === todayMM && bdDD === todayDD;
}
