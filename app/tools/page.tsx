import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Staff Tools",
  robots: { index: false, follow: false },
};

export default async function ToolsPage() {
  if (!(await hasAdminSession())) redirect("/admin");

  return (
    <main className="min-h-screen px-5 py-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Golden Epoxy</Link>
          <form action="/admin/logout" method="post">
            <button type="submit" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-gold-300/40 hover:text-white">Sign out</button>
          </form>
        </div>

        <div className="mt-16 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Staff workspace</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Tools</h1>
          <p className="mt-5 text-base leading-7 text-white/65">Choose a tool to get started.</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link href="/tools/material-planner" className="group flex min-h-64 flex-col rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-2xl transition-colors hover:border-gold-300/40 hover:bg-white/[0.08] sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-300" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18 9 6l4 8 3-5 5 9H3Z" /><path d="M5 21h14M8 15h2M14 17h2" />
              </svg>
            </span>
            <h2 className="mt-8 text-2xl font-semibold tracking-tight text-white">Simiron Material Planner</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">Estimate coating, chip, and pigment quantities for each job and print a material sheet.</p>
            <span className="mt-auto pt-8 text-sm font-semibold text-gold-300 group-hover:text-gold-200">Open tool <span aria-hidden="true">→</span></span>
          </Link>
          <Link href="/tools/estimate-builder" className="group flex min-h-64 flex-col rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-2xl transition-colors hover:border-gold-300/40 hover:bg-white/[0.08] sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-300" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                <path d="M15 3v5h4M9 12h6M9 16h6" />
              </svg>
            </span>
            <h2 className="mt-8 text-2xl font-semibold tracking-tight text-white">Estimate &amp; Invoice Builder</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">Create estimates, switch to invoices, capture signatures, and save a PDF.</p>
            <span className="mt-auto pt-8 text-sm font-semibold text-gold-300 group-hover:text-gold-200">Open tool <span aria-hidden="true">→</span></span>
          </Link>
        </div>
      </div>
    </main>
  );
}
