import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminIsConfigured, hasAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Staff Access",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await hasAdminSession()) redirect("/Tools");
  const { error } = await searchParams;
  const configured = adminIsConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl sm:p-10">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Golden Epoxy</Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-white">Staff tools</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">Enter the staff password to open the estimate and invoice builder.</p>
        {error === "invalid" ? <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">Incorrect password. Try again.</p> : null}
        {!configured ? <p role="alert" className="mt-5 rounded-xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-gold-100">Staff access is not configured yet.</p> : null}
        <form action="/admin/login" method="post" className="mt-7 space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold-300" />
          </div>
          <button type="submit" disabled={!configured} className="w-full rounded-xl bg-gold-400 px-5 py-3 font-semibold text-coal-900 hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50">Open tools</button>
        </form>
        <Link href="/" className="mt-7 inline-block text-sm text-white/55 hover:text-white">← Back to website</Link>
      </div>
    </main>
  );
}
