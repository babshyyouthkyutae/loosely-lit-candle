// ─── 느슨한 촛불 · 조각조각 — Service Worker ────────────
// 케이크 페이지 데이터를 캐시하여 오프라인에서도 열람 가능하게 합니다.
// 전략: Network-first (온라인 우선) + Cache fallback (오프라인 시 캐시)

const CACHE_NAME = "jj-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ─── Install: 정적 에셋 프리캐시 ─────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate: 오래된 캐시 정리 ──────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: Network-first + Cache fallback ───────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 캐시하지 않음 (보안: check-message 등)
  if (url.pathname.startsWith("/api/")) return;

  // POST 요청은 캐시하지 않음
  if (request.method !== "GET") return;

  // 케이크 페이지 (/birthday/xxx) 또는 정적 에셋
  const isBirthdayPage = url.pathname.startsWith("/birthday/");
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json";
  const isNavigationOrPage = request.mode === "navigate" || isBirthdayPage;

  if (isStaticAsset) {
    // 정적 에셋: Cache-first
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  if (isNavigationOrPage) {
    // 페이지: Network-first, 실패 시 캐시
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(offlineFallbackHtml(), {
                headers: { "Content-Type": "text/html; charset=utf-8" },
              })
          )
        )
    );
    return;
  }
});

// ─── 오프라인 폴백 페이지 ────────────────────────────────
function offlineFallbackHtml() {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>오프라인 — 느슨한 촛불</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #F8F4ED;
      font-family: 'Nanum Myeongjo', Georgia, serif;
      color: #2C2416;
      padding: 2rem;
    }
    .candle { font-size: 3rem; margin-bottom: 1.5rem; animation: flicker 2s ease-in-out infinite; }
    @keyframes flicker {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }
    h1 { font-size: 1.3rem; font-weight: 400; margin-bottom: 1rem; text-align: center; line-height: 1.7; }
    p { font-size: 0.8rem; color: #7A6A50; line-height: 1.9; text-align: center; font-weight: 300; max-width: 320px; }
    .retry {
      margin-top: 2rem;
      padding: 0.75rem 2rem;
      background: #2C2416;
      color: #F8F4ED;
      border: none;
      border-radius: 2px;
      font-size: 0.8rem;
      letter-spacing: 0.1em;
      cursor: pointer;
      font-family: inherit;
    }
    .footer {
      position: fixed; bottom: 2rem;
      font-size: 0.65rem; color: #B0A08A;
      letter-spacing: 0.12em; font-style: italic;
    }
  </style>
</head>
<body>
  <div class="candle">🕯️</div>
  <h1>잠시 연결이 끊어졌어요</h1>
  <p>
    인터넷에 다시 연결되면<br/>
    당신의 케이크를 만날 수 있어요.<br/><br/>
    이전에 열어본 케이크는<br/>
    오프라인에서도 볼 수 있어요.
  </p>
  <button class="retry" onclick="location.reload()">다시 시도하기</button>
  <div class="footer">조각조각 모인 마음은 쉽게 무너지지 않습니다</div>
</body>
</html>`;
}
