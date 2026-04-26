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
  const [submitted, setSubmitted] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // 쉴 카테고리 키워드 감지 (무드라이트 트리거용)
  const REST_KEYWORDS = ["조용한 휴식", "혼자만의 시간", "느린 걸음"];
  const hasRestKeyword = preferences.some(p => REST_KEYWORDS.includes(p));

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

      if (!response.ok) throw new Error("잠시 문제가 생겼어요.");

      const data = await response.json();

      // 케이크 주인 식별용 — localStorage에 ID 기록
      try {
        const owned: string[] = JSON.parse(localStorage.getItem("owned_cakes") || "[]");
        if (!owned.includes(data.id)) owned.push(data.id);
        localStorage.setItem("owned_cakes", JSON.stringify(owned));
      } catch { /* SSR / private browsing fallback */ }

      // 촛불 일렁임 트리거 → 감사 인터스티셜 → 페이지 이동
      setSubmitted(true);
      setTimeout(() => router.push(`/birthday/${data.id}`), 2800);
    } catch {
      setError("잠시 문제가 생겼어요. 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  // 등록 완료 인터스티셜
  if (submitted) {
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ textAlign: "center", maxWidth: 380 }}
        >
          {/* 촛불 일렁임 */}
          <div style={{ marginBottom: "2rem" }}>
            <DigitalCandle flicker={true} size={52} />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            style={{
              fontSize: "1.3rem",
              fontWeight: 400,
              color: "var(--text-primary)",
              lineHeight: 1.7,
              marginBottom: "1rem",
            }}
          >
            당신만의 케이크 판이
            <br />
            준비되었어요 🕯️
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: 2,
              fontWeight: 300,
              letterSpacing: "0.04em",
            }}
          >
            이제 링크를 공유하면
            <br />
            다정한 조각들이 하나씩 모여들거예요.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            style={{
              marginTop: "2rem",
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
              letterSpacing: "0.06em",
            }}
          >
            잠시 후 케이크 페이지로 이동합니다…
          </motion.p>
        </motion.div>
      </main>
    );
  }

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
              fontSize: "1.5rem",
              fontWeight: 400,
              color: "var(--text-primary)",
              lineHeight: 1.6,
              letterSpacing: "-0.01em",
              marginBottom: "0.875rem",
            }}
          >
            당신만을 위한
            <br />
            빈 케이크 판을 준비했어요
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            조각조각 모여든 마음들이
            <br />
            당신의 오늘을 완성합니다.
          </p>

          {/* 은둔 청년 공감 문구 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.8 }}
            style={{
              marginTop: "1.25rem",
              fontSize: "0.72rem",
              color: "var(--accent-light)",
              lineHeight: 2,
              fontWeight: 300,
              letterSpacing: "0.04em",
              fontStyle: "italic",
            }}
          >
            지금 잠시 멈춰있어도, 방 안에 머물고 있어도 괜찮아요.
            <br />
            당신의 존재는 그 자체로 이미 충분한 축하니까요.
          </motion.p>
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

        {/* 브랜드 미션 — 3가지 약속 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: "❛", label: "멈춰있어도", sub: "괜찮아요." },
            { icon: "🧩", label: "당신의 취향은", sub: "소중해요." },
            { icon: "🔗", label: "혼자지만", sub: "혼자가 아니에요." },
          ].map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
              style={{
                textAlign: "center",
                minWidth: 90,
              }}
            >
              <div style={{
                fontSize: "1.1rem",
                marginBottom: "0.4rem",
                opacity: 0.7,
              }}>
                {v.icon}
              </div>
              <p style={{
                fontSize: "0.68rem",
                color: "var(--text-secondary)",
                fontWeight: 400,
                lineHeight: 1.6,
                letterSpacing: "0.03em",
              }}>
                {v.label}
                <br />
                <span style={{ color: "var(--accent)", fontWeight: 300 }}>{v.sub}</span>
              </p>
            </motion.div>
          ))}
        </motion.div>

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
              <span style={{ fontSize: "0.6rem", letterSpacing: 0, marginLeft: "0.5rem", fontWeight: 300, textTransform: "none" }}>
                — 가장 편안한 이름으로 불려주세요
              </span>
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
            <p style={{
              marginTop: "0.5rem",
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              fontWeight: 300,
              fontStyle: "italic",
              letterSpacing: "0.02em",
            }}>
              다정한 소식 외에 광고나 스팸은 절대 보내지 않습니다.
              <br />우리는 당신의 고요함을 존중합니다.
            </p>
          </motion.div>

          {/* 취향 키워드 선택 — 토핑 시스템 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            style={{
              marginBottom: "2rem",
              padding: "1.25rem 1rem 1rem",
              background: "var(--wood-tray)",
              border: "1px solid var(--wood-tray-border)",
              borderRadius: "8px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 쟁반 상단 반사광 */}
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, var(--accent-warm), transparent)",
              opacity: 0.25,
            }} />
            <label style={{
              display: "block", fontSize: "0.7rem", letterSpacing: "0.15em",
              color: "var(--text-muted)", marginBottom: "0.25rem", textTransform: "uppercase",
            }}>
              취향 토핑
            </label>
            <p style={{
              fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 300,
              lineHeight: 1.7, marginBottom: "0.875rem", fontStyle: "italic",
              letterSpacing: "0.02em",
            }}>
              당신의 방 안을 채운 소중한 조각들을 골라주세요.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Object.entries(TOPPING_MAP).map(([kw, meta]) => (
                <motion.button
                  key={kw}
                  type="button"
                  id={`pref-${kw}`}
                  onClick={() => togglePref(kw)}
                  whileTap={{ y: -8, scale: 1.08 }}
                  animate={preferences.includes(kw)
                    ? { scale: [1, 1.12, 0.95, 1.04, 1], y: [0, -12, 2, -4, 0] }
                    : { scale: 1, y: 0 }
                  }
                  transition={preferences.includes(kw)
                    ? { duration: 0.4, ease: "easeOut" }
                    : { duration: 0.15 }
                  }
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "999px",
                    border: `1.5px solid ${preferences.includes(kw) ? meta.color : "var(--border)"}`,
                    background: preferences.includes(kw) ? `${meta.color}22` : "transparent",
                    fontSize: "0.75rem",
                    color: preferences.includes(kw) ? meta.color : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "background 0.2s, border-color 0.2s, color 0.2s",
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{meta.emoji}</span>{kw}
                </motion.button>
              ))}
            </div>

            {/* 우드 쟁반 — 선택된 토핑 모음 */}
            <AnimatePresence>
              {preferences.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    marginTop: "1rem",
                    padding: "0.875rem 1rem",
                    background: "var(--wood-tray)",
                    border: "1px solid var(--wood-tray-border)",
                    borderRadius: "6px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* 우드 쟁반 상단 반사광 */}
                  <div style={{
                    position: "absolute", top: 0, left: "8%", right: "8%",
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, var(--accent-warm), transparent)",
                    opacity: 0.3,
                  }} />
                  <p style={{
                    fontSize: "0.6rem", letterSpacing: "0.15em", color: "var(--text-muted)",
                    marginBottom: "0.5rem", textTransform: "uppercase",
                  }}>
                    쟁반 위의 토핑들
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {preferences.map(kw => {
                      const m = TOPPING_MAP[kw];
                      if (!m) return null;
                      return (
                        <motion.span
                          key={kw}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "0.2rem",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "999px",
                            background: `${m.color}28`,
                            border: `1px solid ${m.color}55`,
                            fontSize: "0.68rem",
                            color: m.color,
                          }}
                        >
                          {m.emoji} {kw}
                        </motion.span>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            ) : "다정함이 모이는 자리 만들기"}
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

      {/* 케이크 보관 메시지 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.3 }}
        style={{
          marginTop: "0.75rem",
          fontSize: "0.65rem",
          color: "var(--accent-light)",
          textAlign: "center",
          lineHeight: 1.8,
          fontWeight: 300,
          letterSpacing: "0.06em",
          fontStyle: "italic",
        }}
      >
        당신의 조각은 소중히 보관되며,
        <br />
        생일날 가장 눈부신 케이크로 완성됩니다.
      </motion.p>

      {/* 브랜드 철학 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.8 }}
        style={{
          marginTop: "2.5rem",
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          textAlign: "center",
          lineHeight: 2,
          fontWeight: 400,
          letterSpacing: "0.12em",
          fontFamily: "var(--font-main)",
        }}
      >
        조각조각 모인 마음은
        <br />
        쉽게 무너지지 않습니다.
      </motion.p>

      {/* 무드라이트 이펙트 — 쉴 키워드 선택 시 */}
      <AnimatePresence>
        {hasRestKeyword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              background: "radial-gradient(ellipse at center, rgba(155, 142, 196, 0.08) 0%, rgba(122, 155, 181, 0.04) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* About 팝업 트리거 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => setShowAbout(true)}
        id="about-trigger"
        style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem",
          width: 36, height: 36, borderRadius: "50%",
          border: "1px solid var(--border)",
          background: "var(--card-bg)",
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 20, fontFamily: "inherit",
          boxShadow: "0 2px 12px var(--shadow)",
        }}
        whileHover={{ scale: 1.1, borderColor: "var(--accent)" }}
        whileTap={{ scale: 0.95 }}
        aria-label="조각조각 이야기"
      >
        ?
      </motion.button>

      {/* About 팝업 */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAbout(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1.5rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 420,
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "2.5rem 2rem",
                boxShadow: "0 16px 60px rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              {/* 닫기 */}
              <button
                onClick={() => setShowAbout(false)}
                style={{
                  position: "absolute", top: "1rem", right: "1rem",
                  background: "none", border: "none",
                  color: "var(--text-muted)", cursor: "pointer",
                  fontSize: "1.1rem", fontFamily: "inherit",
                }}
                aria-label="닫기"
              >
                ×
              </button>

              {/* 촛불 아이콘 */}
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <DigitalCandle flicker={true} size={32} />
              </div>

              <h2 style={{
                fontSize: "1.1rem", fontWeight: 400,
                color: "var(--text-primary)",
                textAlign: "center", lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}>
                왜 &lsquo;조각조각&rsquo;을 만들었을까요
              </h2>

              <div style={{
                fontSize: "0.8rem", color: "var(--text-secondary)",
                lineHeight: 2.2, fontWeight: 300, letterSpacing: "0.02em",
              }}>
                <p style={{ marginBottom: "1rem" }}>
                  세상의 중력이 너무 무겁게 느껴지는 날이 있습니다.
                  나가야 하는데 발이 떨어지지 않고,
                  전화를 받아야 하는데 손이 나가지 않는 날.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  그런 날에도, 생일은 찾아옵니다.<br />
                  그리고 그 하루만큼은—<br />
                  누군가가 &ldquo;네가 있어줘서 고마워&rdquo라고<br />
                  조용히 말해주는 것만으로도<br />
                  세상의 무게가 조금 가벼워지지 않을까 생각했습니다.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  <strong style={{ color: "var(--accent)", fontWeight: 400 }}>조각조각</strong>은
                  그렇게 태어났습니다.<br />
                  완벽하지 않아도, 서툴러도, 조각조각 모인 마음들이
                  당신의 오늘을 조금 더 따뜻하게 만들어주길.
                </p>
                <p style={{ textAlign: "right", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  — 규태
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </main>
  );
}
