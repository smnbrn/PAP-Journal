import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { getSettings } from "@/lib/data";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.masthead} · ${settings.tagline}`;
  return {
    title: { default: title, template: `%s · ${settings.masthead}` },
    description: settings.about,
    applicationName: settings.masthead,
    openGraph: { title, description: settings.about, type: "website", locale: "it_IT" },
  };
}

export const viewport: Viewport = {
  themeColor: "#f4efe4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" data-scroll-behavior="smooth" suppressHydrationWarning className={`${fraunces.variable} ${instrument.variable} ${plexMono.variable} antialiased`}>
      <head>
        {/* Abilita le animazioni di comparsa solo quando JavaScript è attivo */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
