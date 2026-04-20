import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "느슨한 촛불 — 당신의 생일을 기억하는 사람들",
  description:
    "은둔하고 고립된 청년들을 위한 디지털 롤링페이퍼. 당신의 생일을 입력하면, 마음을 담은 메시지들이 조용히 쌓여갑니다.",
  keywords: ["롤링페이퍼", "생일", "은둔고립", "청년", "따뜻한 메시지"],
  openGraph: {
    title: "느슨한 촛불 — 당신의 생일을 기억하는 사람들",
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
      <body className={`${notoSerifKR.variable}`}>
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
      </body>
    </html>
  );
}
