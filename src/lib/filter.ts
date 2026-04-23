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

/**
 * 1.5차 맥락적 공격 필터 — 은둔·고립 청년 특화
 * "걱정을 가장한 비아냥", "사회적 압박" 등을 잡아냅니다.
 * Gemini API 호출 없이 즉시 감지.
 */
interface ContextPattern {
  pattern: RegExp;
  suggestion: string;
}

const CONTEXT_ATTACK_PATTERNS: ContextPattern[] = [
  // 외출 비하
  { pattern: /드디어.{0,4}(나오|나왔|밖에)/,
    suggestion: "생일 축하해. 네가 편한 곳에서, 네 속도로 좋은 하루 보내길 바라." },
  { pattern: /방.{0,3}(밖|에서).{0,4}(나와|나오)/,
    suggestion: "네가 있는 그 자리에서, 오늘도 충분히 잘 하고 있어. 생일 축하해." },
  { pattern: /밖에.{0,3}(좀|한번|가끔).{0,4}(나와|나가)/,
    suggestion: "네가 편할 때, 편한 만큼만. 생일 축하해!" },
  // 생활 방식 비난
  { pattern: /방에만.{0,4}(있지|있으면|박혀)/,
    suggestion: "네 공간에서 네 시간을 보내는 것도 괜찮아. 생일 축하해." },
  { pattern: /아직도.{0,3}그렇게.{0,4}(살|지내|있)/,
    suggestion: "네 방식으로 살아가는 너를 응원해. 생일 축하해." },
  { pattern: /그러고.{0,4}(있을|살|지낼).{0,4}(거야|거니|건가)/,
    suggestion: "어떤 모습이든 네가 너인 게 좋아. 생일 축하해." },
  // 사회적 압박
  { pattern: /언제.{0,4}(취직|취업|일자리|직장|학교|복학)/,
    suggestion: "네 타이밍이 있을 거야. 올해도 네 편에서 함께할게. 생일 축하해." },
  { pattern: /다들.{0,3}(잘|벌써|이미).{0,6}(사는데|하는데|했는데)/,
    suggestion: "다른 사람 속도는 중요하지 않아. 네 오늘이 소중해. 생일 축하해." },
  // 죄책감 유발
  { pattern: /부모님.{0,6}(걱정|힘[들]|고생|속상)/,
    suggestion: "네 존재만으로 소중한 사람이야. 생일 축하해." },
  { pattern: /가족.{0,6}(걱정|힘[들]|고생|짐)/,
    suggestion: "네가 있어서 다행이야. 생일 축하해, 올해도 함께." },
  // 비교를 통한 수치심
  { pattern: /너만.{0,4}(이러고|이렇게|아직|못)/,
    suggestion: "비교 없이, 있는 그대로의 네가 좋아. 생일 축하해." },
  { pattern: /.{1,4}(는|은).{0,3}벌써.{0,8}(했는데|하는데|됐는데)/,
    suggestion: "네 시간은 네 것이야. 천천히 가도 괜찮아. 생일 축하해." },
  // 걱정을 가장한 비꼼
  { pattern: /그래도.{0,4}살아.{0,2}(있|왔|남)/,
    suggestion: "네가 여기 있어줘서 고마워. 생일 축하해." },
  { pattern: /(답답|한심|실망).{0,6}(하|해|했)/,
    suggestion: "네 옆에 있을게. 어떤 모습이든 괜찮아. 생일 축하해." },
  // 쓸모/짐 표현
  { pattern: /쓸모.{0,2}(없|읎)/,
    suggestion: "있는 것만으로 충분해. 생일 축하해." },
  { pattern: /짐.{0,3}(이야|이지|되|돼)/,
    suggestion: "네 존재는 누구에게도 짐이 아니야. 생일 축하해." },
];

interface FilterResult {
  blocked: boolean;
  reason?: string;
  suggestion?: string;
}

/**
 * 1차 로컬 필터 실행
 * - 패턴 매칭되면 즉시 차단 (Gemini 호출 없음)
 * - 통과하면 safe: true → 2차 Gemini 필터로 전달
 */
export function localFilter(text: string): FilterResult {
  const normalized = text.replace(/\s/g, "").toLowerCase();

  // 1차: 비속어 차단
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

/**
 * 1.5차 맥락적 공격 필터 (은둔 청년 특화)
 * - 비속어가 아닌 맥락적 비아냥/압박을 감지
 * - suggestion을 반환하여 윤슬 팝업에 대안 문장 표시
 */
export function contextFilter(text: string): FilterResult {
  for (const { pattern, suggestion } of CONTEXT_ATTACK_PATTERNS) {
    if (pattern.test(text)) {
      return {
        blocked: true,
        reason: "context_attack",
        suggestion,
      };
    }
  }

  return { blocked: false };
}
