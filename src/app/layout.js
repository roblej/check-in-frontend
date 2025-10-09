import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// test
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "네이버 호텔 - 전세계 호텔 예약 비교",
  description: "전세계 예약사이트 요금을 한번에 비교하고 최저가로 예약하세요. 부킹닷컴, 아고다, 호텔스닷컴 등 다양한 사이트의 호텔 가격을 비교해보세요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
