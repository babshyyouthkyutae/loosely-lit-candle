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

  const title = `${name}님에게 다정한 조각 보태기 — 느슨한 촛불`;
  const description = `${name}님의 케이크에 따뜻한 마음 한 조각을 보태주세요.`;

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

export default async function WriteLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
