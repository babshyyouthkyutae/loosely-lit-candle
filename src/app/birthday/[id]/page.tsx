"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { PIECE_META, type PieceType } from "@/lib/supabase";

// ─── 타입 ────────────────────────────────────────────────
interface Piece {
  id: string;
  content: string;
  author: string;
  piece_type: PieceType;
  pos_x: number;
  pos_y: number;
  created_at: string;
}

type SystemPiece = {
  id: string;
  content: string;
  author: string;
  piece_type: PieceType;
  pos_x: number;
  pos_y: number;
  created_at: string;
  isSystem: true;
};

type DisplayPiece = Piece | SystemPiece;

function isSystemPiece(p: DisplayPiece): p is SystemPiece {
  return "isSystem" in p;
}

interface BirthdayRecord {
  id: string;
  name: string;
  birthday: string;
  created_at: string;
  messages: Piece[];
  locked: boolean;
  lockedReason?: string;
}

// ─── 날짜 유틸 ───────────────────────────────────────────
function getDdayInfo(birthday: string) {
  const today = new Date();
  const bday = new Date(birthday);
  const todayKST = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const isToday =
    bday.getMonth() === todayKST.getMonth() &&
    bday.getDate() === todayKST.getDate();
  const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (thisYearBday < today && !isToday) thisYearBday.setFullYear(today.getFullYear() + 1);
  const diffDays = Math.ceil((thisYearBday.getTime() - today.getTime()) / 86400000);
  if (isToday) return { text: "오늘이 생일이에요 🎂", daysLeft: 0, isToday: true };
  if (diffDays === 1) return { text: "내일이 생일이에요", daysLeft: 1, isToday: false };
  return { text: `생일까지 D-${diffDays}`, daysLeft: diffDays, isToday: false };
}

// ─── 조각 SVG 케이크 슬라이스 ────────────────────────────
function CakeSliceSVG({ pieceType, size = 80 }: { pieceType: PieceType; size?: number }) {
  const meta = PIECE_META[pieceType];
  const h = size;
  const w = size * 0.85;
  // 상단 둥근 삼각형 (케이크 조각 실루엣)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ display: "block" }}>
      {/* 케이크 바디 */}
      <path
        d={`M${w / 2} 0 L${w} ${h * 0.65} Q${w} ${h} ${w * 0.8} ${h} L${w * 0.2} ${h} Q0 ${h} 0 ${h * 0.65} Z`}
        fill={meta.bg}
        stroke={meta.border}
        strokeWidth="1.2"
      />
      {/* 크림 레이어 */}
      <ellipse cx={w / 2} cy={h * 0.05} rx={w * 0.38} ry={h * 0.1}
        fill={meta.creamColor} opacity="0.9" />
      {/* 상단 토핑 영역 */}
      <path
        d={`M${w * 0.15} ${h * 0.25} Q${w / 2} ${h * 0.08} ${w * 0.85} ${h * 0.25}`}
        stroke={meta.border} strokeWidth="1" opacity="0.4" fill="none" />
      {/* 옆면 레이어 선 */}
      <line x1={w * 0.04} y1={h * 0.52} x2={w * 0.96} y2={h * 0.52}
        stroke={meta.border} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

// ─── 조각 카드 ───────────────────────────────────────────
interface PieceCardProps {
  piece: DisplayPiece;
  index: number;
  total: number;
  animate?: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

function PieceCard({ piece, index, total, animate = true, isExpanded, onClick }: PieceCardProps) {
  const meta = PIECE_META[piece.piece_type ?? "cream"];
  const canvasSize = 340;
  const radius = 128;
  const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
  const cx = canvasSize / 2 + radius * Math.cos(angle) - 55;
  const cy = canvasSize / 2 + radius * Math.sin(angle) - 55;

  // 자석 효과: 초기 위치를 캔버스 밖으로 흩뿌림
  const spreadAngle = angle + (Math.random() - 0.5) * 0.8;
  const spreadR = 280 + Math.random() * 100;
  const initX = canvasSize / 2 + spreadR * Math.cos(spreadAngle) - 55;
  const initY = canvasSize / 2 + spreadR * Math.sin(spreadAngle) - 55;

  const isSystem = isSystemPiece(piece);

  return (
    <motion.div
      initial={animate ? { x: initX, y: initY, opacity: 0, scale: 0.6, rotate: (Math.random() - 0.5) * 60 } : false}
      animate={{ x: cx, y: cy, opacity: 1, scale: isExpanded ? 1.12 : 1, rotate: 0 }}
      transition={{
        delay: animate ? index * 0.12 + 0.3 : 0,
        duration: animate ? 0.9 : 0.25,
        ease: [0.22, 1, 0.36, 1],
        scale: { duration: 0.25 },
      }}
      onClick={onClick}
      style={{
        position: "absolute",
        width: 110,
        cursor: "pointer",
        zIndex: isExpanded ? 20 : 2,
      }}
      whileHover={{ scale: 1.08, zIndex: 15 }}
    >
      {/* 케이크 슬라이스 상단 */}
      <div style={{
        width: "100%",
        borderRadius: "10px 10px 0 0",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingTop: 4,
        background: `linear-gradient(180deg, ${meta.topColor} 0%, ${meta.bg} 100%)`,
        border: `1px solid ${meta.border}`,
        borderBottom: "none",
      }}>
        <CakeSliceSVG pieceType={piece.piece_type ?? "cream"} size={64} />
      </div>

      {/* 텍스트 바디 */}
      <div style={{
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderTop: "none",
        borderRadius: "0 0 10px 10px",
        padding: "0.5rem 0.6rem 0.6rem",
        boxShadow: isSystem
          ? `0 4px 16px rgba(196,149,106,0.3)`
          : `0 4px 12px rgba(0,0,0,0.2)`,
      }}>
        <p style={{
          fontSize: "0.68rem",
          lineHeight: 1.55,
          color: pieceType_textColor(piece.piece_type),
          fontWeight: 300,
          display: "-webkit-box",
          WebkitLineClamp: isExpanded ? 99 : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          whiteSpace: "pre-line",
          marginBottom: "0.3rem",
        }}>
          {piece.content}
        </p>
        <p style={{
          fontSize: "0.58rem",
          opacity: 0.55,
          letterSpacing: "0.04em",
          color: pieceType_textColor(piece.piece_type),
        }}>
          {isSystem ? "🕯️ 느슨한 촛불" : `— ${piece.author}`}
        </p>
      </div>
    </motion.div>
  );
}

function pieceType_textColor(pt: PieceType): string {
  return pt === "choco" ? "#F5EAD5" : "#2C2416";
}

// ─── Zero-Data 시스템 조각 ──────────────────────────────
function makeSystemPiece(name: string): SystemPiece {
  return {
    id: "system-welcome",
    content: `오늘, ${name}님의 생일을 축하해요.\n\n혼자인 것 같아도, 누군가는 조용히 당신의 날을 기억하고 있어요.\n이 첫 번째 조각은 느슨한 촛불이 보내는 마음이에요. 🕯️`,
    author: "느슨한 촛불",
    piece_type: "cream",
    pos_x: 0.5,
    pos_y: 0.5,
    created_at: new Date().toISOString(),
    isSystem: true,
  };
}

// ─── 메인 컴포넌트 ───────────────────────────────────────
export default function BirthdayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [record, setRecord] = useState<BirthdayRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [arriveShown, setArriveShown] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // 주인 여부 판별 (localStorage)
  useEffect(() => {
    try {
      const owned: string[] = JSON.parse(localStorage.getItem("owned_cakes") || "[]");
      setIsOwner(owned.includes(id));
    } catch { setIsOwner(false); }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/birthday?id=${id}`)
      .then((res) => { if (res.status === 404) { setNotFound(true); return null; } return res.json(); })
      .then((data) => { if (data) setRecord(data); setIsLoading(false); })
      .catch(() => { setNotFound(true); setIsLoading(false); });
  }, [id]);

  // 자석 효과 완료 후 도착 문구 표시
  useEffect(() => {
    if (!record || record.locked) return;
    const count = record.messages.length;
    const delay = count * 120 + 1200;
    const t = setTimeout(() => setArriveShown(true), delay);
    return () => clearTimeout(t);
  }, [record]);

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { /* fallback */ }
  };

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.4, 0.7, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", letterSpacing: "0.15em" }}>조각을 불러오는 중…</p>
        </motion.div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </main>
    );
  }

  if (notFound || !record) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", maxWidth: 360 }}>
          <p style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.4 }}>∅</p>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 400, color: "var(--text-primary)", marginBottom: "0.75rem" }}>케이크를 찾을 수 없어요</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.8, fontWeight: 300 }}>링크가 잘못되었거나 삭제된 케이크예요.</p>
          <Link href="/" style={{ fontSize: "0.8125rem", color: "var(--accent)" }}>처음으로 돌아가기</Link>
        </motion.div>
      </main>
    );
  }

  const { text: ddayText, daysLeft, isToday } = getDdayInfo(record.birthday);
  const messagesLocked = record.locked;
  const rawPieces: Piece[] = record.messages;
  const displayPieces: DisplayPiece[] = !messagesLocked
    ? rawPieces.length === 0 ? [makeSystemPiece(record.name)] : rawPieces
    : [];

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "2.5rem 1.5rem 4rem", position: "relative", zIndex: 1,
    }}>
      {/* 뒤로가기 */}
      <nav style={{ width: "100%", maxWidth: 600, marginBottom: "2rem" }}>
        <Link href="/" style={{
          fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.1em",
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L4 6l4 4" /></svg>
          처음으로
        </Link>
      </nav>

      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "2rem", maxWidth: 600 }}
      >
        {/* D-day 배지 */}
        <div style={{
          display: "inline-block", padding: "0.25rem 0.875rem",
          border: "1px solid var(--accent-light)", borderRadius: 999,
          fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--accent)",
          marginBottom: "0.875rem", background: "rgba(196,149,106,0.06)",
        }}>
          {ddayText}
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.4 }}>
          {record.name}님의 케이크
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.375rem", fontWeight: 300 }}>
          당신의 조각이 모여 이 사람의 오늘이 완성됩니다.
        </p>
      </motion.div>

      {/* ── 케이크 캔버스 (생일 당일) ── */}
      {!messagesLocked && (
        <div style={{ marginBottom: "2rem" }}>
          {/* 도착 문구 */}
          <AnimatePresence>
            {arriveShown && rawPieces.length > 0 && (
              <motion.p
                key="arrive"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  textAlign: "center", fontSize: "0.78rem", color: "var(--accent)",
                  letterSpacing: "0.08em", marginBottom: "1rem", fontWeight: 300,
                }}
              >
                당신을 향한 마음 조각들이 도착했습니다
              </motion.p>
            )}
          </AnimatePresence>

          {/* 캔버스 */}
          <div className="cake-canvas">
            {/* 빈 케이크 판 */}
            <motion.div
              className="cake-plate"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* 조각들 */}
            {displayPieces.map((piece, i) => (
              <PieceCard
                key={piece.id}
                piece={piece}
                index={i}
                total={displayPieces.length}
                animate={true}
                isExpanded={expandedId === piece.id}
                onClick={() => setExpandedId(expandedId === piece.id ? null : piece.id)}
              />
            ))}
          </div>

          {/* 조각 수 안내 */}
          <p style={{
            textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)",
            marginTop: "1rem", letterSpacing: "0.08em",
          }}>
            {rawPieces.length > 0
              ? `${rawPieces.length}개의 조각이 모였어요`
              : "아직 조각이 없어요 — 링크를 공유해보세요"}
          </p>
        </div>
      )}

      {/* ── 잠금 상태 ── */}
      {messagesLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            width: "100%", maxWidth: 480,
            background: "var(--card-bg)", border: "1px solid var(--border)",
            borderRadius: 4, padding: "3rem 2rem", textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          {/* 빈 케이크 판 미리보기 */}
          <div style={{
            width: 120, height: 120, borderRadius: "50%", margin: "0 auto 1.5rem",
            border: "1px dashed var(--accent-light)",
            background: "rgba(196,149,106,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "2rem", opacity: 0.4 }}>🎂</span>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.9, fontWeight: 300 }}>
            케이크는 <strong style={{ color: "var(--accent)", fontWeight: 400 }}>생일 당일</strong>에 열려요.
            <br />
            <span style={{ fontSize: "0.8rem", opacity: 0.75 }}>
              {daysLeft > 0
                ? `D-${daysLeft} · 지금은 조각을 모으는 시간이에요.`
                : "잠시 후면 읽을 수 있어요."}
            </span>
          </p>

          {/* 격려 문구 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              marginTop: "1.5rem",
              fontSize: "0.72rem",
              color: "var(--accent-light)",
              lineHeight: 2,
              fontWeight: 300,
              fontStyle: "italic",
              letterSpacing: "0.04em",
            }}
          >
            링크를 공유해보세요.
            <br />
            멀리서, 조용히, 다정한 조각들이 모여들 거예요.
          </motion.p>
        </motion.div>
      )}

      {/* ── 액션 버튼 ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        {isOwner ? (
          /* ── 케이크 주인 UI ── */
          <>
            <button
              id="save-cake-btn"
              onClick={handleCopyLink}
              style={{
                width: "100%", padding: "0.9375rem",
                background: "var(--accent-warm)", color: "var(--ivory)",
                border: "none", borderRadius: 2, fontSize: "0.875rem",
                letterSpacing: "0.08em", cursor: "pointer",
                transition: "background 0.3s ease, box-shadow 0.3s ease",
                fontFamily: "inherit", fontWeight: 400,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                boxShadow: "0 2px 16px rgba(200, 160, 112, 0.2)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(200, 160, 112, 0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-warm)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(200, 160, 112, 0.2)"; }}
            >
              <span style={{ fontSize: "1rem" }}>🕯️</span>
              {copied ? "링크가 복사되었어요" : "다정한 조각들 소중히 간직하기"}
            </button>

            <button
              id="share-cake-btn"
              onClick={() => router.push(`/birthday/${id}/write`)}
              style={{
                width: "100%", padding: "0.875rem",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 2, fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.3s ease",
                fontFamily: "inherit", letterSpacing: "0.05em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <span style={{ fontSize: "0.9rem" }}>🍰</span>
              나도 조각 보태기
            </button>

            <p style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--accent-light)", fontWeight: 300, lineHeight: 1.8, fontStyle: "italic" }}>
              당신을 향한 따뜻한 마음들이 이만큼 모였어요.
            </p>
          </>
        ) : (
          /* ── 방문자 UI ── */
          <>
            <button
              id="write-piece-btn"
              onClick={() => router.push(`/birthday/${id}/write`)}
              style={{
                width: "100%", padding: "0.9375rem",
                background: "var(--text-primary)", color: "var(--ivory)",
                border: "none", borderRadius: 2, fontSize: "0.875rem",
                letterSpacing: "0.1em", cursor: "pointer", transition: "background 0.3s ease",
                fontFamily: "inherit", fontWeight: 400,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--text-primary)"; }}
            >
              <span style={{ fontSize: "1rem" }}>🍰</span>
              다정한 조각 하나 보태기
            </button>

            <button
              id="copy-link-btn"
              onClick={handleCopyLink}
              style={{
                width: "100%", padding: "0.875rem",
                background: "transparent", border: "1px solid var(--border)",
                borderRadius: 2, fontSize: "0.8125rem",
                color: copied ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.3s ease",
                fontFamily: "inherit", letterSpacing: "0.05em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}
              onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; }}}
              onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                {copied ? <path d="M2 7l3.5 3.5L12 3" /> : (<><rect x="4" y="4" width="8" height="8" rx="1" /><path d="M2 10V2h8" /></>)}
              </svg>
              {copied ? "링크가 복사되었어요" : "링크 복사하기"}
            </button>

            <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.7 }}>
              {record.name}님의 케이크를 당신의 마음으로 완성해주세요.
            </p>
          </>
        )}
      </motion.div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
