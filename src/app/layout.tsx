import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import UniverseProvider from "@/components/universe/UniverseProvider";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SearchPalette from "@/components/ui/SearchPalette";
import { getMovies } from "@/lib/registry";

const display = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600", "800"], display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: "MOVIE UNIVERSE — One portal. Infinite stories.", template: "%s · MOVIE UNIVERSE" },
  description: "A 3D cinematic portal for discovering and watching independently developed animated web movies.",
};

export const viewport: Viewport = { themeColor: "#02030a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  // Lightweight projection for client-side search + random pick (no heavy fields, no registry import in the browser).
  const index = getMovies().map((m) => ({
    id: m.id, title: m.title, tagline: m.tagline, synopsis: m.synopsis, description: m.description, genre: m.genre, tags: m.tags,
    status: m.status, primary: m.theme.primary, secondary: m.theme.secondary,
  }));
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-black focus:px-4 focus:py-2">
          Skip to content
        </a>
        <UniverseProvider>
          <Nav index={index} />
          <SearchPalette index={index} />
          <div id="main" className="min-h-screen">
            {children}
          </div>
          <Footer />
        </UniverseProvider>
      </body>
    </html>
  );
}
