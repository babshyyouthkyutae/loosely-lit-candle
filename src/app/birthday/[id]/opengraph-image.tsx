import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "조각조각 — 다정한 케이크";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Supabase에서 이름 조회
  let name = "소중한 분";
  let pieceCount = 0;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: birthday } = await supabase
      .from("birthdays")
      .select("name")
      .eq("id", id)
      .single();

    if (birthday?.name) {
      name = birthday.name;
    }

    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("birthday_id", id);

    pieceCount = count ?? 0;
  } catch {
    // fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F8F4ED 0%, #EDE4D4 50%, #F0E8D6 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 좌측 상단 그라데이션 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(176,196,220,0.15) 0%, transparent 70%)",
          }}
        />

        {/* 우측 하단 그라데이션 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(196,149,106,0.12) 0%, transparent 70%)",
          }}
        />

        {/* 상단 라벨 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              letterSpacing: "0.3em",
              color: "#B0A08A",
              textTransform: "uppercase" as const,
            }}
          >
            느슨한 촛불
          </span>
          <span style={{ fontSize: "14px", color: "#C4B99A" }}>·</span>
          <span
            style={{
              fontSize: "16px",
              letterSpacing: "0.15em",
              color: "#B0A08A",
            }}
          >
            조각조각
          </span>
        </div>

        {/* 촛불 이모지 */}
        <div style={{ fontSize: "56px", marginBottom: "20px" }}>🕯️</div>

        {/* 메인 타이틀 */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 400,
            color: "#2C2416",
            textAlign: "center",
            lineHeight: 1.4,
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>{name}님의 케이크</span>
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: "48px",
            height: "2px",
            background: "#D6CCB8",
            marginBottom: "20px",
          }}
        />

        {/* 서브 텍스트 */}
        <div
          style={{
            fontSize: "20px",
            color: "#7A6A50",
            fontWeight: 300,
            textAlign: "center",
            lineHeight: 1.8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {pieceCount > 0 ? (
            <span>다정한 조각 {pieceCount}개가 모였어요</span>
          ) : (
            <span>다정한 조각을 보태주세요</span>
          )}
        </div>

        {/* 하단 브랜드 슬로건 */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "14px",
            color: "#C4B99A",
            letterSpacing: "0.12em",
            fontStyle: "italic",
          }}
        >
          조각조각 모인 마음은 쉽게 무너지지 않습니다
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
