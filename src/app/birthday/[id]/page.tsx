"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface BirthdayRecord {
  id: string;
  name: string;
  birthday: string;
  createdAt: string;
  messages: { id: string; content: string; author: string; createdAt: string }[];
}

function formatBirthday(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getDdayText(birthday: string): string {
  const today = new Date();
  const bday = new Date(birthday);

  // 올해 생일
  const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

  // 이미 지났으면 내년
  if (thisYearBday < today) {
    thisYearBday.setFullYear(today.getFullYear() + 1);
  }

  const diffMs = thisYearBday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘이 생일이에요 🎂";
  if (diffDays === 1) return "내일이 생일이에요";
  return `생일까지 D-${diffDays}`;
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
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setRecord(data);
        setIsLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setIsLoading(false);
      });
  }, [id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            opacity: 0.6,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            style={{ animation: "spin 1.5s linear infinite" }}
            aria-label="로딩 중"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              fontWeight: 300,
            }}
          >
            불러오는 중…
          </p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    );
  }

  if (notFound || !record) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="animate-fade-in-up"
          style={{ textAlign: "center", maxWidth: "360px" }}
        >
          <p
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
              opacity: 0.4,
            }}
          >
            ∅
          </p>
          <h1
            style={{
              fontSize: "1.125rem",
              fontWeight: 400,
              color: "var(--text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            페이지를 찾을 수 없어요
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            링크가 잘못되었거나 삭제된 롤링페이퍼예요.
          </p>
          <Link
            href="/"
            className="link-underline"
            style={{
              fontSize: "0.8125rem",
              color: "var(--accent)",
              letterSpacing: "0.05em",
            }}
          >
            처음으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const ddayText = getDdayText(record.birthday);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "3rem 1.5rem",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* 뒤로가기 */}
      <nav
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "560px",
          marginBottom: "2.5rem",
        }}
      >
        <Link
          href="/"
          className="link-underline"
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M8 2L4 6l4 4" />
          </svg>
          처음으로
        </Link>
      </nav>

      {/* 메인 카드 */}
      <div
        className="animate-fade-in-up delay-100"
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "rgba(255, 252, 245, 0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          overflow: "hidden",
          boxShadow: "0 4px 40px var(--shadow)",
        }}
      >
        {/* 헤더 영역 */}
        <div
          style={{
            padding: "2.5rem",
            textAlign: "center",
            borderBottom: "1px solid var(--ivory-deep)",
            background: "linear-gradient(180deg, var(--ivory-dark) 0%, transparent 100%)",
          }}
        >
          {/* D-day 배지 */}
          <div
            className="animate-fade-in delay-200"
            style={{
              display: "inline-block",
              padding: "0.3rem 0.875rem",
              border: "1px solid var(--accent-light)",
              borderRadius: "999px",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              color: "var(--accent)",
              marginBottom: "1.25rem",
              background: "rgba(196, 149, 106, 0.06)",
            }}
          >
            {ddayText}
          </div>

          <h1
            className="animate-fade-in-up delay-200"
            style={{
              fontSize: "1.5rem",
              fontWeight: 400,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
              lineHeight: 1.4,
            }}
          >
            {record.name}님의
            <br />
            롤링페이퍼
          </h1>

          <p
            className="animate-fade-in delay-300"
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              fontWeight: 300,
            }}
          >
            {formatBirthday(record.birthday)}
          </p>
        </div>

        {/* 메시지 영역 헤더 */}
        <div style={{
          padding: "1.25rem 2.5rem 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            color: "var(--text-muted)",
            textTransform: "uppercase",
          }}>
            메시지 {record.messages.length > 0 && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "18px",
                height: "18px",
                background: "var(--accent)",
                color: "var(--ivory)",
                borderRadius: "999px",
                fontSize: "0.6rem",
                marginLeft: "0.375rem",
                fontWeight: 500,
              }}>
                {record.messages.length}
              </span>
            )}
          </span>
        </div>

        {/* 메시지 영역 */}
        <div style={{ padding: "1.25rem 2.5rem 2rem" }}>
          {record.messages.length === 0 ? (
            <div
              className="animate-fade-in delay-500"
              style={{
                textAlign: "center",
                padding: "2.5rem 1rem",
              }}
            >
              {/* 빈 페이지 일러스트 */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  border: "1.5px dashed var(--border)",
                  borderRadius: "50%",
                  margin: "0 auto 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-hidden="true"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="1.2"
                >
                  <path d="M10 4v12M4 10h12" />
                </svg>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                아직 아무도 메시지를 남기지 않았어요.
                <br />
                링크를 공유해서 첫 번째 마음을 받아보세요.
              </p>
            </div>
          ) : (
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {record.messages.map((msg, index) => (
                <li
                  key={msg.id}
                  className={`animate-fade-in-up delay-${Math.min(index * 100 + 300, 700)}`}
                  style={{
                    padding: "1.25rem",
                    background: "var(--ivory-dark)",
                    border: "1px solid var(--border)",
                    borderRadius: "2px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                      lineHeight: 1.9,
                      fontWeight: 300,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {msg.content}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      — {msg.author}
                    </p>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", opacity: 0.7 }}>
                      {formatRelativeDate(msg.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 하단 액션 영역 */}
        <div
          className="animate-fade-in delay-700"
          style={{
            padding: "1.5rem 2.5rem 2rem",
            borderTop: "1px solid var(--ivory-deep)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* 메시지 남기기 — 메인 CTA */}
          <button
            id="write-message-btn"
            onClick={() => router.push(`/birthday/${id}/write`)}
            style={{
              width: "100%",
              padding: "0.9375rem",
              background: "var(--text-primary)",
              color: "var(--ivory)",
              border: "none",
              borderRadius: "2px",
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
              fontWeight: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--text-primary)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 10V12h2l6-6-2-2L2 10z" />
              <path d="M9 3l2 2" />
            </svg>
            마음 전하기
          </button>

          {/* 링크 복사 버튼 */}
          <button
            id="copy-link-btn"
            onClick={handleCopyLink}
            style={{
              width: "100%",
              padding: "0.875rem",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "2px",
              fontSize: "0.8125rem",
              color: copied ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.borderColor = "var(--accent-light)";
                e.currentTarget.style.color = "var(--accent)";
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {copied ? (
                <path d="M2 7l3.5 3.5L12 3" />
              ) : (
                <>
                  <rect x="4" y="4" width="8" height="8" rx="1" />
                  <path d="M2 10V2h8" />
                </>
              )}
            </svg>
            {copied ? "링크가 복사되었어요" : "링크 복사하기"}
          </button>

          <p style={{
            textAlign: "center", fontSize: "0.7rem",
            color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.7,
          }}>
            링크를 공유하면 누구나 마음을 전할 수 있어요
          </p>
        </div>
      </div>

      {/* 하단 여백 */}
      <p
        className="animate-fade-in delay-700"
        style={{
          marginTop: "2.5rem",
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          opacity: 0.6,
        }}
      >
        느슨한 촛불
      </p>
    </main>
  );
}
