import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 단순 in-memory 캐시 (keyword → recipe)
const recipeCache = new Map<string, string>();

export async function POST(request: Request) {
  try {
    const { keyword, recipientName } = await request.json();
    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "keyword가 필요합니다." }, { status: 400 });
    }

    const cacheKey = `${keyword}:${recipientName ?? ""}`;
    if (recipeCache.has(cacheKey)) {
      return NextResponse.json({ recipe: recipeCache.get(cacheKey) });
    }

    const name = recipientName?.trim() || "당신";
    const prompt = `당신은 따뜻한 생일 케이크 레시피 작가입니다.
다음 취향 키워드를 사용해 케이크 토핑 한 줄 레시피를 써주세요.
형식: "이 #${keyword} [토핑 오브제 이름]을 얹어 ${name}님의 하루를 [감성적인 형용사]하게 만들게요."
조건:
- 반드시 한 문장, 30자 내외
- 케이크/토핑 메타포를 유지
- 따뜻하고 시적인 톤
- #${keyword} 태그를 반드시 포함
취향 키워드: ${keyword}
수신자 이름: ${name}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const recipe = result.response.text().trim();

    recipeCache.set(cacheKey, recipe);
    // 캐시 최대 100개 유지
    if (recipeCache.size > 100) {
      const firstKey = recipeCache.keys().next().value;
      if (firstKey) recipeCache.delete(firstKey);
    }

    return NextResponse.json({ recipe }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[topping-recipe] error:", err);
    // fallback recipe
    const keyword = (await request.json().catch(() => ({})) as { keyword?: string }).keyword ?? "취향";
    return NextResponse.json({
      recipe: `이 #${keyword} 토핑을 얹어 오늘 하루를 달콤하게 만들게요.`
    });
  }
}
