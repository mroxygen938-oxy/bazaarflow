import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BAZAARFLOW — Shop by Your Needs, Not Just by Products",
    template: "%s · BAZAARFLOW",
  },
  description:
    "Discover premium products, build your perfect bundle, and shop smarter with BAZAARFLOW — multi-vendor commerce with escrow protection across Bangladesh.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, categories] = await Promise.all([
    getSession(),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, icon: true },
    }),
  ]);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers userId={session?.id}>
          <Header user={session} categories={categories} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
