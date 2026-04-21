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

  // 100자 초과 시 Gemini 호출 생략 (비용 절감)
  if (content.trim().length > 100) {
    return { safe: true };
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `당신은 따뜻한 마음을 지닌 메시지 필터입니다.
아래 메시지가 생일 롤링페이퍼에 적합한지 판단하세요.

메시지: "${content}"

판단 기준:
- 공격적, 모욕적, 상처를 줄 수 있는 표현이 포함되면 "unsafe"
- 부정적 뉘앙스지만 크게 해롭지 않으면 "safe"
- 따뜻하고 응원하는 내용이면 "safe"

unsafe라면 따뜻하게 바꾼 대안 문장 1개를 제시하세요.

응답 형식 (JSON만, 다른 텍스트 없이):
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
