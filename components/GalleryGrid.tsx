"use client";
import { useEffect, useRef, useState } from "react";
import PhotoSwipe from "photoswipe";
import "photoswipe/style.css";
import type { GalleryImage } from "@/lib/gallery";
import { featuredPhotos, photoDescriptions, photoTags } from "@/data/gallery-editorial";
import styles from "./GalleryGrid.module.css";
import chips from "./collection-pages.module.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "metallic", label: "Metallic" },
  { key: "flake", label: "Flake" },
  { key: "garage", label: "Garages" },
  { key: "outdoor", label: "Patios and entries" },
  { key: "indoor", label: "Rooms and showrooms" },
] as const;
type FilterKey = typeof FILTERS[number]["key"];
function matches(image: GalleryImage, filter: FilterKey) {
  const tags = photoTags[image.slug];
  return filter === "all" || tags?.finish === filter || tags?.space === filter;
}

function description(image: GalleryImage) {
  return photoDescriptions[image.slug] ?? "Golden Epoxy floor installation";
}
function Photo({ image, sizes, eager = false, position = "50% 50%" }: {
  image: GalleryImage; sizes: string; eager?: boolean; position?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const imageElement = imageRef.current;
    if (imageElement?.complete && imageElement.naturalWidth === 0) {
      // A failed request may finish before React attaches its error listener.
      const frame = requestAnimationFrame(() => setFailed(true));
      return () => cancelAnimationFrame(frame);
    }
  }, []);
  return failed ? <span className={styles.unavailable}>Photo preview unavailable. Tap to open the full image.</span> : <picture>
    <source type="image/avif" srcSet={image.responsive.map(i => `${i.avif} ${i.width}w`).join(", ")} sizes={sizes} />
    <source type="image/webp" srcSet={image.responsive.map(i => `${i.webp} ${i.width}w`).join(", ")} sizes={sizes} />
    {/* Local pipeline supplies responsive optimized assets. */}
    <img ref={imageRef} src={image.thumbnail.webp} alt={description(image)} width={image.width} height={image.height}
      loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"}
      decoding="async" style={{ objectPosition: position }} onError={() => setFailed(true)} />
  </picture>;
}
export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState(0);
  const [visibleCount, setVisibleCount] = useState(12);
  const [filter, setFilter] = useState<FilterKey>("all");
  const shown = images.filter(image => matches(image, filter));
  const viewer = useRef<PhotoSwipe | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const featured = featuredPhotos.flatMap(entry => {
    const image = images.find(item => item.slug === entry.id);
    return image ? [{ ...entry, image }] : [];
  });
  const active = featured[selected] ?? featured[0];
  useEffect(() => () => { viewer.current?.destroy(); }, []);
  function open(image: GalleryImage, origin: HTMLButtonElement, list: GalleryImage[] = images) {
    if (viewer.current) return;
    const scrollY = window.scrollY;
    const previousStyle = document.body.getAttribute("style");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const instance = new PhotoSwipe({
      dataSource: list.map(item => ({ src: item.lightbox.src, width: item.lightbox.width,
        height: item.lightbox.height, alt: description(item) })),
      index: list.findIndex(item => item.id === image.id), mainClass: "golden-gallery-viewer", bgOpacity: 1,
      showHideAnimationType: reduced ? "none" : "fade", showAnimationDuration: reduced ? 0 : 180,
      hideAnimationDuration: reduced ? 0 : 180, zoomAnimationDuration: reduced ? 0 : 180,
      returnFocus: false, trapFocus: true, closeOnVerticalDrag: false,
      imageClickAction: "zoom", tapAction: "zoom", doubleTapAction: "zoom", bgClickAction: false,
      preload: [1, 1], paddingFn: () => ({ top: 70, bottom: 80, left: 12, right: 12 }),
      errorMsg: "This photo could not load. Try the next photo or close and reopen it.",
    });
    viewer.current = instance;
    instance.on("uiRegister", () => {
      instance.ui?.registerElement({
        name: "quote", className: "pswp__quote", order: 8, isButton: false, tagName: "a", appendTo: "root",
        html: "Quote a floor like this",
        onInit: (element, pswp) => {
          const link = element as HTMLAnchorElement;
          const point = () => { link.href = `/contact?photo=${encodeURIComponent(list[pswp.currIndex]?.slug ?? "")}`; };
          point(); pswp.on("change", point);
        },
      });
    });
    instance.on("destroy", () => {
      viewer.current = null;
      if (previousStyle === null) document.body.removeAttribute("style");
      else document.body.setAttribute("style", previousStyle);
      window.scrollTo({ top: scrollY, behavior: "instant" });
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    });
    instance.init();
    instance.element?.setAttribute("aria-modal", "true");
    instance.element?.setAttribute("aria-label", "Golden Epoxy photo viewer");
    instance.element?.addEventListener("keydown", event => {
      if (event.key !== "Tab") return;
      const buttons = Array.from(instance.element?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") ?? [])
        .filter(button => button.getClientRects().length && getComputedStyle(button).visibility !== "hidden");
      if (!buttons.length) return;
      event.preventDefault();
      const current = buttons.indexOf(document.activeElement as HTMLElement);
      const next = current < 0 ? (event.shiftKey ? buttons.length - 1 : 0)
        : (current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
      buttons[next].focus();
    });
    Object.assign(document.body.style, { position: "fixed", top: `-${scrollY}px`, width: "100%", overflow: "hidden" });
  }
  function showMore() {
    const firstNewIndex = visibleCount;
    setVisibleCount(count => Math.min(count + 12, shown.length));
    requestAnimationFrame(() => grid.current?.querySelectorAll<HTMLButtonElement>("button")[firstNewIndex]?.focus({ preventScroll: true }));
  }
  if (!images.length) return <div className={styles.empty}><p>We’re updating our project photos.</p><a href="/contact">Book a free estimate</a></div>;
  return <div className={styles.gallery}>
    {active && <section className={styles.showroom} aria-label="Featured floor photographs">
      <button className={styles.stage} onClick={event => open(active.image, event.currentTarget)} aria-label={`Enlarge ${description(active.image)}`}>
        <Photo key={active.image.id} image={active.image} eager sizes="(max-width: 1200px) 100vw, 1184px" position={active.position} />
        <span className={styles.expand}>View full photo <span aria-hidden>↗</span></span>
      </button>
      <div className={styles.stageCaption} aria-live="polite"><span>{active.label}</span><span className={styles.number}>{String(selected + 1).padStart(2, "0")} <span>/ {String(featured.length).padStart(2, "0")}</span></span></div>
      <div className={styles.thumbnails} aria-label="Choose a featured photo">
        {featured.map((entry, index) => <button key={entry.id} aria-label={`Show ${entry.label}`} aria-pressed={selected === index}
          onClick={event => { setSelected(index); event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" }); }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entry.image.thumbnail.webp} alt="" width={112} height={80} loading="lazy" style={{ objectPosition: entry.position }} />
          <span>{String(index + 1).padStart(2, "0")}</span>
        </button>)}
      </div>
    </section>}
    <div className={styles.collectionHeading}><div><p className={styles.eyebrow}>Every photo</p><h2>Narrow it to the floor you want.</h2></div><p>Open any photo full size, then ask us to quote a floor like it.</p></div>
    <div className={chips.categories} role="group" aria-label="Filter photos" style={{ marginTop: 24 }}>{FILTERS.map(option => <button type="button" key={option.key} className={chips.category} aria-pressed={filter === option.key}
      onClick={() => { setFilter(option.key); setVisibleCount(12); }}>{option.label}<span>{images.filter(image => matches(image, option.key)).length}</span></button>)}</div>
    <div className={styles.toolbar}><p role="status">Showing {Math.min(visibleCount, shown.length)} of {shown.length} photos</p></div>
    <div ref={grid} className={styles.collage} aria-label="Installation photographs">
      {shown.slice(0, visibleCount).map((image, index) => <button key={image.id} className={styles.tile} onClick={event => open(image, event.currentTarget, shown)} aria-label={`Enlarge ${description(image)}, photo ${index + 1}`}>
        <Photo image={image} sizes="(max-width: 359px) 100vw, (max-width: 767px) 90vw, (max-width: 1023px) 50vw, 800px" />
        <span className={styles.tileNumber}>{String(index + 1).padStart(2, "0")}</span><span className={styles.tileExpand} aria-hidden>↗</span>
      </button>)}
    </div>
    {visibleCount < shown.length && <button className={styles.loadMore} onClick={showMore}>Show more photos <span aria-hidden>↓</span></button>}
  </div>;
}
