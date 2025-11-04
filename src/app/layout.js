import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// tt
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "체크인",
  description: "숙소예약페이지",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
