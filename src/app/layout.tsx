import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "xale — Илүүдэл барааны зах зээл",
  description:
    "Хугацаа дуусах дөхсөн, илүүдэл хүнс, рестораны үлдэгдлийг худалдагч, худалдан авагчтай холбоно. Улаанбаатар.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
          <p>
            <span className="font-semibold text-green-700">xale</span> · Илүүдэл
            барааны зах зээл · Улаанбаатар
          </p>
        </footer>
      </body>
    </html>
  );
}
