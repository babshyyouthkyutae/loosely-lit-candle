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
      </body>
    </html>
  );
}
