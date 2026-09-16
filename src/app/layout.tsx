import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { getSession } from "@/lib/auth";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "xale — Азтай уут зах зээл",
    template: "%s · xale",
  },
  description:
    "Азтай уут: ол → захиал → ав. Улаанбаатар.",
  applicationName: "xale",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "xale",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "xale — Азтай уут зах зээл",
    description:
      "Азтай уут — илүүдэл хоолыг хаягдахаас авар. Улаанбаатар.",
    locale: "mn_MN",
    type: "website",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B3D2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="mn">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)] pb-20 md:pb-0">{children}</main>
        <SiteFooter />
        <BottomNav
          session={session ? { role: session.role } : null}
        />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
