import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riyaz's Quran Search",
  description: "AI-powered Quran Search with Ismaili Gnosis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
