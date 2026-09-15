import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lịch công tác | THCS Xuân Phương",
  description: "Lịch công tác tuần đã phát hành của Trường THCS Xuân Phương.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
