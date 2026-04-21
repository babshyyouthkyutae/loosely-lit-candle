"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";

// ─── 디지털 촛불 (birthday 페이지용) ──────────────────────
function BirthdayCandle({ messageCount = 0, isToday = false }: { messageCount?: number; isToday?: boolean }) {
  const flameCtrl = useAnimation();
  const glowCtrl = useAnimation();

  // 메시지 개수에 따른 강도 계산 (1~10 → 0.0~1.0 범위)
  const intensity = Math.min(messageCount / 10, 1);
  // 기본 호흡 속도: 메시지 많을수록 더 빠르게 일렁임
  const duration = 3.2 - intensity * 1.2; // 3.2s → 2.0s
  const scaleMax = 1.08 + intensity * 0.1; // 1.08 → 1.18

  useEffect(() => {
    flameCtrl.start({
      scaleX: [1, scaleMax, 0.93, scaleMax * 0.97, 0.97, 1],
      scaleY: [1, 0.97, 1.06 + intensity * 0.06, 0.95, 1.03, 1],
      y: [0, -(1.5 + intensity * 2), 0.5, -1, 0, 0],
      opacity: [0.85, 0.9 + intensity * 0.1, 0.78, 0.92, 0.88, 0.85],
      transition: { duration, repeat: Infinity, ease: "easeInOut" },
    });
    glowCtrl.start({
      opacity: [0.35 + intensity * 0.2, 0.55 + intensity * 0.25, 0.35, 0.5 + intensity * 0.15, 0.38],
      scale: [1, 1.06 + intensity * 0.12, 0.96, 1.04, 1],
      transition: { duration, repeat: Infinity, ease: "easeInOut" },
    });
  }, [flameCtrl, glowCtrl, duration, scaleMax, intensity]);

  return (
    <div style={{ position: "relative", width: 36, height: 44, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {/* glow */}
      <motion.div
        animate={glowCtrl}
        style={{
          position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)",
          width: isToday ? 72 : 52, height: isToday ? 72 : 52,
          borderRadius: "50%",
          background: isToday
            ? "radial-gradient(circle, rgba(255,200,80,0.35) 0%, rgba(212,168,120,0.15) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(212,168,120,0.22) 0%, rgba(196,149,106,0.08) 50%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ position: "relative", zIndex: 1 }} aria-hidden="true">
        <rect x="14.5" y="16" width="7" height="17" rx="1.5" fill="#D4A878" opacity="0.55" />
        <rect x="17.3" y="13.5" width="1.4" height="3.5" rx="0.5" fill="#8C6040" opacity="0.7" />
        <motion.g animate={flameCtrl} style={{ originX: "18px", originY: "14px" } as React.CSSProperties}>
          <ellipse cx="18" cy="9" rx="3.8" ry="5.5" fill={isToday ? "#F0C040" : "#E8A050"} opacity="0.6" />
          <ellipse cx="18" cy="8" rx="2.5" ry="4.2" fill={isToday ? "#FFD060" : "#F0C060"} opacity="0.82" />
          <ellipse cx="18" cy="7.5" rx="1.2" ry="2.6" fill="#FFFDE4" />
          <ellipse cx="17.2" cy="7" rx="0.5" ry="1.1" fill="white" opacity="0.7" />
        </motion.g>
      </svg>
    </div>
  );
}

interface Message {
  id: string;
  content: string;
  author: string;
  created_at: string;
}

interface BirthdayRecord {
  id: string;
  name: string;
  birthday: string;
  created_at: string;
  messages: Message[];
  locked: boolean;           // 서버 사이드 생일 당일 체크 결과
  lockedReason?: string;     // 잠금 이유 ("birthday_not_today" 등)
}

// ─── 날짜 유틸 ─────────────────────────────────────────
function formatBirthday(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function getDdayInfo(birthday: string): { text: string; daysLeft: number; isToday: boolean } {
  const today = new Date();
  const bday = new Date(birthday);
  const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

  // KST 기준 오늘 날짜와 비교
  const todayKST = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const todayMonth = todayKST.getMonth();
  const todayDay = todayKST.getDate();
  const isToday = bday.getMonth() === todayMonth && bday.getDate() === todayDay;

  if (thisYearBday < today && !isToday) {
    thisYearBday.setFullYear(today.getFullYear() + 1);
  }

  const diffMs = thisYearBday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (isToday) return { text: "오늘이 생일이에요 🎂", daysLeft: 0, isToday: true };
  if (diffDays === 1) return { text: "내일이 생일이에요", daysLeft: 1, isToday: false };
  return { text: `생일까지 D-${diffDays}`, daysLeft: diffDays, isToday: false };
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

// ─── Zero-Data 기본 환영 메시지 ─────────────────────────
const SYSTEM_WELCOME_MESSAGE = {
  id: "system-welcome",
  content: "당신이 태어난 날, 세상이 조금 더 따뜻해졌어요.\n오늘 이 촛불은 당신만을 위해 켜져 있어요. 🕯️",
  author: "느슨한 촛불",
  created_at: new Date().toISOString(),
  isSystem: true,
};

// ─── 메인 컴포넌트 ──────────────────────────────────────
export default function BirthdayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [record, setRecord] = useState<BirthdayRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/birthday?id=${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) setRecord(data);
        setIsLoading(false);
      })
      .catch(() => { setNotFound(true); setIsLoading(false); });
  }, [id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* fallback */ }
  };

  // ─── 로딩 ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <main style={centeredStyle}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", opacity: 0.6 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"
            style={{ animation: "spin 1.5s linear infinite" }} aria-label="로딩 중">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 300 }}>불러오는 중…</p>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </main>
    );
  }

  // ─── 404 ───────────────────────────────────────────────
  if (notFound || !record) {
    return (
      <main style={{ ...centeredStyle, flexDirection: "column", padding: "2rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", maxWidth: "360px" }}>
          <p style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.4 }}>∅</p>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 400, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            페이지를 찾을 수 없어요
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.8, fontWeight: 300 }}>
            링크가 잘못되었거나 삭제된 롤링페이퍼예요.
          </p>
          <Link href="/" className="link-underline" style={{ fontSize: "0.8125rem", color: "var(--accent)", letterSpacing: "0.05em" }}>
            처음으로 돌아가기
          </Link>
        </motion.div>
      </main>
    );
  }

  const { text: ddayText, daysLeft, isToday } = getDdayInfo(record.birthday);
  const hasMessages = record.messages.length > 0;

  // 메시지 잠금 여부 → 서버 사이드 locked 플래그를 신뢰 (단일 진실 공급원)
  // locked=true면 서버가 이미 messages:[] 반환했으므로 클라이언트 날짜 계산 불필요
  const messagesLocked = record.locked;

  // Zero-Data: 생일 당일이고 메시지 없으면 시스템 메시지 표시
  const displayMessages = !messagesLocked && !hasMessages
    ? [SYSTEM_WELCOME_MESSAGE]
    : !messagesLocked
    ? record.messages
    : [];

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "3rem 1.5rem", position: "relative", zIndex: 1,
    }}>
      {/* 뒤로가기 */}
      <nav className="animate-fade-in" style={{ width: "100%", maxWidth: "560px", marginBottom: "2.5rem" }}>
        <Link href="/" className="link-underline" style={{
          fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.1em",
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M8 2L4 6l4 4" />
          </svg>
          처음으로
        </Link>
      </nav>

      {/* 메인 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{
          width: "100%", maxWidth: "560px",
          background: "var(--card-bg)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          borderRadius: "2px", overflow: "hidden",
          boxShadow: "0 4px 40px var(--shadow)",
        }}
      >
        {/* 헤더 영역 */}
        <div style={{
          padding: "2.5rem", textAlign: "center",
          borderBottom: "1px solid var(--ivory-deep)",
          background: "linear-gradient(180deg, var(--ivory-dark) 0%, transparent 100%)",
        }}>
          {/* 디지털 촛불 — 메시지 개수에 따라 강도 증가 */}
          <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "center" }}>
            <BirthdayCandle messageCount={record.messages.length} isToday={isToday} />
          </div>

          {/* D-day 배지 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              display: "inline-block", padding: "0.3rem 0.875rem",
              border: "1px solid var(--accent-light)", borderRadius: "999px",
              fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--accent)",
              marginBottom: "1.25rem", background: "rgba(196, 149, 106, 0.06)",
            }}
          >
            {ddayText}
          </motion.div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 400, color: "var(--text-primary)", marginBottom: "0.5rem", lineHeight: 1.4 }}>
            {record.name}님의<br />롤링페이퍼
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 300 }}>
            {formatBirthday(record.birthday)}
          </p>
        </div>

        {/* 메시지 영역 헤더 */}
        <div style={{ padding: "1.25rem 2.5rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", textTransform: "uppercase" }}>
            메시지 {isToday && hasMessages && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "18px", height: "18px", background: "var(--accent)", color: "var(--ivory)",
                borderRadius: "999px", fontSize: "0.6rem", marginLeft: "0.375rem", fontWeight: 500,
              }}>
                {record.messages.length}
              </span>
            )}
          </span>
        </div>

        {/* 메시지 목록 */}
        <div style={{ padding: "1.25rem 2.5rem 2rem" }}>

          {/* ── 생일 당일 잠금 안내 ── */}
          {messagesLocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ textAlign: "center", padding: "2.5rem 1rem" }}
            >
              <div style={{
                width: "56px", height: "56px",
                border: "1.5px solid var(--accent-light)",
                borderRadius: "50%", margin: "0 auto 1.25rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(196, 149, 106, 0.05)",
              }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.9, fontWeight: 300 }}>
                롤링페이퍼는 <strong style={{ color: "var(--accent)", fontWeight: 400 }}>생일 당일</strong>에 열려요.
                <br />
                <span style={{ fontSize: "0.8rem", opacity: 0.75 }}>
                  {daysLeft > 0
                    ? `D-${daysLeft} · 지금은 마음을 남겨두는 시간이에요.`
                    : "잠시 후면 읽을 수 있어요."}
                </span>
              </p>
            </motion.div>
          )}

          {/* ── 생일 당일: 메시지 표시 ── */}
          {!messagesLocked && (
            <>
              {displayMessages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300 }}>
                    아직 아무도 메시지를 남기지 않았어요.<br />링크를 공유해서 첫 번째 마음을 받아보세요.
                  </p>
                </div>
              ) : (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {displayMessages.map((msg, index) => (
                    <motion.li
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      style={{
                        padding: "1.25rem",
                        background: "var(--ivory-dark)",
                        border: "1px solid var(--border)",
                        borderRadius: "2px",
                        ...(("isSystem" in msg && msg.isSystem) ? { opacity: 0.8, fontStyle: "italic" } : {}),
                      }}
                    >
                      <p style={{
                        fontSize: "0.9rem", color: "var(--text-primary)",
                        lineHeight: 1.9, fontWeight: 300, marginBottom: "0.75rem",
                        whiteSpace: "pre-line",
                      }}>
                        {msg.content}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                          — {msg.author}
                        </p>
                        {"isSystem" in msg && msg.isSystem ? (
                          <p style={{ fontSize: "0.65rem", color: "var(--accent)", opacity: 0.6 }}>🕯️ 시스템</p>
                        ) : (
                          <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", opacity: 0.7 }}>
                            {formatRelativeDate(msg.created_at)}
                          </p>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* 하단 액션 */}
        <div style={{
          padding: "1.5rem 2.5rem 2rem",
          borderTop: "1px solid var(--ivory-deep)",
          display: "flex", flexDirection: "column", gap: "0.75rem",
        }}>
          <button
            id="write-message-btn"
            onClick={() => router.push(`/birthday/${id}/write`)}
            style={{
              width: "100%", padding: "0.9375rem",
              background: "var(--text-primary)", color: "var(--ivory)",
              border: "none", borderRadius: "2px", fontSize: "0.875rem",
              letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.3s ease",
              fontFamily: "inherit", fontWeight: 400,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--text-primary)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 10V12h2l6-6-2-2L2 10z" /><path d="M9 3l2 2" />
            </svg>
            마음 전하기
          </button>

          <button
            id="copy-link-btn" onClick={handleCopyLink}
            style={{
              width: "100%", padding: "0.875rem",
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: "2px", fontSize: "0.8125rem",
              color: copied ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer", transition: "all 0.3s ease",
              fontFamily: "inherit", letterSpacing: "0.05em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}
            onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; }}}
            onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {copied ? <path d="M2 7l3.5 3.5L12 3" /> : (<><rect x="4" y="4" width="8" height="8" rx="1" /><path d="M2 10V2h8" /></>)}
            </svg>
            {copied ? "링크가 복사되었어요" : "링크 복사하기"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.7 }}>
            링크를 공유하면 누구나 마음을 전할 수 있어요
          </p>
        </div>
      </motion.div>

      <p className="animate-fade-in delay-700" style={{
        marginTop: "2.5rem", fontSize: "0.7rem",
        color: "var(--text-muted)", letterSpacing: "0.1em", opacity: 0.6,
      }}>
        느슨한 촛불
      </p>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </main>
  );
}

const centeredStyle: React.CSSProperties = {
  minHeight: "100vh", display: "flex", alignItems: "center",
  justifyContent: "center", position: "relative", zIndex: 1,
};
