import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import TopSearch from "./animes/[anime]/components/TopSearch";
import { getSearchItems } from "@/app/lib/getSearchItems";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LALA Scene Packs",
  description:
    "Browse anime, series and movie scene packs with fast search and organized character pages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0 }}
      >
        <div className="space-bg">
          <div className="stars stars-1" />
          <div className="stars stars-2" />
          <div className="stars stars-3" />
        </div>

        <div className="site-content">
          <header
            className="siteHeaderGlass"
            style={{
              background: "rgba(8, 10, 18, 0.42)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              padding: "18px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              position: "sticky",
              top: 0,
              zIndex: 50,
            }}
          >
            <div
              className="siteHeaderInner"
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                color: "white",
              }}
            >
              <Link
                href="/"
                className="siteLogo"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "22px",
                  whiteSpace: "nowrap",
                }}
              >
                LALA SCENE PACKS
              </Link>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <TopSearch items={getSearchItems()} />
              </div>

              <div
                className="siteNav"
                style={{
                  display: "flex",
                  gap: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Link href="/" className="siteNavLink">
  Home
</Link>

                <Link href="/animes" className="siteNavLink">
  Anime
</Link>

<Link href="/series" className="siteNavLink">
  Series
</Link>

<Link href="/movies" className="siteNavLink">
  Movies
</Link>
              </div>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}