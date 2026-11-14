import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/collection-pages.module.css";
import CatalogGrid from "@/components/CatalogGrid";
import { getCatalogCategories } from "@/lib/catalog";
import NextStep from "@/components/NextStep";
export const metadata: Metadata = { title: "Finish Catalog", description: "Metallic, flake and neon epoxy colors. Pick one and we bring the physical sample to your free on-site estimate in Tampa Bay." };
export default function CatalogPage() {
  const categories = getCatalogCategories();
  const total = categories.reduce((sum, category) => sum + category.count, 0);
  return <div className="site-shell"><SiteHeader homeLinks={false} />
    <main className={styles.page}>
      <section className={`content-shell ${styles.catalogHero}`}>
        <div className={styles.ruleLabel}><span>The finish collection</span><span>{total} colors · 3 collections</span></div>
        <div className={styles.introRow}><h1 className={styles.title}>Pick a color.<br />We bring the sample.</h1><div className={styles.introCopy}><p>Colors shift on a screen, so use this page to narrow it down. Open a swatch and tap Quote this finish. Carlos brings the physical samples to your free estimate, and you choose with them on your own slab.</p><a href="#finish-browser" className={styles.textLink}>Browse the {total} colors <span aria-hidden>↓</span></a></div></div>
        <div className={styles.collectionStrip}>{categories.map((category) => {
          const swatch = category.images[Math.min(8, category.images.length - 1)];
          return swatch ? <div key={category.key} className={styles.collectionPreview}><Image src={swatch.thumbnail.webp} alt={swatch.alt} width={swatch.thumbnail.width} height={swatch.thumbnail.height} priority /><div><span>{category.label}</span><span>{category.count} colors</span></div></div> : null;
        })}</div>
      </section>
      <section id="finish-browser" className={`content-shell ${styles.browser}`} aria-label="Browse finish colors"><CatalogGrid categories={categories} /><p className={styles.note}>Lighting and your concrete change how a color looks once it&apos;s down, which is why you make the final pick from the physical sample. Want to see colors on real floors first? <a href="/gallery" className={styles.textLink}>Look through our work</a></p></section>
      <NextStep title="Found a color you like?" review={0} />
    </main><SiteFooter homeLinks={false} /></div>;
}
