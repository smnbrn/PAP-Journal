import Link from "next/link";
import { formatMonth } from "@/lib/format";
import type { Issue } from "@/lib/types";
import { Picture } from "./Picture";

/** Copertina in miniatura di un numero, come una rivista sullo scaffale. */
export function IssueCover({ issue, masthead, size = "md" }: { issue: Issue; masthead: string; size?: "md" | "lg" }) {
  return (
    <Link
      href={`/numeri/${issue.number}`}
      className="group block transition-transform duration-500 hover:-translate-y-1.5 hover:rotate-[-0.6deg]"
      aria-label={`${issue.number === 0 ? "Numero zero" : `Numero ${issue.number}`}, ${formatMonth(issue.month)}: ${issue.title}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-paper shadow-[0_1px_0_var(--color-rule),0_18px_30px_-18px_rgba(26,25,22,0.55)] ring-1 ring-ink/15">
        <div className="absolute inset-x-0 top-0 z-10 flex items-baseline justify-between bg-paper px-3 pt-2.5 pb-1.5">
          <span className={`font-display-wonk leading-none ${size === "lg" ? "text-3xl" : "text-xl"}`}>{masthead}</span>
          <span className="kicker text-[0.6rem] text-ink-mute">{formatMonth(issue.month)}</span>
        </div>
        <div className="absolute inset-x-0 top-11 bottom-14">
          <Picture src={issue.cover_image} alt="" sizes="(min-width: 1024px) 18vw, 45vw" />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between bg-paper px-3 pt-2 pb-2.5">
          <span className="text-xs leading-tight font-semibold">{issue.title}</span>
          <span className="font-display-wonk text-4xl leading-none text-tomato">{issue.number}</span>
        </div>
      </div>
    </Link>
  );
}

export function PlannedCover({ number, month, note }: { number: number; month: string; note?: string }) {
  return (
    <div
      className="flex aspect-[3/4] flex-col justify-between rounded-[3px] border-2 border-dashed border-ink/25 p-3 text-ink-mute"
      aria-label={`Numero ${number}, ${formatMonth(month)}: in preparazione`}
    >
      <span className="kicker text-[0.6rem]">In uscita</span>
      <span className="font-display-wonk text-5xl leading-none">{number}</span>
      <span>
        <span className="block text-sm font-semibold text-ink-soft">{formatMonth(month)}</span>
        {note && <span className="block text-xs">{note}</span>}
      </span>
    </div>
  );
}
