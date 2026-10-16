"use client";
import { FileText, Gamepad2, Home, Inbox, Newspaper, Settings, Vote } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/redazione", label: "Scrivania", icon: Home },
  { href: "/redazione/articoli", label: "Articoli", icon: FileText },
  { href: "/redazione/numeri", label: "Numeri", icon: Newspaper },
  { href: "/redazione/contributi", label: "Contributi", icon: Inbox },
  { href: "/redazione/sondaggi", label: "Sondaggi", icon: Vote },
  { href: "/redazione/giochi", label: "Giochi", icon: Gamepad2 },
  { href: "/redazione/impostazioni", label: "Impostazioni", icon: Settings },
];

export function AdminNav({ pending }: { pending?: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Area redazione" className="-mx-1 overflow-x-auto lg:mx-0 lg:overflow-visible">
      <ul className="flex gap-1 px-1 lg:flex-col lg:px-0">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/redazione" ? path === href : path.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-paper text-ink" : "text-paper/80 hover:bg-paper/10 hover:text-paper"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
                {href === "/redazione/contributi" && !!pending && (
                  <span className="ml-auto rounded-full bg-saffron px-2 font-mono text-xs text-ink" aria-label={`${pending} da leggere`}>
                    {pending}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
