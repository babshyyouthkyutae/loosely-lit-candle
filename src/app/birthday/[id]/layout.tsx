import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let name = "소중한 분";

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from("birthdays")
      .select("name")
      .eq("id", id)
      .single();

    if (data?.name) name = data.name;
  } catch {
    // fallback
  }

  const title = `${name}님의 케이크 — 느슨한 촛불`;
  const description = `${name}님을 위한 다정한 조각들이 모이고 있어요. 당신의 마음을 보태주세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BirthdayLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
