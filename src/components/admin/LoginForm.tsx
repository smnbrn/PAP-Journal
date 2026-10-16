"use client";
import { useActionState } from "react";
import { login, type FormState } from "@/app/redazione/actions";
import { inputClass } from "./ui";

export function LoginForm({ mode }: { mode: "local" | "supabase" }) {
  const [state, action, pending] = useActionState(login, {} as FormState);
  return (
    <form action={action} className="space-y-5">
      {state.message && (
        <p role="alert" className="rounded-md border-2 border-tomato-ink bg-[#f6ddd3] px-4 py-3 text-sm font-semibold text-tomato-ink">
          {state.message}
        </p>
      )}
      {mode === "supabase" && (
        <div>
          <label htmlFor="email" className="mb-1.5 block font-semibold">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
        </div>
      )}
      <div>
        <label htmlFor="password" className="mb-1.5 block font-semibold">
          {mode === "local" ? "Password della redazione" : "Password"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
          autoFocus={mode === "local"}
        />
      </div>
      <button type="submit" disabled={pending} className="btn btn-ink w-full py-3 text-base">
        {pending ? "Verifica in corso…" : "Entra in redazione"}
      </button>
    </form>
  );
}
