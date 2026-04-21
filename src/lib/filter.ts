/**
 * 1차 로컬 필터 — 비속어/혐오표현 Regex 패턴 목록
 * API 호출 없이 즉시 차단. 90%의 노이즈를 무료로 걸러냅니다.
 */

const PROFANITY_PATTERNS: RegExp[] = [
  // 욕설 기본형
  /씨발|씨팔|씨빨|시발|시팔/,
  /개새끼|개새|개샛|개년|개놈/,
  /병신|빙신|벙신/,
  /미친놈|미친년|미친새|미친거|미쳤|미친|ㅁㅊ/,
  /존나|졸라|ㅈㄴ/,
  /새끼|새키|색히/,
  /꺼져|꺼지세요|닥쳐|닥쳐라|꺼져버려/,
  /죽어|죽어라|뒤져|뒤져라|뒤지|죽을래/,
  /찐따|쩐따|저능아|정신지체|장애|지랄/,
  /창녀|창녀년|매춘부|갈보|걸레년/,
  /보지|자지|좆|좇/,
  /후레자식|호로새끼|호로자식/,
  /ㄷㅊ|ㅅㅂ|ㅈㄹ|ㄲㅈ|ㅄ|ㅗ/,
  // 혐오 표현
  /홍어|짱깨|쪽바리/,
  // 위협적 표현
  /가만두지|가만두지않|죽여버|죽이고싶|죽이겠/,
];

interface FilterResult {
  blocked: boolean;
  reason?: string;
}

/**
 * 1차 로컬 필터 실행
 * - 패턴 매칭되면 즉시 차단 (Gemini 호출 없음)
 * - 통과하면 safe: true → 2차 Gemini 필터로 전달
 */
export function localFilter(text: string): FilterResult {
  const normalized = text.replace(/\s/g, "").toLowerCase();

  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(normalized) || pattern.test(text)) {
      return {
        blocked: true,
        reason: "profanity",
      };
    }
  }

  return { blocked: false };
}
