"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./collection-pages.module.css";
import { ButtonLink } from "./design-system";
import type { CatalogCategory, CatalogImage } from "@/lib/catalog";

type CatalogCategoryGroup = {
  key: CatalogCategory;
  label: string;
  count: number;
  images: CatalogImage[];
};

type Props = {
  categories: CatalogCategoryGroup[];
};

function buildSrcSet(imgs: CatalogImage["responsive"], fmt: "avif" | "webp") {
  return imgs.map((i) => `${i[fmt]} ${i.width}w`).join(", ");
}

function numberLabel(value: number | null) {
  if (value === null) return "N/A";
  return value.toString().padStart(2, "0");
}

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: CatalogImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const image = images[index];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const origin = document.activeElement as HTMLElement | null;
    const closeButton = container.querySelector<HTMLElement>("button");
    closeButton?.focus();

    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onTab);
    return () => { window.removeEventListener("keydown", onTab); origin?.focus(); };
  }, []);

  return createPortal(
    <div
      ref={containerRef}
      className={`gallery-lightbox ${styles.lightbox}`}
      role="dialog"
      aria-modal="true"
      aria-label="Catalog swatch lightbox"
      onClick={onClose}
    >
      <div className="gallery-lightbox__panel" onClick={(event) => event.stopPropagation()}>
        {/* Generated full-resolution asset; preserve the original dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.lightbox.src} alt={image.alt} className="gallery-lightbox__img" />
      </div>

      <button
        type="button"
        className="gallery-lightbox__close"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2 2l12 12M14 2L2 14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="gallery-lightbox__nav gallery-lightbox__nav--prev"
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            aria-label="Previous swatch"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M11 3L5 9l6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="gallery-lightbox__nav gallery-lightbox__nav--next"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label="Next swatch"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M7 3l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      <div className={styles.lightboxFoot} onClick={(event) => event.stopPropagation()}>
        <p className={styles.lightboxName}>{image.title} · {image.category} · #{numberLabel(image.number)}</p>
        <ButtonLink href={`/contact?finish=${encodeURIComponent(image.slug)}`}>Quote this finish</ButtonLink>
      </div>
      <div className="gallery-lightbox__counter" aria-live="polite">
        {index + 1} / {images.length}
      </div>
    </div>,
    document.body,
  );
}

const descriptions: Record<CatalogCategory, string> = {
  metallic: "Metallic pigment mixed into the epoxy and worked by hand, so the color moves and pools. No two floors come out the same.",
  flakes: "Vinyl flakes broadcast into the wet base coat for a speckled, textured finish.",
  neon: "Bright colors for accents, logos and borders. Tell us what you want them to mark and we'll plan where they go.",
};
export default function CatalogGrid({ categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>(categories[0]?.key ?? "metallic");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentCategory = categories.find((category) => category.key === activeCategory) ?? categories[0];
  const images = useMemo(() => (currentCategory?.images ?? []).filter(image =>
    `${image.title} ${image.number ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [currentCategory, query]);
  const close = useCallback(() => setSelectedIndex(null), []);
  const prev = useCallback(() => setSelectedIndex(i => i !== null ? (i - 1 + images.length) % images.length : null), [images.length]);
  const next = useCallback(() => setSelectedIndex(i => i !== null ? (i + 1) % images.length : null), [images.length]);
  if (!currentCategory) return <p className={styles.empty}>Our finish collection is being updated. Contact us to explore available colors.</p>;
  return <>
    <div className={styles.filters}>
      <div className={styles.categories} aria-label="Finish collections">{categories.map(category => <button type="button" key={category.key} aria-pressed={category.key === activeCategory} onClick={() => {setSelectedIndex(null); setActiveCategory(category.key); setQuery("");}} className={styles.category}>{category.label}<span>{category.count}</span></button>)}</div>
      <label className={styles.search}>Search this collection<input type="search" value={query} onChange={event => {setSelectedIndex(null); setQuery(event.target.value);}} placeholder="Color name or number" /></label>
    </div>
    <div className={styles.toolbar}><h2 className="text-xl font-medium">{currentCategory.label} Collection</h2><p role="status">{images.length} of {currentCategory.count} colors</p></div>
    <p className={styles.collectionDescription}>{descriptions[currentCategory.key]}</p>
    {images.length ? <div className={styles.swatchGrid}>{images.map((image, index) => <button key={image.id} type="button" className={styles.swatch} onClick={() => setSelectedIndex(index)} aria-label={`Open ${image.title} swatch`}>
      <picture><source type="image/avif" srcSet={buildSrcSet(image.responsive,"avif")} sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw" /><source type="image/webp" srcSet={buildSrcSet(image.responsive,"webp")} sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw" />
        <img src={image.thumbnail.webp} alt="" width={image.thumbnail.width} height={image.thumbnail.height} loading="lazy" decoding="async" />
      </picture><div className={styles.swatchLabel}><span>{image.title}</span><span>#{numberLabel(image.number)}</span></div>
    </button>)}</div> : <div className={styles.empty}><p>No colors match “{query}” in this collection.</p><button type="button" className={styles.textLink} onClick={() => setQuery("")}>Clear search</button></div>}
    {selectedIndex !== null && images[selectedIndex] ? <Lightbox images={images} index={selectedIndex} onClose={close} onPrev={prev} onNext={next} /> : null}
  </>;
}
