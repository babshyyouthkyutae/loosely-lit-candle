"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface BirthdayRecord {
  id: string;
  name: string;
  birthday: string;
}

const MAX_CHARS = 500;

export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [record, setRecord] = useState<BirthdayRecord | null>(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("마음을 담은 메시지를 써주세요.");
      return;
    }
    if (content.trim().length > MAX_CHARS) {
      setError(`메시지는 ${MAX_CHARS}자 이내로 작성해주세요.`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthdayId: id,
          content,
          author: author.trim() || "익명",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "오류가 발생했습니다.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "잠시 문제가 생겼어요. 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  };

  // ─────────────── 로딩 ───────────────
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

  // ─────────────── 404 ───────────────
  if (notFound || !record) {
    return (
      <main style={{ ...centeredStyle, flexDirection: "column", gap: "1rem" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          존재하지 않는 롤링페이퍼예요.
        </p>
        <Link href="/" style={backLinkStyle}>처음으로 돌아가기</Link>
      </main>
    );
  }

  // ─────────────── 제출 완료 ───────────────
  if (success) {
    return (
      <main style={{ ...centeredStyle, flexDirection: "column", padding: "2rem 1.5rem", zIndex: 1 }}>
        <div className="animate-fade-in-up" style={cardStyle}>
          {/* 완료 아이콘 */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              border: "1.5px solid var(--accent-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.25rem",
              background: "rgba(196, 149, 106, 0.06)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--text-primary)", marginBottom: "0.625rem" }}>
              마음을 전달했어요
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300 }}>
              {record.name}님의 생일에 조용히<br />당신의 마음이 닿을 거예요.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <button
              id="view-rolling-paper-btn"
              onClick={() => router.push(`/birthday/${id}`)}
              style={primaryBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--text-primary)"; }}
            >
              롤링페이퍼 보러가기
            </button>
            <button
              id="write-another-btn"
              onClick={() => { setContent(""); setAuthor(""); setSuccess(false); setIsSubmitting(false); }}
              style={secondaryBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              메시지 한 장 더 쓰기
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────── 작성 폼 ───────────────
  const remaining = MAX_CHARS - content.length;
  const isNearLimit = remaining <= 50;

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "3rem 1.5rem", position: "relative", zIndex: 1,
    }}>
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
      <div className="animate-fade-in-up delay-100" style={cardStyle}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          {/* 작은 봉투 아이콘 */}
          <div style={{ marginBottom: "1rem" }} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
              stroke="var(--accent)" strokeWidth="1.2" style={{ opacity: 0.7 }}>
              <rect x="2" y="6" width="24" height="16" rx="2" />
              <path d="M2 8l12 9 12-9" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: "0.5rem" }}>
            {record.name}님께<br />마음을 전해요
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 300 }}>
            익명으로 남겨도 좋아요
          </p>
        </div>

        {/* 구분선 */}
        <div style={{ width: "40px", height: "1px", background: "var(--border)", margin: "0 auto 2.5rem" }} aria-hidden="true" />

        <form onSubmit={handleSubmit} noValidate>
          {/* 메시지 textarea */}
          <div className="animate-fade-in-up delay-200" style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="message-content" style={labelStyle}>
              메시지 <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                id="message-content"
                value={content}
                onChange={(e) => { setContent(e.target.value); setError(""); }}
                placeholder={`${record.name}님이 읽을 메시지를 자유롭게 써주세요.\n짧아도, 서툴러도 괜찮아요.`}
                maxLength={MAX_CHARS}
                rows={6}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "var(--ivory-dark)",
                  border: "1px solid var(--border)",
                  borderRadius: "2px",
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                  lineHeight: 1.9,
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  fontFamily: "inherit",
                  fontWeight: 300,
                  minHeight: "160px",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-light)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              {/* 글자수 카운터 */}
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
          <div className="animate-fade-in-up delay-300" style={{ marginBottom: "2rem" }}>
            <label htmlFor="message-author" style={labelStyle}>
              보내는 사람
            </label>
            <input
              id="message-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="익명"
              maxLength={20}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                fontSize: "0.9375rem",
                color: "var(--text-primary)",
                outline: "none",
                transition: "border-color 0.3s ease",
                fontFamily: "inherit",
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
            id="submit-message-btn"
            type="submit"
            disabled={isSubmitting || content.trim().length === 0}
            style={{
              ...primaryBtnStyle,
              opacity: content.trim().length === 0 ? 0.5 : 1,
              cursor: isSubmitting || content.trim().length === 0 ? "not-allowed" : "pointer",
              background: isSubmitting ? "var(--ivory-deep)" : "var(--text-primary)",
              color: isSubmitting ? "var(--text-muted)" : "var(--ivory)",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && content.trim().length > 0) {
                e.currentTarget.style.background = "var(--accent)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = "var(--text-primary)";
              }
            }}
          >
            {isSubmitting ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: "spin 1s linear infinite" }} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                전달 중…
              </span>
            ) : "마음 전하기"}
          </button>
        </form>
      </div>

      {/* 하단 안내 */}
      <p className="animate-fade-in delay-700" style={{
        marginTop: "2rem", fontSize: "0.72rem", color: "var(--text-muted)",
        textAlign: "center", lineHeight: 1.7, fontWeight: 300,
      }}>
        작성된 메시지는 수정·삭제가 어려워요.
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
  background: "rgba(255, 252, 245, 0.9)",
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
