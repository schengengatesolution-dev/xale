import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "xale — Илүүдэл барааны зах зээл",
    template: "%s · xale",
  },
  description:
    "Хугацаа дуусах дөхсөн, илүүдэл хүнс, рестораны үлдэгдлийг худалдагч, худалдан авагчтай холбоно. Улаанбаатар.",
  openGraph: {
    title: "xale — Илүүдэл барааны зах зээл",
    description:
      "Дэлгүүр, рестораны илүүдэл барааг худалдан авагчтай холбоно. Улаанбаатар.",
    locale: "mn_MN",
    type: "website",
  },
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
        <footer className="border-t border-stone-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 text-lg font-bold text-stone-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-sm text-white">
                  x
                </span>
                xale
              </p>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                Монголын илүүдэл / хугацаа дуусах дөхсөн барааны зах зээл.
                Улаанбаатар.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Холбоос</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                <li>
                  <Link href="/listings" className="hover:text-green-700">
                    Зарууд
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-green-700">
                    Бүртгүүлэх
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-green-700">
                    Нэвтрэх
                  </Link>
                </li>
                <li>
                  <Link href="/payment-terms" className="hover:text-green-700">
                    Төлбөрийн нөхцөл
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Тун удахгүй</p>
              <p className="mt-3 text-sm text-stone-500">
                Домэйн: <span className="font-medium text-stone-700">xale.mn</span>
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Одоо: xale-app.vercel.app
              </p>
            </div>
          </div>
          <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-400">
            © {new Date().getFullYear()} xale · MVP
          </div>
        </footer>
      </body>
    </html>
  );
}
