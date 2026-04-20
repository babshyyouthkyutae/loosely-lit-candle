import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── 타입 정의 ───────────────────────────────────
export interface Birthday {
  id: string;
  name: string;
  birthday: string;     // "YYYY-MM-DD"
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
