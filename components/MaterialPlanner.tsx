"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  baseColors,
  calculateMaterialPlan,
  systemGuides,
  type AreaMode,
  type FloorSystem,
  type JobSection,
  type MaterialJob,
  type ThicknessProfile,
} from "@/lib/material-planner";
import styles from "./material-planner.module.css";

const storageKey = "ge-material-jobs-v1";
const storageEvent = "ge-material-jobs-change";
const systems: FloorSystem[] = ["flake", "metallic", "solid"];

function subscribeToJobs(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(storageEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(storageEvent, onChange);
  };
}

function savedJobsSnapshot() {
  try { return localStorage.getItem(storageKey) ?? "[]"; }
  catch { return "[]"; }
}

function serverJobsSnapshot() { return "[]"; }

function localDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function blankJob(): MaterialJob {
  return {
    id: "draft",
    name: "",
    date: localDate(),
    areaMode: "total",
    totalSqFt: 0,
    sections: [{ id: "first", name: "Area 1", length: 0, width: 0 }],
    system: "flake",
    profile: "standard",
    allowancePct: 10,
    flakePrimer: false,
    solidTopcoat: false,
    baseColor: "Haze Gray",
    finishColor: "",
  };
}

function isSavedJob(value: unknown): value is MaterialJob {
  if (!value || typeof value !== "object") return false;
  const job = value as Partial<MaterialJob>;
  return typeof job.id === "string" && typeof job.name === "string" && typeof job.date === "string"
    && (job.areaMode === "total" || job.areaMode === "sections")
    && typeof job.totalSqFt === "number" && Array.isArray(job.sections)
    && job.sections.every((section) => section && typeof section.id === "string"
      && typeof section.name === "string" && Number.isFinite(section.length) && Number.isFinite(section.width))
    && systems.includes(job.system as FloorSystem)
    && (job.profile === "standard" || job.profile === "thicker")
    && typeof job.allowancePct === "number" && typeof job.flakePrimer === "boolean"
    && typeof job.solidTopcoat === "boolean" && typeof job.baseColor === "string"
    && typeof job.finishColor === "string";
}

function quantity(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function plural(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

export default function MaterialPlanner() {
  const [job, setJob] = useState<MaterialJob>(blankJob);
  const savedJson = useSyncExternalStore(subscribeToJobs, savedJobsSnapshot, serverJobsSnapshot);
  const savedJobs = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(savedJson);
      return Array.isArray(parsed) ? parsed.filter(isSavedJob) : [];
    } catch { return []; }
  }, [savedJson]);
  const [storageMessage, setStorageMessage] = useState("");
  const result = calculateMaterialPlan(job);
  const sectionsComplete = job.areaMode !== "sections" || (job.sections.length > 0
    && job.sections.every((section) => section.length > 0 && section.width > 0));
  const hasArea = result.areaSqFt > 0 && sectionsComplete;

  function update(patch: Partial<MaterialJob>) {
    setJob((current) => ({ ...current, ...patch }));
    setStorageMessage("");
  }

  function writeJobs(next: MaterialJob[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event(storageEvent));
      return true;
    } catch {
      setStorageMessage("This browser could not save the job. Check storage settings or available space.");
      return false;
    }
  }

  function saveJob() {
    if (!job.name.trim() || !job.date || !hasArea) {
      setStorageMessage("Add a job name, date, and complete floor measurements before saving.");
      return;
    }
    const saved = { ...job, id: job.id === "draft" ? crypto.randomUUID() : job.id, name: job.name.trim() };
    const next = [saved, ...savedJobs.filter((item) => item.id !== saved.id)];
    if (writeJobs(next)) {
      setJob(saved);
      setStorageMessage("Job saved on this device.");
    }
  }

  function deleteJob(id: string) {
    const saved = savedJobs.find((item) => item.id === id);
    if (!saved || !window.confirm(`Delete ${saved.name} from this device?`)) return;
    if (writeJobs(savedJobs.filter((item) => item.id !== id))) {
      if (job.id === id) setJob(blankJob());
      setStorageMessage("Saved job deleted.");
    }
  }

  function updateSection(id: string, patch: Partial<JobSection>) {
    update({ sections: job.sections.map((section) => section.id === id ? { ...section, ...patch } : section) });
  }

  return (
    <main className={`${styles.page} min-h-screen px-4 py-8 text-white sm:px-6 sm:py-12`}>
      <div className="mx-auto max-w-6xl">
        <div className={`${styles.screenOnly} flex flex-wrap items-center justify-between gap-3`}>
          <Link href="/tools" className="text-sm text-gold-300 hover:text-gold-200">← All tools</Link>
          <form action="/admin/logout" method="post"><button type="submit" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/65 hover:text-white">Sign out</button></form>
        </div>

        <div className={`${styles.screenOnly} mt-11 max-w-3xl`}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Staff tool · Simiron</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Material Planner</h1>
          <p className="mt-4 text-base leading-7 text-white/65">Plan each layer, see why it is used, and know how many full packages to bring.</p>
        </div>

        <div className={`${styles.screenOnly} mt-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_18rem]`}>
          <div className="space-y-7">
            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 sm:p-7" aria-labelledby="job-heading">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="text-xs uppercase tracking-[0.2em] text-gold-300">01 · Job</p><h2 id="job-heading" className="mt-2 text-xl font-semibold">Job details</h2></div>
                <button type="button" onClick={() => { setJob(blankJob()); setStorageMessage(""); }} className="text-sm text-white/55 hover:text-white">New job</button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
                <label className="block text-sm text-white/75">Job name<input type="text" value={job.name} onChange={(event) => update({ name: event.target.value })} placeholder="Example: Smith garage" className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white placeholder:text-white/30" /></label>
                <label className="block text-sm text-white/75">Job date<input type="date" value={job.date} onChange={(event) => update({ date: event.target.value })} className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white" /></label>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 sm:p-7" aria-labelledby="area-heading">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-300">02 · Area</p><h2 id="area-heading" className="mt-2 text-xl font-semibold">Measure the floor</h2>
              <div className="mt-5 inline-flex flex-wrap gap-2" role="group" aria-label="Area entry method">
                {(["total", "sections"] as AreaMode[]).map((mode) => <button key={mode} type="button" aria-pressed={job.areaMode === mode} onClick={() => update({ areaMode: mode })} className={`rounded-xl border px-4 py-2 text-sm ${job.areaMode === mode ? "border-gold-300 bg-gold-300/15 text-gold-200" : "border-white/15 text-white/60 hover:text-white"}`}>{mode === "total" ? "Known total" : "Measure sections"}</button>)}
              </div>
              {job.areaMode === "total" ? <label className="mt-5 block max-w-xs text-sm text-white/75">Total floor area · sq ft<input type="number" min="0" step="0.01" inputMode="decimal" value={job.totalSqFt || ""} onChange={(event) => update({ totalSqFt: numberValue(event.target.value) })} placeholder="500" className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white placeholder:text-white/30" /></label> : <div className="mt-5 space-y-3">
                {job.sections.map((section, index) => <div key={section.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 sm:grid-cols-[minmax(0,1fr)_6rem_6rem_auto] sm:items-end">
                  <label className="text-xs text-white/65">Section<input type="text" value={section.name} onChange={(event) => updateSection(section.id, { name: event.target.value })} placeholder={`Area ${index + 1}`} className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-white" /></label>
                  <label className="text-xs text-white/65">Length · ft<input type="number" min="0" step="0.01" value={section.length || ""} onChange={(event) => updateSection(section.id, { length: numberValue(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-white" /></label>
                  <label className="text-xs text-white/65">Width · ft<input type="number" min="0" step="0.01" value={section.width || ""} onChange={(event) => updateSection(section.id, { width: numberValue(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-white" /></label>
                  <button type="button" aria-label={`Remove ${section.name || `area ${index + 1}`}`} disabled={job.sections.length === 1} onClick={() => update({ sections: job.sections.filter((item) => item.id !== section.id) })} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/55 hover:text-white disabled:opacity-30">Remove</button>
                </div>)}
                <button type="button" onClick={() => update({ sections: [...job.sections, { id: crypto.randomUUID(), name: `Area ${job.sections.length + 1}`, length: 0, width: 0 }] })} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-gold-300 hover:border-gold-300/50">+ Add section</button>
              </div>}
              <p className="mt-5 text-sm text-white/60">Measured floor area: <strong className="text-white">{quantity(result.areaSqFt, 1)} sq ft</strong></p>
              {!sectionsComplete ? <p className="mt-2 text-sm text-amber-200">Enter a length and width for every section to finish the plan.</p> : null}
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 sm:p-7" aria-labelledby="system-heading">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-300">03 · System</p><h2 id="system-heading" className="mt-2 text-xl font-semibold">Choose the floor build</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="Floor system">
                {systems.map((system) => <button key={system} type="button" aria-pressed={job.system === system} onClick={() => update({ system, finishColor: "" })} className={`rounded-2xl border p-4 text-left ${job.system === system ? "border-gold-300 bg-gold-300/10" : "border-white/12 bg-black/15 hover:border-white/30"}`}><span className="block font-semibold text-white">{systemGuides[system].name}</span><span className="mt-2 block text-xs leading-5 text-white/55">{systemGuides[system].description}</span></button>)}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-white/75">Basecoat color<select value={job.baseColor} onChange={(event) => update({ baseColor: event.target.value })} className="mt-2 w-full rounded-xl border border-white/15 bg-coal-900 px-4 py-3 text-white">{baseColors.map((color) => <option key={color} value={color}>{color}</option>)}</select></label>
                {job.system !== "solid" ? <label className="block text-sm text-white/75">{job.system === "flake" ? "Chip blend" : "Metallic additive color"}<input type="text" value={job.finishColor} onChange={(event) => update({ finishColor: event.target.value })} placeholder="Optional label for job sheet" className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white placeholder:text-white/30" /></label> : null}
              </div>
              {job.system === "flake" ? <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-4 text-sm text-white/75"><input type="checkbox" checked={job.flakePrimer} onChange={(event) => update({ flakePrimer: event.target.checked })} className="mt-1 accent-gold-400" /><span><strong className="block text-white">Include 1000HS primer</strong>Use when this job calls for a separate primer before the 1150FC basecoat.</span></label> : null}
              {job.system === "solid" ? <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-4 text-sm text-white/75"><input type="checkbox" checked={job.solidTopcoat} onChange={(event) => update({ solidTopcoat: event.target.checked })} className="mt-1 accent-gold-400" /><span><strong className="block text-white">Include 971EPS satin topcoat</strong>Add a clear protective finish over the colored epoxy.</span></label> : null}
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 sm:p-7" aria-labelledby="plan-heading">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-300">04 · Plan</p><h2 id="plan-heading" className="mt-2 text-xl font-semibold">Choose your planning profile</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2" role="group" aria-label="Thickness profile">
                {(["standard", "thicker"] as ThicknessProfile[]).map((profile) => <button key={profile} type="button" aria-pressed={job.profile === profile} onClick={() => update({ profile })} className={`rounded-2xl border p-4 text-left ${job.profile === profile ? "border-gold-300 bg-gold-300/10" : "border-white/12 bg-black/15 hover:border-white/30"}`}><strong className="block text-white">{profile === "standard" ? "Standard" : "Thicker"}</strong><span className="mt-1 block text-xs leading-5 text-white/55">{profile === "standard" ? "A moderate application within Simiron’s published ranges." : "More material in applicable layers, still within the published ranges."}</span></button>)}
              </div>
              <label className="mt-6 block max-w-xs text-sm text-white/75">Extra material allowance · %<input type="number" min="0" max="50" step="1" value={job.allowancePct} onChange={(event) => update({ allowancePct: Math.min(50, numberValue(event.target.value)) })} className="mt-2 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white" /></label>
              <p className="mt-4 text-xs leading-5 text-white/50">These are planning profiles, not a claim that one thickness is optimal for every slab. Confirm site conditions and follow the Simiron guide before application.</p>
            </section>
          </div>

          <aside className="self-start rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 sm:p-6 lg:sticky lg:top-6" aria-labelledby="saved-heading">
            <h2 id="saved-heading" className="text-lg font-semibold">Saved jobs</h2><p className="mt-2 text-xs leading-5 text-white/50">Stored in this browser on this device.</p>
            <button type="button" onClick={saveJob} className="mt-5 w-full rounded-xl bg-gold-400 px-4 py-3 text-sm font-semibold text-coal-900 hover:bg-gold-300">Save this job</button>
            {storageMessage ? <p role="status" className="mt-3 text-sm text-gold-200">{storageMessage}</p> : null}
            {savedJobs.length === 0 ? <p className="mt-6 text-sm text-white/45">No saved jobs yet.</p> : <ul className="mt-5 space-y-2">{savedJobs.map((saved) => <li key={saved.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><button type="button" onClick={() => { setJob(saved); setStorageMessage(""); }} className="block w-full text-left"><span className="block truncate text-sm font-medium text-white">{saved.name}</span><span className="mt-1 block text-xs text-white/45">{saved.date} · {systemGuides[saved.system].name}</span></button><button type="button" onClick={() => deleteJob(saved.id)} className="mt-2 text-xs text-white/40 hover:text-red-200">Delete</button></li>)}</ul>}
          </aside>
        </div>

        <section className={`${styles.report} mt-10 max-w-6xl`} aria-labelledby="results-heading">
          <div className={styles.printOnly}><p className="text-sm font-bold uppercase tracking-widest">Golden Epoxy · Staff</p><h1 className="mt-2 text-3xl font-bold">Simiron Material Plan</h1></div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className={`${styles.screenOnly} text-xs uppercase tracking-[0.2em] text-gold-300`}>05 · Materials</p><h2 id="results-heading" className="mt-2 text-2xl font-semibold sm:text-3xl">{job.name.trim() || "Current job"}</h2><p className="mt-2 text-sm text-white/55">{job.date} · {systemGuides[job.system].name} · {job.profile === "standard" ? "Standard" : "Thicker"} profile</p></div>
            {hasArea ? <button type="button" onClick={() => window.print()} className={`${styles.screenOnly} rounded-xl border border-gold-300/50 px-5 py-3 text-sm font-semibold text-gold-200 hover:bg-gold-300/10`}>Print job sheet</button> : null}
          </div>
          {!hasArea ? <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/60">{!sectionsComplete ? "Complete every measured section to see the material plan." : "Enter a floor area to see the material plan."}</div> : <>
            <div className={`${styles.reportCard} mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 sm:grid-cols-3`}>
              <div><p className="text-xs uppercase tracking-widest text-white/45">Measured area</p><p className="mt-2 text-2xl font-semibold">{quantity(result.areaSqFt, 1)} <span className="text-sm font-normal">sq ft</span></p></div>
              <div><p className="text-xs uppercase tracking-widest text-white/45">Extra allowance</p><p className="mt-2 text-2xl font-semibold">{job.allowancePct}%</p></div>
              <div><p className="text-xs uppercase tracking-widest text-white/45">Planning area</p><p className="mt-2 text-2xl font-semibold text-gold-300">{quantity(result.planningAreaSqFt, 1)} <span className="text-sm font-normal">sq ft</span></p></div>
            </div>
            {job.areaMode === "sections" ? <p className="mt-4 text-xs text-white/45">Sections: {job.sections.map((section) => `${section.name || "Area"} ${quantity(section.length * section.width, 1)} sq ft`).join(" · ")}</p> : null}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {result.lines.map((line, index) => <article key={line.id} className={`${styles.reportCard} rounded-2xl border border-white/10 bg-white/[0.05] p-5 sm:p-6`}>
                <p className="text-xs uppercase tracking-widest text-gold-300">{line.coverage ? `Layer ${result.lines.slice(0, index + 1).filter((item) => item.coverage).length}` : "Pigment / additive"}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{line.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-white/60">{line.purpose}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                  <div><p className="text-xs text-white/45">Apply / use</p><p className="mt-1 text-lg font-semibold">{quantity(line.quantity)} {line.unit}</p></div>
                  <div><p className="text-xs text-white/45">Bring</p><p className="mt-1 text-lg font-semibold text-gold-300">{plural(line.packageCount, line.packageUnit)}</p></div>
                </div>
                <p className="mt-2 text-xs text-white/45">{line.packageDescription}</p>
                {line.coverage ? <p className="mt-4 text-xs text-white/60">{line.thicknessMils ? `${line.thicknessMils} mils · ` : ""}{quantity(line.coverage, 1)} {line.coverageUnit}</p> : <p className="mt-4 text-xs text-white/60">Based on the coating mix above.</p>}
                <a href={line.source} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-gold-300 underline underline-offset-4">Simiron system guide</a>
              </article>)}
            </div>
            <div className={`${styles.reportCard} mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-xs leading-6 text-white/55`}>
              <strong className="block text-sm text-white">Planning notes</strong>
              Quantities include the {job.allowancePct}% allowance and are rounded up to whole packages to bring. Coverage is theoretical; porosity, texture, temperature, and application method can change actual usage. Crack repair, moisture remediation, solvents, PPE, and other site-dependent supplies are not included. Check the linked Simiron guides and site conditions before mixing or application.
            </div>
          </>}
        </section>
      </div>
    </main>
  );
}
