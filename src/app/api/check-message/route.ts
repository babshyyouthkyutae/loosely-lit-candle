import { NextResponse } from "next/server";
import { localFilter } from "@/lib/filter";

// ─── 3차 Rate Limiting (IP당 1분에 3회) ─────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000; // 1분
  const maxRequests = 3;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  if (record.count >= maxRequests) {
    return false; // blocked
  }
  record.count++;
  return true;
}

// ─── 2차 Gemini 결과 캐싱 (동일 내용 중복 과금 방지) ─────
const geminiCache = new Map<string, { safe: boolean; suggestion?: string }>();
const MAX_CACHE_SIZE = 200;

// ─── Gemini Flash 2차 필터 ─────────────────────────────
async function geminiFilter(
  content: string
): Promise<{ safe: boolean; suggestion?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // 키 없으면 통과 (안전 기본값)
    return { safe: true };
  }

  // 캐시 확인
  const cacheKey = content.trim().slice(0, 200);
  if (geminiCache.has(cacheKey)) {
    return geminiCache.get(cacheKey)!;
  }

  // 500자 초과는 textarea maxLength에서 이미 차단됨
  // 모든 길이의 메시지를 Gemini로 분석 (은둔 청년 보호 최우선)

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `당신은 "느슨한 촛불" — 은둔·고립 청년을 위한 심리 케어 생일 플랫폼의 메시지 안전 검사관입니다.

[핵심 원칙]
이 서비스의 수신자는 사회적 고립, 은둔, 우울을 경험하는 청년입니다.
일반인에게 평범한 말도 이들에게는 극심한 상처가 됩니다.
"걱정을 가장한 비아냥"과 "사회적 압박"이 가장 위험합니다.
의심스러우면 unsafe로 판단하세요 — 안전이 최우선입니다.

[판단 예시]
입력: "생일 축하해! 올해도 네 곁에 있을게."
→ {"safe": true}

입력: "네 속도로 괜찮아, 천천히 오늘 하루도 잘 보냈으면 좋겠다."
→ {"safe": true}

입력: "오랜만이다! 보고 싶었어. 맛있는 거 먹으면서 좋은 하루 보내."
→ {"safe": true}

입력: "드디어 방 밖으로 나오나 보네? 많이 달라지길 바래."
→ {"safe": false, "suggestion": "생일 축하해. 네가 편한 속도로, 좋은 하루 보내길 바라."}

입력: "언제 취직할 거야? 부모님이 걱정하시잖아. 다들 잘 사는데 너만 이러고 있어."
→ {"safe": false, "suggestion": "네 길을 응원해. 생일 축하하고, 올해도 네 편에서 함께할게."}

입력: "아직도 그렇게 살아? 솔직히 좀 답답해."
→ {"safe": false, "suggestion": "네 하루하루가 소중해. 생일 축하하고, 힘내!"}

[unsafe 기준] 하나라도 해당되면 unsafe:
1. 직접적 욕설, 비난, 탓하는 표현
2. 존재를 부정하는 표현 ("태어나지 말았어야", "짐이야")
3. 모욕적이거나 창피 주는 내용
4. 관계를 끊겠다는 위협적 표현
5. ★ 은둔/고립 비하:
   - 외출 비하: "드디어 나오나 보네", "밖에 좀 나와"
   - 생활 비난: "방에만 있지 말고", "아직도 그렇게 살아?"
   - 사회적 압박: "언제 취직할 거야", "다들 잘 사는데"
   - 죄책감 유발: "부모님이 걱정하시잖아"
   - 비교: "○○는 벌써 ~했는데", "너만 이러고 있어"
   - 가장된 걱정: "그래도 살아있네", 비꼬는 톤의 문장
6. 비아냥, 냉소, 조롱의 뉘앙스가 감지되는 문장

[safe 기준] 반드시 통과:
- 따뜻한 응원, 축하, 위로
- 그리움, 보고싶다, 아쉽다
- "네 속도로 괜찮아", "천천히" 등 존중 표현
- 악의 없는 친근한 농담

이제 아래 메시지를 판단하세요.
메시지: "${content}"

unsafe면 수신자의 속도와 존재를 존중하는 대안 문장 1개를 제시하세요.
반드시 아래 JSON만 출력 (다른 텍스트 없이):
{"safe": true} 또는 {"safe": false, "suggestion": "대안 문장"}`;


    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { safe: true };

    const parsed = JSON.parse(jsonMatch[0]);
    const response = {
      safe: parsed.safe !== false,
      suggestion: parsed.suggestion as string | undefined,
    };

    // 캐시 저장 (크기 제한)
    if (geminiCache.size >= MAX_CACHE_SIZE) {
      const firstKey = geminiCache.keys().next().value;
      if (firstKey !== undefined) geminiCache.delete(firstKey);
    }
    geminiCache.set(cacheKey, response);

    return response;
  } catch (err) {
    console.error("[Gemini Filter Error]", err);
    return { safe: true }; // 오류 시 통과
  }
}

// ─── POST /api/check-message ───────────────────────────
export async function POST(request: Request) {
  // IP 추출
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // 3차: Rate Limit 체크
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        safe: false,
        blocked: true,
        reason: "rate_limit",
        message: "잠시 후 다시 시도해주세요. (1분에 3번까지 가능해요)",
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const content: string = body.content || "";

  if (!content.trim()) {
    return NextResponse.json({ safe: true });
  }

  // 1차: 로컬 Regex 필터
  const localResult = localFilter(content);
  if (localResult.blocked) {
    return NextResponse.json({
      safe: false,
      reason: "profanity",
      suggestion:
        "받는 분에게 따뜻한 마음을 전해보세요. 짧아도, 서툴러도 괜찮아요.",
    });
  }

  // 2차: Gemini Flash 필터 (100자 이하 + 캐싱)
  const geminiResult = await geminiFilter(content);

  return NextResponse.json({
    safe: geminiResult.safe,
    suggestion: geminiResult.suggestion,
  });
}
