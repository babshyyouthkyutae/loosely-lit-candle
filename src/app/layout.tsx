import type { Metadata } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nanum-myeongjo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "느슨한 촛불 — 멀리서 켜둔 마음 하나",
  description:
    "은둔하고 고립된 청년들을 위한 디지털 케이크. 당신의 생일을 입력하면, 마음을 담은 조각들이 조용히 쌓여갑니다.",
  keywords: ["조각조각", "생일", "은둔고립", "청년", "따뜻한 마음", "느슨한 촛불"],
  openGraph: {
    title: "느슨한 촛불 — 멀리서 켜둔 마음 하나",
    description: "조용한 불꽃처럼, 당신 곁에 있겠습니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2C2416" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="조각조각" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${nanumMyeongjo.variable}`}>
        {/* Ambient candle glow elements */}
        <div
          className="glow-dot"
          style={{ top: "-80px", right: "-80px" }}
          aria-hidden="true"
        />
        <div
          className="glow-dot"
          style={{ bottom: "-100px", left: "-60px" }}
          aria-hidden="true"
        />
        {children}
        {/* Service Worker 등록 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[SW] 등록 성공:', reg.scope); })
                    .catch(function(err) { console.log('[SW] 등록 실패:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
