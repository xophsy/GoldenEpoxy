import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/design-system";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/collection-pages.module.css";
import CatalogGrid from "@/components/CatalogGrid";
import { getCatalogCategories } from "@/lib/catalog";
export const metadata: Metadata = { title: "Finish Catalog", description: "Explore metallic epoxy, flake blends, and neon colors for your Tampa Bay floor." };
export default function CatalogPage() {
  const categories = getCatalogCategories();
  const total = categories.reduce((sum, category) => sum + category.count, 0);
  return <div className="site-shell"><SiteHeader homeLinks={false} />
    <main className={styles.page}>
      <section className={`content-shell ${styles.catalogHero}`}>
        <div className={styles.ruleLabel}><span>The finish collection</span><span>{total} colors · 3 collections</span></div>
        <div className={styles.introRow}><h1 className={styles.title}>Find your<br />signature finish.</h1><div className={styles.introCopy}><p>Quiet neutrals. Rich metallics. A little more character. Explore the colors and textures that make a space your own.</p><a href="#finish-browser" className={styles.textLink}>Explore the collection <span aria-hidden>↓</span></a></div></div>
        <div className={styles.collectionStrip}>{categories.map((category) => {
          const swatch = category.images[Math.min(8, category.images.length - 1)];
          return swatch ? <div key={category.key} className={styles.collectionPreview}><Image src={swatch.thumbnail.webp} alt={swatch.alt} width={swatch.thumbnail.width} height={swatch.thumbnail.height} priority /><div><span>{category.label}</span><span>{category.count} colors</span></div></div> : null;
        })}</div>
      </section>
      <section id="finish-browser" className={`content-shell ${styles.browser}`} aria-label="Browse finish colors"><CatalogGrid categories={categories} /><p className={styles.note}>Screen colors are a guide. Lighting, application, and your concrete can affect the final appearance. Confirm your selection with a physical sample.</p></section>
      <section className={`content-shell ${styles.nextStep}`}><div><p className={styles.eyebrow}>From swatch to space</p><h2>See how a finish<br />comes to life.</h2><p>Browse completed floors, or let us help choose a system for your space.</p></div><div className={styles.actions}><ButtonLink href="/gallery" variant="secondary">View Our Work</ButtonLink><ButtonLink href="/contact">Get a Free Quote</ButtonLink></div></section>
    </main><SiteFooter homeLinks={false} /></div>;
}
