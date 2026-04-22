"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { PIECE_META, type PieceType } from "@/lib/supabase";

// ─── Write페이지용 촛불 미니 컴포넌트 ─────────────────────────────────
function WriteCandle({ flicker = false }: { flicker?: boolean }) {
  const flameCtrl = useAnimation();
  const glowCtrl = useAnimation();

  useEffect(() => {
    // 기본 호흡
    flameCtrl.start({
      scaleX: [1, 1.08, 0.93, 1.05, 0.97, 1],
      scaleY: [1, 0.97, 1.06, 0.95, 1.03, 1],
      y: [0, -1.5, 0.5, -1, 0, 0],
      opacity: [0.85, 0.95, 0.8, 0.92, 0.88, 0.85],
      transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
    });
    glowCtrl.start({
      opacity: [0.3, 0.5, 0.28, 0.44, 0.32],
      scale: [1, 1.06, 0.96, 1.03, 1],
      transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
    });
  }, [flameCtrl, glowCtrl]);

  useEffect(() => {
    if (!flicker) return;
    // 메시지 전송 성공 시 강한 일렇임
    flameCtrl.start({
      scaleX: [1, 1.28, 0.72, 1.22, 0.82, 1.14, 0.92, 1.06, 0.98, 1],
      scaleY: [1, 0.82, 1.24, 0.8, 1.16, 0.88, 1.08, 0.94, 1.02, 1],
      y: [0, -5, 3, -4, 2, -2.5, 1, -1.2, 0.3, 0],
      opacity: [0.85, 1, 0.65, 1, 0.7, 0.96, 0.8, 0.93, 0.87, 0.85],
      transition: {
        duration: 2.0,
        ease: "easeOut",
        onComplete: () => {
          flameCtrl.start({
            scaleX: [1, 1.08, 0.93, 1.05, 0.97, 1],
            scaleY: [1, 0.97, 1.06, 0.95, 1.03, 1],
            y: [0, -1.5, 0.5, -1, 0, 0],
            opacity: [0.85, 0.95, 0.8, 0.92, 0.88, 0.85],
            transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
          });
        },
      },
    });
    glowCtrl.start({
      opacity: [0.3, 0.85, 0.2, 0.7, 0.3],
      scale: [1, 1.5, 0.8, 1.3, 1],
      transition: { duration: 2.0, ease: "easeOut" },
    });
  }, [flicker, flameCtrl, glowCtrl]);

  return (
    <div style={{ position: "relative", width: 32, height: 40, display: "flex", alignItems: "flex-end", justifyContent: "center", margin: "0 auto" }}>
      <motion.div
        animate={glowCtrl}
        style={{
          position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)",
          width: 56, height: 56, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,200,80,0.3) 0%, rgba(212,168,120,0.12) 50%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <svg width="28" height="32" viewBox="0 0 36 36" fill="none" style={{ position: "relative", zIndex: 1 }} aria-hidden="true">
        <rect x="14.5" y="16" width="7" height="17" rx="1.5" fill="#D4A878" opacity="0.55" />
        <rect x="17.3" y="13.5" width="1.4" height="3.5" rx="0.5" fill="#8C6040" opacity="0.7" />
        <motion.g animate={flameCtrl} style={{ originX: "18px", originY: "14px" } as React.CSSProperties}>
          <ellipse cx="18" cy="9" rx="3.8" ry="5.5" fill="#F0C040" opacity="0.6" />
          <ellipse cx="18" cy="8" rx="2.5" ry="4.2" fill="#FFD060" opacity="0.82" />
          <ellipse cx="18" cy="7.5" rx="1.2" ry="2.6" fill="#FFFDE4" />
          <ellipse cx="17.2" cy="7" rx="0.5" ry="1.1" fill="white" opacity="0.7" />
        </motion.g>
      </svg>
    </div>
  );
}

interface BirthdayRecord {
  id: string;
  name: string;
  birthday: string;
}

const MAX_CHARS = 500;

// ─── 윤슬 필터 팝업 ────────────────────────────────────
interface YoonseulModalProps {
  suggestion: string;
  onKeep: () => void;
  onReplace: (text: string) => void;
}

function YoonseulModal({ suggestion, onKeep, onReplace }: YoonseulModalProps) {
  return (
    <div className="yoonseul-overlay" role="dialog" aria-modal="true">
      <motion.div
        className="yoonseul-modal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        {/* 촛불 아이콘 */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <ellipse cx="18" cy="8" rx="4" ry="6" fill="#C4956A" opacity="0.5" />
            <ellipse cx="18" cy="6" rx="2.5" ry="4.5" fill="#E8C4A0" opacity="0.8" />
            <ellipse cx="18" cy="4.5" rx="1.2" ry="2.5" fill="#FFF5E0" />
            <rect x="15" y="14" width="6" height="16" rx="1" fill="#D4A878" opacity="0.6" />
          </svg>
        </div>

        <h2 style={{
          fontSize: "1rem", fontWeight: 400,
          color: "var(--text-primary)", textAlign: "center",
          lineHeight: 1.7, marginBottom: "0.75rem",
        }}>
          이 문장은 받는 분에게<br />조금 아프게 들릴 수 있어요.
        </h2>
        <p style={{
          fontSize: "0.8rem", color: "var(--text-secondary)",
          textAlign: "center", lineHeight: 1.8, marginBottom: "1.75rem", fontWeight: 300,
        }}>
          부드럽게 바꿔보시겠어요?
        </p>

        {/* 대안 문장 */}
        {suggestion && (
          <div style={{
            padding: "1rem 1.25rem",
            background: "var(--ivory-dark)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            marginBottom: "1.5rem",
          }}>
            <p style={{
              fontSize: "0.7rem", letterSpacing: "0.1em",
              color: "var(--text-muted)", marginBottom: "0.5rem",
            }}>
              이렇게 전해보면 어떨까요
            </p>
            <p style={{
              fontSize: "0.9rem", color: "var(--text-primary)",
              lineHeight: 1.8, fontWeight: 300, fontStyle: "italic",
            }}>
              "{suggestion}"
            </p>
          </div>
        )}

        {/* 버튼 영역 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {suggestion && (
            <button
              id="yoonseul-replace-btn"
              onClick={() => onReplace(suggestion)}
              style={{
                width: "100%", padding: "0.9rem",
                background: "var(--text-primary)", color: "var(--ivory)",
                border: "none", borderRadius: "2px",
                fontSize: "0.875rem", letterSpacing: "0.08em",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              바꿔서 보내기
            </button>
          )}
          <button
            id="yoonseul-keep-btn"
            onClick={onKeep}
            style={{
              width: "100%", padding: "0.875rem",
              background: "transparent", color: "var(--text-secondary)",
              border: "1px solid var(--border)", borderRadius: "2px",
              fontSize: "0.8rem", letterSpacing: "0.05em",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            그대로 보내기
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── 메인 컴포넌트 ──────────────────────────────────────
export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [record, setRecord] = useState<BirthdayRecord | null>(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [pieceType, setPieceType] = useState<PieceType>("cream");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 윤슬 필터 팝업 상태
  const [showYoonseul, setShowYoonseul] = useState(false);
  const [yoonseulSuggestion, setYoonseulSuggestion] = useState("");
  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/birthday?id=${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) setRecord(data);
        setIsLoadingRecord(false);
      })
      .catch(() => { setNotFound(true); setIsLoadingRecord(false); });
  }, [id]);

  // 실제 메시지 저장
  const submitMessage = async (finalContent: string) => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthdayId: id,
          content: finalContent,
          author: author.trim() || "익명",
          pieceType,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "오류가 발생했습니다.");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "잠시 문제가 생겼어요.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("마음을 담은 조각 내용을 써주세요."); return; }
    if (content.trim().length > MAX_CHARS) { setError(`${MAX_CHARS}자 이내로 작성해주세요.`); return; }

    setIsChecking(true);
    setError("");

    try {
      // 3단계 필터 API 호출
      const checkRes = await fetch("/api/check-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (checkRes.status === 429) {
        setError("잠시 후 다시 시도해주세요. (1분에 3번까지 가능해요)");
        setIsChecking(false);
        return;
      }

      const checkData = await checkRes.json();

      if (!checkData.safe) {
        // 윤슬 팝업 표시
        setYoonseulSuggestion(checkData.suggestion || "");
        setShowYoonseul(true);
        setPendingSubmit(true);
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
      await submitMessage(content);
    } catch {
      // 필터 API 오류 시 그냥 제출 허용
      setIsChecking(false);
      await submitMessage(content);
    }
  };

  // 팝업: 그대로 보내기
  const handleKeep = async () => {
    setShowYoonseul(false);
    setPendingSubmit(false);
    await submitMessage(content);
  };

  // 팝업: 대안 문장으로 바꿔 보내기
  const handleReplace = async (suggestion: string) => {
    setShowYoonseul(false);
    setPendingSubmit(false);
    setContent(suggestion);
    await submitMessage(suggestion);
  };

  // ─── 로딩 ─────────────────────────────────────────────
  if (isLoadingRecord) {
    return (
      <main style={centeredStyle}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"
          style={{ animation: "spin 1.5s linear infinite" }} aria-label="로딩 중">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </main>
    );
  }

  // ─── 404 ──────────────────────────────────────────────
  if (notFound || !record) {
    return (
      <main style={{ ...centeredStyle, flexDirection: "column", gap: "1rem" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>존재하지 않는 롤링페이퍼예요.</p>
        <Link href="/" style={backLinkStyle}>처음으로 돌아가기</Link>
      </main>
    );
  }

  // ─── 제출 완료 ─────────────────────────────────────────
  if (success) {
    return (
      <main style={{ ...centeredStyle, flexDirection: "column", padding: "2rem 1.5rem", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={cardStyle}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            {/* 메시지 전송 성공 → 촛불 일렁임 */}
            <div style={{ marginBottom: "1.5rem" }}>
              <WriteCandle flicker={true} />
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--text-primary)", marginBottom: "0.625rem" }}>
              조각이 도착했어요 🍰
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300 }}>
              {record.name}님의 케이크에 조용히<br />당신의 조각이 얹혔어요.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <button id="view-rolling-paper-btn" onClick={() => router.push(`/birthday/${id}`)}
              style={primaryBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--text-primary)"; }}>
              롤링페이퍼 보러가기
            </button>
            <button id="write-another-btn"
              onClick={() => { setContent(""); setAuthor(""); setSuccess(false); setIsSubmitting(false); }}
              style={secondaryBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
              메시지 한 장 더 쓰기
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ─── 작성 폼 ───────────────────────────────────────────
  const remaining = MAX_CHARS - content.length;
  const isNearLimit = remaining <= 50;
  const isBusy = isSubmitting || isChecking;

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "3rem 1.5rem", position: "relative", zIndex: 1,
    }}>
      {/* 윤슬 필터 팝업 */}
      <AnimatePresence>
        {showYoonseul && pendingSubmit && (
          <YoonseulModal
            suggestion={yoonseulSuggestion}
            onKeep={handleKeep}
            onReplace={handleReplace}
          />
        )}
      </AnimatePresence>

      {/* 뒤로가기 */}
      <nav className="animate-fade-in" style={{ width: "100%", maxWidth: "520px", marginBottom: "2rem" }}>
        <Link href={`/birthday/${id}`} style={{
          fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.1em",
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M8 2L4 6l4 4" />
          </svg>
          {record.name}님의 롤링페이퍼로
        </Link>
      </nav>

      {/* 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={cardStyle}
      >
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "1rem" }} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--accent)" strokeWidth="1.2" style={{ opacity: 0.7 }}>
              <rect x="2" y="6" width="24" height="16" rx="2" />
              <path d="M2 8l12 9 12-9" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: "0.5rem" }}>
            {record.name}님의 케이크에<br />조각 하나 보태요
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 300 }}>
            익명으로 남겨도 좋아요 — 당신의 조각이 오늘을 완성합니다.
          </p>
        </div>

        <div style={{ width: "40px", height: "1px", background: "var(--border)", margin: "0 auto 2.5rem" }} aria-hidden="true" />

        <form onSubmit={handleSubmit} noValidate>
          {/* ─ 조각 종류 선택기 ─ */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ ...labelStyle, display: "block", marginBottom: "0.75rem" }}>
              조각 종류 선택
            </label>
            <div className="piece-selector">
              {(Object.keys(PIECE_META) as PieceType[]).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  id={`piece-type-${pt}`}
                  className={`piece-option${pieceType === pt ? " selected" : ""}`}
                  onClick={() => setPieceType(pt)}
                >
                  <span className="piece-option-emoji">{PIECE_META[pt].emoji}</span>
                  {PIECE_META[pt].label}
                </button>
              ))}
            </div>
          </div>

          {/* 조각 내용 textarea */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="message-content" style={labelStyle}>
              마음 조각 — <span style={{ color: "var(--accent)" }}>*</span>
            </label>

            <div style={{ position: "relative" }}>
              <textarea
                id="message-content"
                value={content}
                onChange={(e) => { setContent(e.target.value); setError(""); }}
                placeholder={`${record.name}님이 읽을 메시지를 자유롭게 써주세요.\n짧아도, 서툘러도 괜찮아요.`}
                maxLength={MAX_CHARS}
                rows={6}
                style={{
                  width: "100%", padding: "1rem",
                  background: "var(--ivory-dark)", border: "1px solid var(--border)",
                  borderRadius: "2px", fontSize: "0.9rem", color: "var(--text-primary)",
                  lineHeight: 1.9, resize: "vertical", outline: "none",
                  transition: "border-color 0.3s ease", fontFamily: "inherit",
                  fontWeight: 300, minHeight: "160px",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-light)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <span style={{
                position: "absolute", bottom: "0.625rem", right: "0.75rem",
                fontSize: "0.7rem",
                color: isNearLimit ? "var(--accent)" : "var(--text-muted)",
                transition: "color 0.3s ease",
              }}>
                {content.length} / {MAX_CHARS}
              </span>
            </div>
          </div>

          {/* 작성자 이름 */}
          <div style={{ marginBottom: "2rem" }}>
            <label htmlFor="message-author" style={labelStyle}>조각을 보내는 사람</label>
            <input
              id="message-author" type="text" value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="익명" maxLength={20}
              style={{
                width: "100%", padding: "0.875rem 1rem", background: "transparent",
                border: "none", borderBottom: "1px solid var(--border)",
                fontSize: "0.9375rem", color: "var(--text-primary)",
                outline: "none", transition: "border-color 0.3s ease", fontFamily: "inherit",
              }}
              onFocus={(e) => { e.currentTarget.style.borderBottomColor = "var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderBottomColor = "var(--border)"; }}
            />
          </div>

          {/* 에러 */}
          {error && (
            <p role="alert" style={{
              fontSize: "0.8125rem", color: "#A0704A", marginBottom: "1.25rem",
              textAlign: "center", padding: "0.625rem",
              background: "rgba(196, 149, 106, 0.08)", borderRadius: "2px",
            }}>
              {error}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            id="submit-piece-btn" type="submit"
            disabled={isBusy || content.trim().length === 0}
            style={{
              ...primaryBtnStyle,
              opacity: content.trim().length === 0 ? 0.5 : 1,
              cursor: isBusy || content.trim().length === 0 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!isBusy && content.trim().length > 0) e.currentTarget.style.background = "var(--accent)"; }}
            onMouseLeave={(e) => { if (!isBusy) e.currentTarget.style.background = "var(--text-primary)"; }}
          >
            {isChecking ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: "spin 1s linear infinite" }} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                조각을 다듬는 중…
              </span>
            ) : isSubmitting ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: "spin 1s linear infinite" }} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                전달 중…
              </span>
            ) : `마음 한 조각 보태기 ${PIECE_META[pieceType].emoji}`}
          </button>
        </form>
      </motion.div>

      <p className="animate-fade-in delay-700" style={{
        marginTop: "2rem", fontSize: "0.72rem", color: "var(--text-muted)",
        textAlign: "center", lineHeight: 1.7, fontWeight: 300,
      }}>
        작성된 조각은 수정·삭제가 어려워요.
        <br />천천히 마음을 다듬어 보내주세요.
      </p>


      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </main>
  );
}

// ────────── 공통 스타일 상수 ──────────
const centeredStyle: React.CSSProperties = {
  minHeight: "100vh", display: "flex", alignItems: "center",
  justifyContent: "center", position: "relative", zIndex: 1,
};

const cardStyle: React.CSSProperties = {
  width: "100%", maxWidth: "520px",
  background: "var(--card-bg)",
  backdropFilter: "blur(12px)",
  border: "1px solid var(--border)",
  borderRadius: "2px",
  padding: "2.75rem 2.5rem",
  boxShadow: "0 4px 40px var(--shadow)",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.7rem", letterSpacing: "0.15em",
  color: "var(--text-muted)", marginBottom: "0.625rem", textTransform: "uppercase",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%", padding: "0.9375rem",
  background: "var(--text-primary)", color: "var(--ivory)",
  border: "none", borderRadius: "2px",
  fontSize: "0.875rem", letterSpacing: "0.1em",
  cursor: "pointer", transition: "all 0.3s ease",
  fontFamily: "inherit", fontWeight: 400,
};

const secondaryBtnStyle: React.CSSProperties = {
  width: "100%", padding: "0.875rem",
  background: "transparent", color: "var(--text-secondary)",
  border: "1px solid var(--border)", borderRadius: "2px",
  fontSize: "0.8125rem", letterSpacing: "0.05em",
  cursor: "pointer", transition: "all 0.3s ease",
  fontFamily: "inherit",
};

const backLinkStyle: React.CSSProperties = {
  fontSize: "0.8125rem", color: "var(--accent)",
  textDecoration: "none", letterSpacing: "0.05em",
};
