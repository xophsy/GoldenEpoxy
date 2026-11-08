export const CROWN_MOTION_KEY = "goldenepoxy:crown-motion";
export const CROWN_MOTION_EVENT = "crown-motion-change";

export function crownMotionEnabled() {
  try { return window.localStorage.getItem(CROWN_MOTION_KEY) === "enabled"; }
  catch { return false; }
}

export function setCrownMotion(enabled: boolean) {
  let saved = true;
  try {
    if (enabled) window.localStorage.setItem(CROWN_MOTION_KEY, "enabled");
    else window.localStorage.removeItem(CROWN_MOTION_KEY);
  } catch { saved = false; }
  window.dispatchEvent(new CustomEvent(CROWN_MOTION_EVENT, { detail: enabled }));
  return saved;
}
