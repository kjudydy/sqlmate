import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQLMate",
  description: "SQLP 합격을 위한 문제풀이, 실습, 오답노트, 개념정리 학습 플랫폼"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
