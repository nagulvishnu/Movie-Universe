"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/watch")) return null;
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#02030a]/80 px-6 py-12 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-lg font-extrabold tracking-[0.25em]">
            Movie<span className="text-[#f5c46b]"> Universe</span>
          </p>
          <p className="mt-2 text-sm text-white/55">One portal. Infinite stories.</p>
          <p className="mt-1 max-w-md text-xs text-white/40">Independent movie applications, hosted together and discovered automatically from the movies/ directory.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.16em] text-white/60">
          {[
            ["/explore", "Explore"],
            ["/movies", "Library"],
            ["/genres", "Genres"],
            ["/collections", "Collections"],
            ["/continue", "Continue"],
            ["/about", "About"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="hover:text-[#f5c46b]">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
