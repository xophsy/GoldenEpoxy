"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import animation from "./crown-frames.json";
import { CROWN_MOTION_EVENT, CROWN_MOTION_KEY, crownMotionEnabled } from "@/lib/crown-motion";

const FRAME_SIZE = animation.size;
const COLUMNS = animation.columns;
const START = animation.start;
const STILL = animation.still;
const frameEnds = animation.frameEnds;
const INTRO_HOLD_MS = 450;
const PLAYBACK_RATE = 3; // the 3.8 s drip clip (crown_video.py) plays in about 1.3 s

export default function CrownLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const fallback = stillRef.current;
    if (!canvas || !fallback) return;
    if (!context) {
      canvas.dataset.status = "Canvas is unavailable in Safari";
      return;
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sheets: HTMLImageElement[] = [];
    let loading = false;
    const logoLink = canvas.closest("a");
    let request = 0;
    let disposed = false;
    let ready = false;
    let elapsed = 0;
    let previous: number | undefined;
    let drawn = -1;
    let finished = false;
    let optedIn = crownMotionEnabled();
    let playOnce = false;
    let direction = 1; // -1 while the mouse is over the logo: the drips run back up
    const motionBlocked = () => preference.matches && !optedIn && !playOnce;

    const report = (status: string, detail = "") => {
      canvas.dataset.status = status;
      canvas.dataset.detail = detail;
    };
    report("Starting");
    const stop = () => {
      window.cancelAnimationFrame(request);
      previous = undefined;
    };
    const showStill = (reason = "Static fallback", detail = "") => {
      report(reason, detail);
      stop();
      canvas.style.opacity = "0";
      fallback.src = STILL;
      fallback.style.opacity = "1";
    };
    const draw = (index: number) => {
      if (index === drawn) return;
      context.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
      const sheet = sheets[Math.floor(index / animation.perSheet)];
      const localIndex = index % animation.perSheet;
      context.drawImage(sheet, (localIndex % COLUMNS) * FRAME_SIZE,
        Math.floor(localIndex / COLUMNS) * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE,
        0, 0, FRAME_SIZE, FRAME_SIZE);
      drawn = index;
      canvas.dataset.frame = String(index);
      canvas.style.opacity = "1";
      fallback.style.opacity = "0";
    };
    const tick = (now: number) => {
      if (disposed) return;
      if (motionBlocked()) { showStill("Reduced motion requested by Safari"); return; }
      if (document.visibilityState !== "visible") { stop(); return; }
      // A busy mobile main thread must not skip straight to the finished logo.
      if (previous !== undefined) elapsed += direction * Math.min(now - previous, 80);
      previous = now;
      const atStart = direction < 0 && elapsed <= INTRO_HOLD_MS;
      if (atStart) elapsed = INTRO_HOLD_MS; // leaving the logo then drips again at once, without the intro hold
      const found = frameEnds.findIndex((end) => (elapsed - INTRO_HOLD_MS) * PLAYBACK_RATE < end);
      const index = found < 0 ? frameEnds.length - 1 : found;
      try { draw(index); report("Playing"); } catch (error) { showStill("Canvas drawing failed", String(error)); return; }
      if (atStart) { report("Back at start"); return; }
      if (direction > 0 && index === frameEnds.length - 1) { finished = true; report("Finished"); return; }
      request = window.requestAnimationFrame(tick);
    };
    const play = () => {
      stop();
      if (disposed) return;
      if (motionBlocked()) { showStill("Reduced motion requested by Safari"); return; }
      if (!ready) {
        report("Loading animation image");
        if (!loading) {
          loading = true;
          void loadSheets();
        }
        return;
      }
      if (document.readyState !== "complete" || document.visibilityState !== "visible") {
        report("Waiting for visible, loaded page");
        return;
      }
      request = window.requestAnimationFrame(tick);
    };
    const resetFrames = () => {
      direction = 1;
      elapsed = 0;
      drawn = -1;
      finished = false;
      play();
    };
    const restart = () => { playOnce = false; resetFrames(); };
    // An explicit Replay request is allowed even when automatic motion is off.
    const replay = () => { playOnce = true; resetFrames(); };
    const onMotionChoice = (event: Event) => {
      optedIn = (event as CustomEvent<boolean>).detail === true;
      restart();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === CROWN_MOTION_KEY || event.key === null) {
        optedIn = crownMotionEnabled();
        restart();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") stop();
      else if (finished) restart();
      else play();
    };
    const onHover = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return; // a tap already replays the drip
      direction = event.type === "pointerenter" ? -1 : 1;
      finished = false;
      play();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) restart();
    };
    const loadSheets = async () => {
      try {
        await Promise.all(animation.sheets.map(async (src) => {
          const sheet = new window.Image();
          sheets.push(sheet);
          sheet.src = src;
          await sheet.decode();
        }));
        if (disposed) return;
        ready = true;
        play();
      } catch (error) {
        if (!disposed) {
          // Release partial downloads and allow a deliberate replay to retry.
          sheets.forEach((sheet) => sheet.removeAttribute("src"));
          sheets.length = 0;
          loading = false;
          showStill("Animation image download or decoding failed", String(error));
        }
      }
    };
    window.addEventListener("crown-replay", replay);
    window.addEventListener(CROWN_MOTION_EVENT, onMotionChoice);
    window.addEventListener("storage", onStorage);
    window.addEventListener("load", play);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", stop);
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", restart);
    logoLink?.addEventListener("click", replay);
    logoLink?.addEventListener("pointerenter", onHover);
    logoLink?.addEventListener("pointerleave", onHover);
    play();
    return () => {
      disposed = true;
      stop();
      window.removeEventListener("crown-replay", replay);
      window.removeEventListener(CROWN_MOTION_EVENT, onMotionChoice);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("load", play);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", stop);
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", restart);
      logoLink?.removeEventListener("click", replay);
      logoLink?.removeEventListener("pointerenter", onHover);
      logoLink?.removeEventListener("pointerleave", onHover);
      sheets.forEach((sheet) => sheet.removeAttribute("src"));
      sheets.length = 0;
    };
  }, []);

  return (
    <span className="relative block" data-crown-version="4">
      <picture>
        <source srcSet={STILL} media="(prefers-reduced-motion: reduce)" />
        <Image ref={stillRef} src={START} alt="Golden Epoxy logo" width={240} height={240} unoptimized loading="eager"
          className="h-[200px] w-auto object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]" />
      </picture>
      <canvas ref={canvasRef} width={FRAME_SIZE} height={FRAME_SIZE} aria-hidden="true" data-frame-count={frameEnds.length} data-status="Waiting for JavaScript"
        className="absolute inset-0 !h-full !w-full opacity-0 drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]" />
    </span>
  );
}
