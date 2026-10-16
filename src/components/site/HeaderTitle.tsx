"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Al centro della barra: la testata. In prima pagina, dove la testata grande
 * è già visibile, compare solo dopo aver fatto scorrere la pagina.
 */
export function HeaderTitle({ masthead, issueLabel }: { masthead: string; issueLabel: string | null }) {
  const home = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!home) return;
    const onScroll = () => setScrolled(window.scrollY > 260);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home]);

  const showMasthead = !home || scrolled;
  return (
    <Link href="/" className="relative block text-center" aria-label={`${masthead}, prima pagina`}>
      <span
        className={`font-display-wonk block text-2xl leading-none whitespace-nowrap transition-all duration-500 sm:text-3xl ${
          showMasthead ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {masthead}
      </span>
      {home && issueLabel && (
        <span
          aria-hidden
          className={`kicker absolute inset-x-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-ink-mute transition-all duration-500 ${
            showMasthead ? "translate-y-1 opacity-0" : "opacity-100"
          }`}
        >
          {issueLabel}
        </span>
      )}
    </Link>
  );
}
