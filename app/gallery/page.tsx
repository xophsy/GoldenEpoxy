import type { Metadata } from "next";
import { ButtonLink } from "@/components/design-system";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/collection-pages.module.css";
import GalleryGrid from "@/components/GalleryGrid";
import { getGalleryImages } from "@/lib/gallery";
export const metadata: Metadata = { title: "Our Work", description: "Explore real Golden Epoxy flooring installations across Tampa Bay." };
export default function GalleryPage() {
  const images = getGalleryImages();
  return <div className="site-shell"><SiteHeader homeLinks={false} />
    <main className={styles.page}>
      <section className={`content-shell ${styles.showroomIntro}`}>
        <p className={styles.eyebrow}>The Golden Epoxy gallery</p>
        <h1 className={styles.title}>Floors worth a closer look.</h1>
        <p className={styles.showroomLead}>Real spaces. Bold finishes. Explore our work, one detail at a time.</p>
      </section>
      <section id="gallery-grid" className="content-shell" aria-label="Installation photos"><GalleryGrid images={images} /></section>
      <section className={`content-shell ${styles.nextStep}`}><div><p className={styles.eyebrow}>Your space is next</p><h2>A floor worth<br />coming home to.</h2><p>Explore your color options and tell us what you have in mind.</p></div><div className={styles.actions}><ButtonLink href="/catalog" variant="secondary">Explore Finishes</ButtonLink><ButtonLink href="/contact">Get a Free Quote</ButtonLink></div></section>
    </main><SiteFooter homeLinks={false} /></div>;
}
