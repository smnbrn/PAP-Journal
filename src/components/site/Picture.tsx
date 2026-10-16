import Image from "next/image";

/**
 * Immagine responsive. Le illustrazioni SVG e le immagini della modalità prova
 * sono servite così come sono; le fotografie caricate su Supabase vengono
 * ridimensionate e convertite automaticamente da Next.js.
 */
export function Picture({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  fit = "cover",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  if (!src) {
    return (
      <div
        className={`absolute inset-0 bg-paper-3 bg-[radial-gradient(circle_at_30%_30%,#ebe3d3,transparent_60%)] ${className}`}
        role="img"
        aria-label={alt || "Immagine non disponibile"}
      />
    );
  }
  const passthrough = src.endsWith(".svg") || src.startsWith("/media/local/");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={passthrough}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
    />
  );
}
