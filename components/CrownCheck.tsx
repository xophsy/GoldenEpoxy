"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CrownLogo from "./CrownLogo";
import { crownMotionEnabled, setCrownMotion } from "@/lib/crown-motion";

export default function CrownCheck() {
  const container = useRef<HTMLDivElement>(null);
  const output = useRef<HTMLPreElement>(null);
  const [choiceMessage, setChoiceMessage] = useState("");

  useEffect(() => {
    const update = () => {
      const canvas = container.current?.querySelector("canvas");
      if (!canvas || !output.current) return;
      const bounds = canvas.getBoundingClientRect();
      output.current.textContent = [
        "Check version: 5",
        `Status: ${canvas.dataset.status || "No playback status"}`,
        `Frame: ${canvas.dataset.frame ?? "none"} / ${Number(canvas.dataset.frameCount || 1) - 1}`,
        `Safari reduced motion: ${matchMedia("(prefers-reduced-motion: reduce)").matches ? "ON" : "OFF"}`,
        `GoldenEpoxy animation: ${crownMotionEnabled() ? "Enabled on this device" : "Follow Safari setting"}`,
        `Page: ${document.readyState}, ${document.visibilityState}`,
        `Canvas: ${Math.round(bounds.width)} × ${Math.round(bounds.height)}, opacity ${getComputedStyle(canvas).opacity}`,
        canvas.dataset.detail ? `Error: ${canvas.dataset.detail}` : "",
      ].filter(Boolean).join("\n");
    };
    update();
    const timer = window.setInterval(update, 150);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px", color: "#fff" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Crown playback check</h1>
      <p style={{ marginTop: 12, lineHeight: 1.6 }}>Tap Replay and watch the crown. The status below shows what Safari is doing.</p>
      <div ref={container} style={{ width: 200, height: 200, margin: "24px auto" }}>
        <CrownLogo />
      </div>
      <button type="button" onClick={() => window.dispatchEvent(new Event("crown-replay"))}
        style={{ width: "100%", minHeight: 48, borderRadius: 12, background: "#f4b400", color: "#111", fontWeight: 700 }}>
        Replay crown
      </button>
      <button type="button" onClick={() => {
        const saved = setCrownMotion(true);
        setChoiceMessage(saved ? "Enabled. The crown will animate on future visits to GoldenEpoxy in this browser." : "Playing now. Safari could not save your choice for future visits.");
      }} style={{ width: "100%", minHeight: 48, padding: 12, marginTop: 12, borderRadius: 12, border: "1px solid #f4b400", color: "#f4b400" }}>
        Enable crown animation on this device
      </button>
      <button type="button" onClick={() => {
        const saved = setCrownMotion(false);
        setChoiceMessage(saved ? "The crown now follows Safari’s motion setting." : "Following Safari for this visit. Safari could not save the change.");
      }} style={{ width: "100%", minHeight: 44, marginTop: 8, color: "#ccc" }}>
        Use Safari’s motion setting
      </button>
      <p role="status" style={{ marginTop: 12, lineHeight: 1.6 }}>{choiceMessage}</p>
      <pre ref={output} aria-live="off" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 16, marginTop: 20, borderRadius: 12, background: "#222", fontSize: 14, lineHeight: 1.65 }}>
        Check version: 5{"\n"}Status: Waiting for page JavaScript
      </pre>
      <p style={{ marginTop: 16, lineHeight: 1.6 }}>If it stays still, send the Status line shown above.</p>
      <Link href="/" style={{ display: "inline-block", padding: "20px 0", color: "#f4b400" }}>Back to Golden Epoxy</Link>
    </main>
  );
}
