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
  preferences: string[];   // JSONB 유형 키워드 배열
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

// ─── 토핑 맵핑 시스템 ────────────────────────────────────
export interface ToppingMeta {
  emoji: string;
  label: string;
  svgPath: string;     // 인라인 SVG path data
  soundType: "fluffy" | "crunchy" | "chime";
  color: string;       // 토핑 대표색
  tagLabel: string;    // 자동 태그 문자열
}

export const DEFAULT_TOPPINGS = [
  "영화", "음악", "쳅", "식물", "여행", "커피",
  "게임", "고양이", "요리", "운동", "그림", "별"
] as const;

export const TOPPING_MAP: Record<string, ToppingMeta> = {
  "영화": { emoji: "🎬", label: "영화 스프링클", soundType: "chime", color: "#C4956A",
    tagLabel: "영화",
    svgPath: "M4 3h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm8 3l4 2-4 2V6zM4 7v2h2V7H4zm0 4v2h2v-2H4zm0 4v2h2v-2H4zm14-8v2h-2V7h2zm0 4v2h-2v-2h2zm0 4v2h-2v-2h2z" },
  "음악": { emoji: "🎵", label: "음표 초콜릿", soundType: "crunchy", color: "#7B5EA7",
    tagLabel: "음악",
    svgPath: "M9 18V5l12-2v13M9 18H7a2 2 0 01-2-2V9a2 2 0 012-2h2M21 16h-2a2 2 0 01-2-2V7a2 2 0 012-2h2" },
  "쳅": { emoji: "📚", label: "페이지 쿠키", soundType: "crunchy", color: "#A0704A",
    tagLabel: "독서",
    svgPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  "식물": { emoji: "🌿", label: "허브 잎", soundType: "fluffy", color: "#5A8A5A",
    tagLabel: "식물",
    svgPath: "M12 22V12m0 0C12 7 7 4 3 6c3 3 6 5 9 6zm0 0c0-5 5-8 9-6-3 3-6 5-9 6z" },
  "여행": { emoji: "✈️", label: "항공기 암갑실탕", soundType: "chime", color: "#4A90C4",
    tagLabel: "여행",
    svgPath: "M21 16l-4-4H9l-4-4H3l3 4-3 4h2l4-4h8l4 4h2z" },
  "커피": { emoji: "☕", label: "커피빈 칩", soundType: "crunchy", color: "#6B3E26",
    tagLabel: "커피",
    svgPath: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-4h.01M10 4h.01" },
  "게임": { emoji: "🎮", label: "콘트롤러 왼드베리", soundType: "crunchy", color: "#3D5A80",
    tagLabel: "게임",
    svgPath: "M6 12h12M12 6v12M8 8l8 8M16 8l-8 8" },
  "고양이": { emoji: "🐱", label: "고양이 발바닥 마카롱", soundType: "fluffy", color: "#C4956A",
    tagLabel: "고양이",
    svgPath: "M12 4c-1 0-3 .5-4 2s-1 3 0 4c-2 1-3 3-2 5s3 3 5 3 4-1 5-3-1-4-2-5c1-1 1-3 0-4s-3-2-4-2zm0 2a2 2 0 110 4 2 2 0 010-4z" },
  "요리": { emoji: "🍳", label: "띄럙한 쿠키", soundType: "crunchy", color: "#E8A050",
    tagLabel: "요리",
    svgPath: "M9 12h6M9 16h6M4 8h16M4 4h16v4H4V4zm0 4v12a2 2 0 002 2h12a2 2 0 002-2V8H4z" },
  "운동": { emoji: "🏃", label: "에너지 젬리비스트", soundType: "chime", color: "#E04F5F",
    tagLabel: "운동",
    svgPath: "M13 10V3L4 14h7v7l9-11h-7z" },
  "그림": { emoji: "🎨", label: "수체화 팔레트 쿠키", soundType: "fluffy", color: "#C45FA0",
    tagLabel: "그림",
    svgPath: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" },
  "별": { emoji: "⭐", label: "별모양 스프링클", soundType: "chime", color: "#F5C842",
    tagLabel: "별",
    svgPath: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
};

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
