import type { Metadata } from "next";
import { ButtonLink } from "@/components/design-system";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/collection-pages.module.css";
import FloorLayers from "@/components/FloorLayers";
import GalleryGrid from "@/components/GalleryGrid";
import NextStep, { PHONE_HREF, PHONE_LABEL } from "@/components/NextStep";
import { getGalleryImages } from "@/lib/gallery";
export const metadata: Metadata = { title: "Our Work", description: "Photos of Golden Epoxy metallic and flake floors in garages, patios, entries and showrooms across Tampa Bay." };
export default function GalleryPage() {
  const images = getGalleryImages();
  return <div className="site-shell"><SiteHeader homeLinks={false} />
    <main className={styles.page}>
      <section className={`content-shell ${styles.showroomIntro}`}>
        <p className={styles.eyebrow}>Our work</p>
        <h1 className={styles.title}>Floors we&apos;ve finished across Tampa Bay.</h1>
        <p className={styles.showroomLead}>Garages, patios, front entries and a showroom. Every one of these started as concrete we ground, repaired and coated ourselves. See one you like? Open it and ask us to quote a floor like it.</p>
        <div className={`${styles.actions} ${styles.heroActions}`}>
          <ButtonLink href="/contact">Book my free estimate</ButtonLink>
          <ButtonLink href={PHONE_HREF} variant="secondary">Call Carlos: {PHONE_LABEL}</ButtonLink>
        </div>
      </section>
      <section id="gallery-grid" className="content-shell" aria-label="Installation photos"><GalleryGrid images={images} /></section>
      <section className={`content-shell ${styles.layersSection}`} aria-labelledby="layers-title">
        <div><p className={styles.eyebrow}>Under every floor here</p><h2 id="layers-title">A photo shows the finish. The prep is why it stays down.</h2><p>Every floor in this gallery is built the same way, from the slab up. Homes get a lifetime warranty.</p></div>
        <FloorLayers />
      </section>
      <NextStep title="Want a floor like one of these?" review={1} />
    </main><SiteFooter homeLinks={false} /></div>;
}
