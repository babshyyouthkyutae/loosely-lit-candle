"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { TOPPING_MAP } from "@/lib/supabase";

// ─── 디지털 촛불 컴포넌트 (Framer Motion) ─────────────────
interface CandleProps {
  flicker?: boolean;   // 강한 일렁임 트리거
  size?: number;
}

function DigitalCandle({ flicker = false, size = 42 }: CandleProps) {
  const flameControls = useAnimation();
  const glowControls = useAnimation();

  // 기본 호흡 애니메이션 (항상 동작)
  useEffect(() => {
    flameControls.start({
      scaleX: [1, 1.08, 0.93, 1.05, 0.97, 1],
      scaleY: [1, 0.97, 1.06, 0.95, 1.03, 1],
      y: [0, -1.5, 0.5, -1, 0, 0],
      opacity: [0.85, 0.95, 0.8, 0.92, 0.88, 0.85],
      transition: {
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    });

    glowControls.start({
      opacity: [0.4, 0.55, 0.38, 0.5, 0.42, 0.4],
      scale: [1, 1.06, 0.96, 1.04, 0.98, 1],
      transition: {
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    });
  }, [flameControls, glowControls]);

  // 일렁임 트리거 — 메시지 작성될 때마다 호출
  useEffect(() => {
    if (!flicker) return;

    // 강한 일렁임 → 점차 안정화
    flameControls.start({
      scaleX: [1, 1.22, 0.78, 1.18, 0.85, 1.1, 0.94, 1.05, 0.98, 1],
      scaleY: [1, 0.88, 1.18, 0.84, 1.12, 0.9, 1.06, 0.95, 1.02, 1],
      y: [0, -4, 2, -3, 1.5, -2, 0.8, -1, 0.2, 0],
      opacity: [0.85, 1, 0.7, 0.98, 0.75, 0.95, 0.82, 0.92, 0.87, 0.85],
      transition: {
        duration: 1.8,
        ease: "easeOut",
        onComplete: () => {
          // 일렁임 후 다시 기본 호흡으로 복귀
          flameControls.start({
            scaleX: [1, 1.08, 0.93, 1.05, 0.97, 1],
            scaleY: [1, 0.97, 1.06, 0.95, 1.03, 1],
            y: [0, -1.5, 0.5, -1, 0, 0],
            opacity: [0.85, 0.95, 0.8, 0.92, 0.88, 0.85],
            transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
          });
        },
      },
    });

    glowControls.start({
      opacity: [0.4, 0.75, 0.3, 0.65, 0.4],
      scale: [1, 1.3, 0.85, 1.2, 1],
      transition: { duration: 1.8, ease: "easeOut" },
    });
  }, [flicker, flameControls, glowControls]);

  const s = size;

  return (
    <div style={{ position: "relative", width: s, height: s + 8, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {/* 주변 발광 (glow) */}
      <motion.div
        animate={glowControls}
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: s * 1.4,
          height: s * 1.4,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,120,0.28) 0%, rgba(196,149,106,0.1) 50%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* 촛불 SVG (불꽃 + 심지 + 몸통) */}
      <svg
        width={s}
        height={s}
        viewBox="0 0 36 36"
        fill="none"
        style={{ position: "relative", zIndex: 1 }}
        aria-hidden="true"
      >
        {/* 몸통 */}
        <rect x="14.5" y="16" width="7" height="17" rx="1.5" fill="#D4A878" opacity="0.55" />
        {/* 심지 */}
        <rect x="17.3" y="13.5" width="1.4" height="3.5" rx="0.5" fill="#8C6040" opacity="0.7" />

        {/* 불꽃 — Framer Motion으로 애니메이션 */}
        <motion.g
          animate={flameControls}
          style={{ originX: "18px", originY: "14px" } as React.CSSProperties}
        >
          {/* 불꽃 외층 (주황) */}
          <ellipse cx="18" cy="9" rx="3.8" ry="5.5" fill="#E8A050" opacity="0.6" />
          {/* 불꽃 중간 (밝은 황금) */}
          <ellipse cx="18" cy="8" rx="2.5" ry="4.2" fill="#F0C060" opacity="0.8" />
          {/* 불꽃 핵심 (흰빛) */}
          <ellipse cx="18" cy="7.5" rx="1.2" ry="2.6" fill="#FFFDE4" />
          {/* 불꽃 하이라이트 */}
          <ellipse cx="17.2" cy="7" rx="0.5" ry="1.1" fill="white" opacity="0.7" />
        </motion.g>
      </svg>
    </div>
  );
}

// ─── 메인 페이지 ───────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [birthday, setBirthday] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false); // 제출 성공 트리거

  const togglePref = (kw: string) => {
    setPreferences(prev =>
      prev.includes(kw) ? prev.filter(p => p !== kw) : [...prev, kw]
    );
  };

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
        body: JSON.stringify({ birthday, name: name.trim() || "익명", email: email.trim() || null, preferences }),
      });

      if (!response.ok) throw new Error("서버 오류가 발생했습니다.");

      const data = await response.json();

      // 촛불 일렁임 트리거 후 페이지 이동
      setSubmitted(true);
      setTimeout(() => router.push(`/birthday/${data.id}`), 800);
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
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {/* 디지털 촛불 — 제출 성공 시 일렁임 */}
        <DigitalCandle flicker={submitted} size={42} />

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

        {/* 슬로건 — 1.5초 Fade-in */}
        <motion.p
          className="slogan"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontWeight: 400,
            marginTop: "0.25rem",
          }}
        >
          멀리서 켜둔 마음 하나
        </motion.p>
      </motion.div>

      {/* 메인 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--card-bg)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          padding: "3rem 2.5rem",
          boxShadow: "0 4px 40px var(--shadow), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}
      >
        {/* 헤드라인 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
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
        </motion.div>

        {/* 구분선 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            width: "40px",
            height: "1px",
            background: "var(--border)",
            margin: "0 auto 2.5rem",
            transformOrigin: "center",
          }}
          aria-hidden="true"
        />

        {/* 폼 */}
        <form onSubmit={handleSubmit} noValidate>
          {/* 이름 입력 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
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
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--border)")}
            />
          </motion.div>

          {/* 생일 입력 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
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
              onChange={(e) => { setBirthday(e.target.value); setError(""); }}
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
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--border)")}
            />
          </motion.div>

          {/* 이메일 입력 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
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
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--border)")}
            />
          </motion.div>

          {/* 취향 키워드 선택 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            style={{ marginBottom: "2rem" }}
          >
            <label style={{
              display: "block", fontSize: "0.7rem", letterSpacing: "0.15em",
              color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase",
            }}>
              취향 키워드
              <span style={{ fontSize: "0.65rem", letterSpacing: 0, marginLeft: "0.5rem", fontWeight: 300 }}>
                — 케이크 토핑으로 언제키워요
              </span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {Object.entries(TOPPING_MAP).map(([kw, meta]) => (
                <button
                  key={kw}
                  type="button"
                  id={`pref-${kw}`}
                  onClick={() => togglePref(kw)}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "999px",
                    border: `1.5px solid ${preferences.includes(kw) ? meta.color : "var(--border)"}`,
                    background: preferences.includes(kw) ? `${meta.color}22` : "transparent",
                    fontSize: "0.72rem",
                    color: preferences.includes(kw) ? meta.color : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: "0.25rem",
                  }}
                >
                  <span>{meta.emoji}</span>{kw}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 에러 메시지 */}
          <AnimatePresence>
            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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
              </motion.p>
            )}
          </AnimatePresence>

          {/* 제출 버튼 */}
          <motion.button
            id="submit-birthday-btn"
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            style={{
              width: "100%",
              padding: "0.9375rem",
              background: isLoading ? "var(--ivory-deep)" : "var(--text-primary)",
              color: isLoading ? "var(--text-muted)" : "var(--ivory)",
              border: "none",
              borderRadius: "2px",
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background 0.3s ease, color 0.3s ease",
              fontFamily: "inherit",
              fontWeight: 400,
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--accent)"; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--text-primary)"; }}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: "spin 1s linear infinite" }} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                잠시만요…
              </span>
            ) : "나의 롤링페이퍼 만들기"}
          </motion.button>
        </form>
      </motion.div>

      {/* 하단 문구 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
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
      </motion.p>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </main>
  );
}
