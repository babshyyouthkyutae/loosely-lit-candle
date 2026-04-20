"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [birthday, setBirthday] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!birthday) {
      setError("생일을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/birthday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthday, name: name.trim() || "익명", email: email.trim() || null }),
      });

      if (!response.ok) {
        throw new Error("서버 오류가 발생했습니다.");
      }

      const data = await response.json();
      router.push(`/birthday/${data.id}`);
    } catch {
      setError("잠시 문제가 생겼어요. 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* 상단 장식 */}
      <div
        className="animate-fade-in delay-100"
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {/* 촛불 아이콘 */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.7 }}
          aria-hidden="true"
        >
          <ellipse cx="18" cy="8" rx="4" ry="6" fill="#C4956A" opacity="0.5" />
          <ellipse cx="18" cy="6" rx="2.5" ry="4.5" fill="#E8C4A0" opacity="0.8" />
          <ellipse cx="18" cy="4.5" rx="1.2" ry="2.5" fill="#FFF5E0" />
          <rect x="15" y="14" width="6" height="16" rx="1" fill="#D4A878" opacity="0.6" />
          <rect x="16.5" y="13" width="3" height="2" rx="0.5" fill="#C4956A" opacity="0.4" />
        </svg>

        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            fontWeight: 300,
          }}
        >
          느슨한 촛불
        </p>
      </div>

      {/* 메인 카드 */}
      <div
        className="animate-fade-in-up delay-200"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(255, 252, 245, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          padding: "3rem 2.5rem",
          boxShadow: "0 4px 40px var(--shadow), 0 1px 0 rgba(255,255,255,0.8) inset",
        }}
      >
        {/* 헤드라인 */}
        <div
          className="animate-fade-in-up delay-300"
          style={{ marginBottom: "2.5rem", textAlign: "center" }}
        >
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 400,
              color: "var(--text-primary)",
              lineHeight: 1.5,
              letterSpacing: "-0.01em",
              marginBottom: "0.875rem",
            }}
          >
            당신의 생일을
            <br />
            기억하고 싶어요
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            혼자인 것 같아도, 누군가는 조용히
            <br />
            당신의 날을 기다리고 있어요.
          </p>
        </div>

        {/* 구분선 */}
        <div
          className="animate-fade-in delay-500"
          style={{
            width: "40px",
            height: "1px",
            background: "var(--border)",
            margin: "0 auto 2.5rem",
          }}
          aria-hidden="true"
        />

        {/* 폼 */}
        <form onSubmit={handleSubmit} noValidate>
          {/* 이름 입력 */}
          <div
            className="animate-fade-in-up delay-500"
            style={{ marginBottom: "1.25rem" }}
          >
            <label
              htmlFor="name-input"
              style={{
                display: "block",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--text-muted)",
                marginBottom: "0.625rem",
                textTransform: "uppercase",
              }}
            >
              이름 또는 닉네임
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="익명으로 남겨도 괜찮아요"
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
              onFocus={(e) =>
                (e.currentTarget.style.borderBottomColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderBottomColor = "var(--border)")
              }
            />
          </div>

          {/* 생일 입력 */}
          <div
            className="animate-fade-in-up delay-700"
            style={{ marginBottom: "1.25rem" }}
          >
            <label
              htmlFor="birthday-input"
              style={{
                display: "block",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--text-muted)",
                marginBottom: "0.625rem",
                textTransform: "uppercase",
              }}
            >
              생일 <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              id="birthday-input"
              type="date"
              value={birthday}
              onChange={(e) => {
                setBirthday(e.target.value);
                setError("");
              }}
              required
              max={new Date().toISOString().split("T")[0]}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                fontSize: "0.9375rem",
                color: birthday ? "var(--text-primary)" : "var(--text-muted)",
                outline: "none",
                transition: "border-color 0.3s ease",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderBottomColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderBottomColor = "var(--border)")
              }
            />
          </div>

          {/* 이메일 입력 */}
          <div
            className="animate-fade-in-up delay-700"
            style={{ marginBottom: "2rem" }}
          >
            <label
              htmlFor="email-input"
              style={{
                display: "block",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--text-muted)",
                marginBottom: "0.625rem",
                textTransform: "uppercase",
              }}
            >
              이메일
              <span style={{ fontSize: "0.65rem", letterSpacing: 0, marginLeft: "0.5rem", fontWeight: 300 }}>
                — 생일 알림을 받고 싶다면
              </span>
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="알림 받을 이메일 (선택)"
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
              onFocus={(e) =>
                (e.currentTarget.style.borderBottomColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderBottomColor = "var(--border)")
              }
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p
              role="alert"
              style={{
                fontSize: "0.8125rem",
                color: "#A0704A",
                marginBottom: "1.25rem",
                textAlign: "center",
                padding: "0.625rem",
                background: "rgba(196, 149, 106, 0.08)",
                borderRadius: "2px",
              }}
            >
              {error}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            id="submit-birthday-btn"
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.9375rem",
              background: isLoading
                ? "var(--ivory-deep)"
                : "var(--text-primary)",
              color: isLoading ? "var(--text-muted)" : "var(--ivory)",
              border: "none",
              borderRadius: "2px",
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
              fontWeight: 400,
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = "var(--accent)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = "var(--text-primary)";
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ animation: "spin 1s linear infinite" }}
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                잠시만요…
              </span>
            ) : (
              "나의 롤링페이퍼 만들기"
            )}
          </button>
        </form>
      </div>

      {/* 하단 문구 */}
      <p
        className="animate-fade-in delay-700"
        style={{
          marginTop: "2rem",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          textAlign: "center",
          lineHeight: 1.7,
          fontWeight: 300,
        }}
      >
         당신의 생일과 이메일은 안전하게 보관되며
        <br />
        D-7 · D-1 · 생일 당일에 조용히 알림을 드려요.
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
