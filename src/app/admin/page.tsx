"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── 타입 ────────────────────────────────────────────────
interface Stats {
  summary: {
    totalCakes: number;
    totalPieces: number;
    weekCakes: number;
    weekPieces: number;
    emailRegistrationRate: number;
    avgPiecesPerCake: number;
  };
  topToppings: { name: string; count: number }[];
  recentCakes: {
    id: string;
    name: string;
    birthday: string;
    email: string | null;
    preferences: string[];
    created_at: string;
  }[];
  recentPieces: {
    id: string;
    birthday_id: string;
    author: string;
    piece_type: string;
    created_at: string;
  }[];
}

// ─── 관리자 대시보드 ─────────────────────────────────────
export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-secret": key },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError("비밀번호가 올바르지 않아요.");
          setAuthenticated(false);
          return;
        }
        throw new Error("서버 오류");
      }
      const data = await res.json();
      setStats(data);
      setAuthenticated(true);
    } catch {
      setError("통계를 불러올 수 없어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 자동 새로고침 (5분)
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => fetchStats(secret), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authenticated, secret, fetchStats]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    fetchStats(secret);
  };

  // ─── 로그인 화면 ──────────────────────────────────────
  if (!authenticated) {
    return (
      <main style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", maxWidth: 360 }}
        >
          <p style={{
            fontSize: "0.7rem", letterSpacing: "0.25em",
            color: "var(--text-muted)", marginBottom: "1rem",
          }}>
            느슨한 촛불 · 관리자
          </p>

          <h1 style={{
            fontSize: "1.2rem", fontWeight: 400,
            color: "var(--text-primary)", marginBottom: "2rem",
            lineHeight: 1.6,
          }}>
            조각조각 운영 대시보드
          </h1>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="관리자 비밀번호"
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit",
                textAlign: "center",
                letterSpacing: "0.15em",
                marginBottom: "1.5rem",
              }}
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: "var(--text-primary)",
                color: "var(--ivory)",
                border: "none",
                borderRadius: "2px",
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "확인 중…" : "들어가기"}
            </motion.button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: "1rem",
                  fontSize: "0.75rem",
                  color: "#A0704A",
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    );
  }

  // ─── 대시보드 ─────────────────────────────────────────
  const s = stats?.summary;

  return (
    <main style={{
      minHeight: "100vh",
      padding: "2rem 1.5rem",
      position: "relative",
      zIndex: 1,
      maxWidth: 800,
      margin: "0 auto",
    }}>
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "2.5rem",
          flexWrap: "wrap", gap: "1rem",
        }}
      >
        <div>
          <p style={{
            fontSize: "0.65rem", letterSpacing: "0.25em",
            color: "var(--text-muted)", marginBottom: "0.25rem",
          }}>
            느슨한 촛불 · 관리자
          </p>
          <h1 style={{
            fontSize: "1.1rem", fontWeight: 400,
            color: "var(--text-primary)",
          }}>
            운영 대시보드
          </h1>
        </div>
        <button
          onClick={() => fetchStats(secret)}
          style={{
            padding: "0.5rem 1rem",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.1em",
          }}
        >
          {loading ? "새로고침 중…" : "새로고침"}
        </button>
      </motion.div>

      {s && (
        <>
          {/* 핵심 지표 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1rem",
              marginBottom: "2.5rem",
            }}
          >
            {[
              { label: "총 케이크", value: s.totalCakes, emoji: "🎂" },
              { label: "총 조각", value: s.totalPieces, emoji: "🧩" },
              { label: "이번 주 케이크", value: s.weekCakes, emoji: "📈" },
              { label: "이번 주 조각", value: s.weekPieces, emoji: "✨" },
              { label: "이메일 등록률", value: `${s.emailRegistrationRate}%`, emoji: "📧" },
              { label: "조각/케이크", value: s.avgPiecesPerCake, emoji: "📊" },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  padding: "1.25rem 1rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
                  {card.emoji}
                </div>
                <div style={{
                  fontSize: "1.5rem", fontWeight: 400,
                  color: "var(--text-primary)", marginBottom: "0.25rem",
                }}>
                  {card.value}
                </div>
                <div style={{
                  fontSize: "0.6rem", letterSpacing: "0.15em",
                  color: "var(--text-muted)", textTransform: "uppercase" as const,
                }}>
                  {card.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* 인기 토핑 */}
          {stats?.topToppings && stats.topToppings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <h2 style={{
                fontSize: "0.7rem", letterSpacing: "0.15em",
                color: "var(--text-muted)", marginBottom: "1rem",
                textTransform: "uppercase" as const,
              }}>
                인기 토핑 TOP 10
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {stats.topToppings.map((t, i) => (
                  <div key={t.name} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                  }}>
                    <span style={{
                      fontSize: "0.65rem", color: "var(--text-muted)",
                      width: "1.5rem", textAlign: "right",
                    }}>
                      {i + 1}.
                    </span>
                    <span style={{
                      fontSize: "0.8rem", color: "var(--text-primary)",
                      flex: 1,
                    }}>
                      {t.name}
                    </span>
                    <div style={{
                      height: "6px",
                      width: `${Math.max(20, (t.count / (stats.topToppings[0]?.count || 1)) * 100)}%`,
                      maxWidth: "200px",
                      background: "var(--accent)",
                      borderRadius: "999px",
                      opacity: 0.6,
                    }} />
                    <span style={{
                      fontSize: "0.7rem", color: "var(--text-muted)",
                      minWidth: "2rem", textAlign: "right",
                    }}>
                      {t.count}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 최근 케이크 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{
              fontSize: "0.7rem", letterSpacing: "0.15em",
              color: "var(--text-muted)", marginBottom: "1rem",
              textTransform: "uppercase" as const,
            }}>
              최근 등록된 케이크
            </h2>
            {stats?.recentCakes?.map((cake) => (
              <div key={cake.id} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "0.5rem 0",
                borderBottom: "1px solid var(--border)",
                flexWrap: "wrap", gap: "0.5rem",
              }}>
                <div>
                  <span style={{
                    fontSize: "0.8rem", color: "var(--text-primary)",
                    marginRight: "0.5rem",
                  }}>
                    {cake.name}
                  </span>
                  <span style={{
                    fontSize: "0.65rem", color: "var(--text-muted)",
                  }}>
                    {cake.birthday}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {cake.email && (
                    <span style={{
                      fontSize: "0.55rem", color: "var(--accent)",
                      padding: "2px 6px",
                      border: "1px solid var(--accent)",
                      borderRadius: "999px",
                      opacity: 0.7,
                    }}>
                      📧
                    </span>
                  )}
                  <span style={{
                    fontSize: "0.6rem", color: "var(--text-muted)",
                  }}>
                    {new Date(cake.created_at).toLocaleDateString("ko")}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* 최근 조각 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{
              fontSize: "0.7rem", letterSpacing: "0.15em",
              color: "var(--text-muted)", marginBottom: "1rem",
              textTransform: "uppercase" as const,
            }}>
              최근 보태진 조각
            </h2>
            {stats?.recentPieces?.map((piece) => (
              <div key={piece.id} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "0.5rem 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <div>
                  <span style={{
                    fontSize: "0.8rem", color: "var(--text-primary)",
                    marginRight: "0.5rem",
                  }}>
                    {piece.author}
                  </span>
                  <span style={{
                    fontSize: "0.6rem",
                    padding: "2px 6px",
                    borderRadius: "999px",
                    background: "rgba(196,149,106,0.1)",
                    color: "var(--accent)",
                  }}>
                    {piece.piece_type}
                  </span>
                </div>
                <span style={{
                  fontSize: "0.6rem", color: "var(--text-muted)",
                }}>
                  {new Date(piece.created_at).toLocaleDateString("ko")}
                </span>
              </div>
            ))}
          </motion.div>
        </>
      )}

      {/* 하단 */}
      <p style={{
        textAlign: "center",
        fontSize: "0.6rem",
        color: "var(--text-muted)",
        marginTop: "2rem",
        fontStyle: "italic",
        letterSpacing: "0.1em",
      }}>
        조각조각 모인 마음은 쉽게 무너지지 않습니다
      </p>
    </main>
  );
}
