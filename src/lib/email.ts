import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// ─── 이메일 발송 함수 ───────────────────────────────
interface BirthdayRecord {
  id: string;
  name: string;
  birthday: string;
  email: string;
  messages?: { content: string; author: string }[];
}

export async function sendBirthdayReminder(
  record: BirthdayRecord,
  daysUntil: number
) {
  const { id, name, email, messages = [] } = record;
  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/birthday/${id}`;
  const writeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/birthday/${id}/write`;

  const subject = getSubject(name, daysUntil);
  const html = buildEmailHtml({ name, daysUntil, pageUrl, writeUrl, messages });

  const { data, error } = await resend.emails.send({
    from: "느슨한 촛불 <onboarding@resend.dev>",
    to: [email],
    subject,
    html,
  });

  if (error) {
    console.error(`Email send error for ${email}:`, error);
    return { success: false, error };
  }

  return { success: true, data };
}

// ─── 헬퍼 ───────────────────────────────────────────
function getSubject(name: string, daysUntil: number): string {
  if (daysUntil === 7) return `일주일 뒤가 ${name}님의 생일이에요 🕯️`;
  if (daysUntil === 1) return `내일이 ${name}님의 생일이에요`;
  if (daysUntil === 0) return `오늘이 ${name}님의 생일이에요 🎂`;
  return `${name}님의 생일 알림`;
}

function buildEmailHtml({
  name,
  daysUntil,
  pageUrl,
  writeUrl,
  messages,
}: {
  name: string;
  daysUntil: number;
  pageUrl: string;
  writeUrl: string;
  messages: { content: string; author: string }[];
}): string {
  const headlineMap: Record<number, { title: string; body: string; cta: string; ctaUrl: string }> = {
    7: {
      title: "일주일 뒤가 당신의 생일이에요",
      body: "아직 7일이 남았어요. 케이크 링크를 소중한 사람들과 나눠보세요.<br/>작은 마음들이 하나씩 쌓여 당신의 생일을 채울 거예요.",
      cta: "케이크 링크 공유하기",
      ctaUrl: pageUrl,
    },
    1: {
      title: "내일이 당신의 생일이에요",
      body: "벌써 하루가 남았어요.<br/>누군가의 마음이 이미 당신을 기다리고 있을지도 몰라요.",
      cta: "케이크 확인하기",
      ctaUrl: pageUrl,
    },
    0: {
      title: "오늘이 당신의 생일이에요 🎂",
      body: "태어나줘서 고마워요.<br/>당신이 있어 세상이 조금 더 따뜻해요.",
      cta: "마음이 담긴 케이크 보러 가기",
      ctaUrl: pageUrl,
    },
  };

  const { title, body, cta, ctaUrl } = headlineMap[daysUntil] ?? headlineMap[0];

  // 메시지 미리보기 (최대 2개)
  const messagePreview =
    messages.length > 0
      ? `
      <div style="margin: 28px 0; border-left: 2px solid #D4A878; padding-left: 20px;">
        <p style="font-size: 11px; letter-spacing: 0.15em; color: #B0A08A; text-transform: uppercase; margin-bottom: 12px;">
          받은 메시지
        </p>
        ${messages
          .slice(0, 2)
          .map(
            (m) => `
          <div style="margin-bottom: 16px;">
            <p style="font-size: 14px; color: #2C2416; line-height: 1.9; font-weight: 300; margin: 0 0 6px;">"${m.content}"</p>
            <p style="font-size: 11px; color: #B0A08A; margin: 0;">— ${m.author}</p>
          </div>`
          )
          .join("")}
        ${
          messages.length > 2
            ? `<p style="font-size: 12px; color: #C4956A; margin-top: 8px;">+${messages.length - 2}개의 메시지가 더 있어요</p>`
            : ""
        }
      </div>`
      : daysUntil === 0
      ? `
      <div style="margin: 28px 0; text-align: center; padding: 24px; background: #F0E8D6; border-radius: 2px;">
        <p style="font-size: 13px; color: #7A6A50; line-height: 1.8; margin: 0;">
          아직 메시지가 없어요.<br/>
          <a href="${writeUrl}" style="color: #C4956A; text-decoration: none;">당신이 첫 번째 마음을 남겨보는 건 어떨까요?</a>
        </p>
      </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#F8F4ED; font-family: 'Georgia', 'Noto Serif KR', serif;">
  <div style="max-width: 520px; margin: 40px auto; padding: 0 20px;">

    <!-- 헤더 -->
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="font-size: 11px; letter-spacing: 0.3em; color: #B0A08A; text-transform: uppercase; margin: 0 0 8px;">
        느슨한 촛불
      </p>
      <!-- 촛불 SVG -->
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.6;">
        <ellipse cx="18" cy="8" rx="4" ry="6" fill="#C4956A" opacity="0.5"/>
        <ellipse cx="18" cy="6" rx="2.5" ry="4.5" fill="#E8C4A0" opacity="0.8"/>
        <ellipse cx="18" cy="4.5" rx="1.2" ry="2.5" fill="#FFF5E0"/>
        <rect x="15" y="14" width="6" height="16" rx="1" fill="#D4A878" opacity="0.6"/>
      </svg>
    </div>

    <!-- 메인 카드 -->
    <div style="background: #FFFCF5; border: 1px solid #D6CCB8; border-radius: 2px; padding: 40px 36px; box-shadow: 0 4px 32px rgba(44,36,22,0.07);">

      <!-- D-day 배지 -->
      ${
        daysUntil === 0
          ? `<div style="text-align:center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 16px; border: 1px solid #E8C4A0; border-radius: 999px; font-size: 11px; letter-spacing: 0.1em; color: #C4956A; background: rgba(196,149,106,0.06);">
            🎂 오늘이 생일이에요
          </span>
        </div>`
          : daysUntil === 1
          ? `<div style="text-align:center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 16px; border: 1px solid #E8C4A0; border-radius: 999px; font-size: 11px; letter-spacing: 0.1em; color: #C4956A; background: rgba(196,149,106,0.06);">
            D-1
          </span>
        </div>`
          : `<div style="text-align:center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 16px; border: 1px solid #E8C4A0; border-radius: 999px; font-size: 11px; letter-spacing: 0.1em; color: #C4956A; background: rgba(196,149,106,0.06);">
            D-7
          </span>
        </div>`
      }

      <!-- 제목 -->
      <h1 style="font-size: 22px; font-weight: 400; color: #2C2416; text-align: center; line-height: 1.5; margin: 0 0 16px;">
        ${name}님,<br/>${title}
      </h1>

      <!-- 구분선 -->
      <div style="width: 36px; height: 1px; background: #D6CCB8; margin: 0 auto 24px;"></div>

      <!-- 본문 -->
      <p style="font-size: 14px; color: #7A6A50; line-height: 1.9; text-align: center; font-weight: 300; margin: 0 0 8px;">
        ${body}
      </p>

      <!-- 메시지 미리보기 -->
      ${messagePreview}

      <!-- CTA 버튼 -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${ctaUrl}"
          style="display: inline-block; padding: 14px 32px; background: #2C2416; color: #F8F4ED; text-decoration: none; font-size: 13px; letter-spacing: 0.1em; border-radius: 2px;">
          ${cta}
        </a>
      </div>
    </div>

    <!-- 푸터 -->
    <div style="text-align: center; margin-top: 28px;">
      <p style="font-size: 11px; color: #B0A08A; line-height: 1.8; margin: 0;">
        이 메일은 느슨한 촛불 · 조각조각에서 발송되었습니다.<br/>
        <a href="${pageUrl}" style="color: #B0A08A;">케이크 보기</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
