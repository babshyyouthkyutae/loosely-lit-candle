import { NextResponse } from "next/server";
import { TOPPING_MAP } from "@/lib/supabase";

// ─── 사전 생성 레시피 템플릿 (Gemini 호출 0 → 비용 $0) ──────────
// 키워드마다 3개의 레시피를 미리 작성해 랜덤 반환합니다.
// Gemini API를 호출하지 않으므로 비용이 전혀 발생하지 않습니다.
const RECIPE_TEMPLATES: Record<string, string[]> = {
  "영화": [
    "이 #영화 스프링클을 얹어 오늘 하루를 한 편의 명장면처럼 만들게요.",
    "이 #영화 토핑으로 당신의 케이크에 따뜻한 엔딩 크레딧을 더할게요.",
    "이 #영화 조각을 얹어 오늘을 극장 조명처럼 포근하게 밝혀줄게요.",
  ],
  "음악": [
    "이 #음악 초콜릿을 얹어 오늘의 멜로디를 달콤하게 만들게요.",
    "이 #음악 토핑으로 당신만의 조용한 노래를 케이크에 담아줄게요.",
    "이 #음악 조각이 하루를 잔잔한 허밍처럼 따뜻하게 감싸줄 거예요.",
  ],
  "책": [
    "이 #책 쿠키를 얹어 오늘 하루를 좋아하는 한 구절처럼 만들게요.",
    "이 #책 토핑으로 당신의 케이크에 서재의 고요함을 더할게요.",
    "이 #책 조각이 잠들기 전의 따뜻한 독서처럼 편안함을 선물할게요.",
  ],
  "식물": [
    "이 #식물 허브잎을 얹어 오늘을 초록빛 오후처럼 싱그럽게 만들게요.",
    "이 #식물 토핑으로 당신의 케이크에 작은 정원의 향기를 더할게요.",
    "이 #식물 조각이 창가의 햇살을 받은 화분처럼 당신을 비춰줄 거예요.",
  ],
  "여행": [
    "이 #여행 캔디를 얹어 오늘을 소풍 나간 오후처럼 만들게요.",
    "이 #여행 토핑으로 당신의 케이크에 먼 곳의 바람을 실어줄게요.",
    "이 #여행 조각이 좋아하는 골목길을 걷는 것처럼 설레게 해줄 거예요.",
  ],
  "커피": [
    "이 #커피 칩을 얹어 오늘을 나른한 오후의 향처럼 만들게요.",
    "이 #커피 토핑으로 당신의 케이크에 따뜻한 한 모금을 더할게요.",
    "이 #커피 조각이 빗소리와 함께하는 카페처럼 포근할 거예요.",
  ],
  "게임": [
    "이 #게임 젤리를 얹어 오늘을 보너스 스테이지처럼 만들게요.",
    "이 #게임 토핑으로 당신의 케이크에 세이브 포인트를 하나 더할게요.",
    "이 #게임 조각이 퀘스트 완료처럼 뿌듯한 하루를 선물할 거예요.",
  ],
  "고양이": [
    "이 #고양이 마카롱을 얹어 오늘을 냥이 볕바라기처럼 만들게요.",
    "이 #고양이 토핑으로 당신의 케이크에 그르릉 소리를 더할게요.",
    "이 #고양이 조각이 무릎 위의 고양이처럼 따뜻할 거예요.",
  ],
  "요리": [
    "이 #요리 쿠키를 얹어 오늘을 갓 구운 빵 향기처럼 만들게요.",
    "이 #요리 토핑으로 당신의 케이크에 정성의 온기를 더할게요.",
    "이 #요리 조각이 좋아하는 한 끼처럼 마음을 든든하게 해줄 거예요.",
  ],
  "운동": [
    "이 #운동 젤리를 얹어 오늘을 상쾌한 아침 공기처럼 만들게요.",
    "이 #운동 토핑으로 당신의 케이크에 활력의 에너지를 더할게요.",
    "이 #운동 조각이 좋은 땀 한 줄처럼 개운한 하루를 선물할 거예요.",
  ],
  "그림": [
    "이 #그림 팔레트 쿠키를 얹어 오늘을 수채화처럼 만들게요.",
    "이 #그림 토핑으로 당신의 케이크에 좋아하는 색을 한 점 더할게요.",
    "이 #그림 조각이 스케치북 위의 자유처럼 당신을 감싸줄 거예요.",
  ],
  "별": [
    "이 #별 스프링클을 얹어 오늘 밤하늘을 당신 곁에 가져올게요.",
    "이 #별 토핑으로 당신의 케이크에 은하수의 반짝임을 더할게요.",
    "이 #별 조각이 창밖의 별처럼 당신을 조용히 응원할 거예요.",
  ],
  "조용한 휴식": [
    "이 #조용한휴식 머랭을 얹어 오늘을 포근한 이불 속처럼 만들게요.",
    "이 #조용한휴식 토핑으로 당신의 케이크에 고요한 안식을 더할게요.",
    "이 #조용한휴식 조각이 아무것도 하지 않아도 되는 오후를 선물할게요.",
  ],
  "혼자만의 시간": [
    "이 #혼자만의시간 무스를 얹어 오늘을 달빛 아래의 고요처럼 만들게요.",
    "이 #혼자만의시간 토핑으로 당신만의 조용한 세계를 케이크에 담을게요.",
    "이 #혼자만의시간 조각이 방 안의 평화로운 밤처럼 편안할 거예요.",
  ],
  "느린 걸음": [
    "이 #느린걸음 쿠키를 얹어 오늘을 천천히 걷는 산책길처럼 만들게요.",
    "이 #느린걸음 토핑으로 당신의 케이크에 여유의 향기를 더할게요.",
    "이 #느린걸음 조각이 급하지 않은 오후처럼 당신을 감싸줄 거예요.",
  ],
};

// ─── IP Rate Limit (분당 10회 — 어뷰징 방지) ──────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (record.count >= 10) return false;
  record.count++;
  return true;
}

// 오래된 엔트리 정리 (5분마다)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (now > record.resetAt) rateLimitMap.delete(ip);
  }
}, 300_000);

export async function POST(request: Request) {
  // IP 제한
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { recipe: "잠시 후에 다시 토핑을 살펴봐 주세요 🕯️" },
      { status: 429 }
    );
  }

  try {
    const { keyword, recipientName } = await request.json();
    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "keyword가 필요합니다." }, { status: 400 });
    }

    const name = recipientName?.trim() || "당신";

    // 사전 레시피에서 랜덤 선택
    const templates = RECIPE_TEMPLATES[keyword];
    if (templates && templates.length > 0) {
      const recipe = templates[Math.floor(Math.random() * templates.length)]
        .replace("당신", `${name}님`);
      return NextResponse.json(
        { recipe },
        { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } }
      );
    }

    // TOPPING_MAP에 있지만 사전 레시피가 없는 키워드 → 제네릭 템플릿
    const meta = TOPPING_MAP[keyword];
    if (meta) {
      const recipe = `이 #${keyword} ${meta.label}을 얹어 ${name}님의 하루를 달콤하게 만들게요.`;
      return NextResponse.json(
        { recipe },
        { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } }
      );
    }

    // 완전 미지의 키워드
    return NextResponse.json({
      recipe: `이 #${keyword} 토핑을 얹어 오늘 하루를 달콤하게 만들게요.`
    });
  } catch (err) {
    console.error("[topping-recipe] error:", err);
    return NextResponse.json({
      recipe: "토핑을 준비하는 중이에요. 잠시 후 다시 살펴봐 주세요. 🕯️"
    });
  }
}
