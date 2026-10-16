import type { CourseSlug } from "@/lib/types";

/** Piccole icone al tratto, una per portata. Disegnate apposta per il giornale. */
export function CourseIcon({
  course,
  className = "size-8",
  strokeWidth = 1.6,
}: {
  course: CourseSlug;
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    className,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (course) {
    case "aperitivo":
      // Calice con oliva
      return (
        <svg {...common}>
          <path d="M12 8h24L24 24z" />
          <path d="M24 24v14M16 40h16" />
          <circle cx="28" cy="13" r="2.6" />
          <path d="M20 9.5 30.5 15.5" />
        </svg>
      );
    case "primo":
      // Piatto fondo con forchetta che arrotola
      return (
        <svg {...common}>
          <path d="M6 26h36a18 12 0 0 1-36 0z" />
          <path d="M17 26c0-4 3-6 7-6s7 2 7 6" />
          <path d="M33 6v12M30 6v5a3 3 0 0 0 6 0V6" />
        </svg>
      );
    case "secondo":
      // Germoglio che diventa piatto: dal campo al piatto
      return (
        <svg {...common}>
          <ellipse cx="24" cy="34" rx="17" ry="6" />
          <ellipse cx="24" cy="34" rx="9" ry="2.8" />
          <path d="M24 28V14" />
          <path d="M24 19c-6 0-9-4-9-8 5 0 9 3 9 8zM24 16c5 0 8-3 8-7-4 0-8 2-8 7z" />
        </svg>
      );
    case "contorno":
      // Ciotola d'insalata con foglie: la piazza delle opinioni
      return (
        <svg {...common}>
          <path d="M7 24h34c0 9-7.6 15-17 15S7 33 7 24z" />
          <path d="M14 24c0-6 4-10 9-10-1 5-4 8-9 10zM22 24c1-7 6-11 12-10-2 6-6 9-12 10z" />
          <path d="M30 24c2-3 5-4 8-3" />
        </svg>
      );
    case "dessert":
      // Fetta di torta con candela-penna
      return (
        <svg {...common}>
          <path d="M8 22 38 14v20H8z" />
          <path d="M8 28h30" />
          <path d="M8 22v12" />
          <path d="M28 12V5" />
          <path d="M28 5c1.5 1.4 1.5 3 0 4" />
        </svg>
      );
    case "caffe":
      // Moka
      return (
        <svg {...common}>
          <path d="M15 22h18l-3 18H18z" />
          <path d="M16 8h16l2 14H14z" />
          <path d="M20 8l1-3h6l1 3" />
          <path d="M33 11c5 0 6 8 1 10" />
          <path d="M14 13l-4 2" />
        </svg>
      );
  }
}

/** Fregio della testata: una spiga stilizzata. */
export function WheatMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor" aria-hidden>
      <path d="M19.2 38V8h1.6v30z" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(0 ${i * 6})`}>
          <ellipse cx="15.5" cy="11" rx="2.4" ry="4.6" transform="rotate(-32 15.5 11)" />
          <ellipse cx="24.5" cy="11" rx="2.4" ry="4.6" transform="rotate(32 24.5 11)" />
        </g>
      ))}
      <ellipse cx="20" cy="5" rx="2.2" ry="4.4" />
    </svg>
  );
}
