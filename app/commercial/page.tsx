import type { Metadata } from "next";
import { ButtonLink } from "@/components/design-system";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/collection-pages.module.css";
import FloorLayers from "@/components/FloorLayers";
import NextStep, { PHONE_HREF, PHONE_LABEL } from "@/components/NextStep";
import { photoDescriptions } from "@/data/gallery-editorial";
import { getGalleryImages, type GalleryImage } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Commercial Floors",
  description: "Epoxy floors for auto shops, gyms, warehouses and showrooms in Tampa Bay. Seamless, easy to clean, impact and chemical resistant. Free on-site estimate.",
};

// The outreach emails link here. Every claim comes from the approved brochure copy or the products in the estimate builder.
const SEGMENTS = [
  { name: "Auto shops and dealers", faces: "Hot tires, oil, brake fluid and rolling jacks.", floor: "A chemical-resistant topcoat that won't lift under hot tires, with anti-slip texture in the bays if you want it." },
  { name: "Gyms and studios", faces: "Sweat, dropped weights and steady foot traffic all day.", floor: "One seamless, impact-resistant surface that mops clean, with grip texture where the floor gets wet." },
  { name: "Warehouses and workshops", faces: "Carts, pallets, spills and dust.", floor: "An impact- and chemical-resistant floor that sweeps clean. We can add a static-control additive for electronics areas." },
  { name: "Showrooms and retail", faces: "Customers looking down at it all day.", floor: "Metallic or solid colors, and your logo set into the floor.", photo: "img-3800" },
];

function Photo({ image, sizes, eager = false }: { image: GalleryImage; sizes: string; eager?: boolean }) {
  return <picture>
    <source type="image/avif" srcSet={image.responsive.map(i => `${i.avif} ${i.width}w`).join(", ")} sizes={sizes} />
    <source type="image/webp" srcSet={image.responsive.map(i => `${i.webp} ${i.width}w`).join(", ")} sizes={sizes} />
    {/* The gallery pipeline already generates the responsive files, so a plain img is used. */}
    <img src={image.thumbnail.webp} alt={photoDescriptions[image.slug] ?? "Golden Epoxy commercial floor"} width={image.width} height={image.height}
      loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />
  </picture>;
}

export default function CommercialPage() {
  const images = getGalleryImages();
  const find = (slug: string) => images.find(image => image.slug === slug);
  const hero = find("img-3765");
  return <div className="site-shell"><SiteHeader homeLinks={false} />
    <main className={styles.page}>
      <section className={`content-shell ${styles.galleryHero}`}><div className={styles.ruleLabel}><span>Commercial floors</span><span>Tampa Bay</span></div>
        <div className={styles.splitHero}><div><p className={styles.eyebrow}>For Tampa Bay businesses</p><h1 className={styles.title}>Floors that take real traffic.</h1>
          <p className={styles.heroCopy}>We coat shop, gym, warehouse and showroom floors across Tampa Bay. The finish is seamless and easy to clean, stands up to impact and chemicals, and won&apos;t lift or peel under hot tires. The same crew does the prep and the install, to one standard.</p>
          <div className={`${styles.actions} ${styles.heroActions}`}><ButtonLink href="/contact">Book my free estimate</ButtonLink><ButtonLink href={PHONE_HREF} variant="secondary">Call Carlos: {PHONE_LABEL}</ButtonLink></div>
          <p className={styles.heroFacts}>Licensed and insured. Free on-site estimates.</p></div>
          {hero ? <figure className={styles.ownerFigure}><Photo image={hero} eager sizes="(max-width: 640px) 100vw, 50vw" /><figcaption><span>A showroom floor we finished</span><span>Yellow and charcoal metallic</span></figcaption></figure> : null}
        </div>
      </section>
      <section className="content-shell" aria-labelledby="segments-title">
        <div className={styles.segmentsIntro}><p className={styles.eyebrow}>By type of business</p><h2 id="segments-title">What your floor deals with, and what we put down.</h2></div>
        <ul className={styles.segments}>{SEGMENTS.map(segment => {
          const photo = segment.photo ? find(segment.photo) : undefined;
          return <li key={segment.name}>
            <h3>{segment.name}</h3>
            <p><span className={styles.segmentLabel}>Deals with</span>{segment.faces}</p>
            <p><span className={styles.segmentLabel}>We put down</span>{segment.floor}</p>
            {photo ? <figure className={styles.segmentPhoto}><Photo image={photo} sizes="(max-width: 640px) 100vw, 66vw" /><figcaption>The RestorFX logo, set into a yellow and charcoal metallic showroom floor.</figcaption></figure> : null}
          </li>;
        })}</ul>
      </section>
      <section className={`content-shell ${styles.layersSection}`} aria-labelledby="commercial-layers">
        <div><p className={styles.eyebrow}>Under every floor</p><h2 id="commercial-layers">A busy floor holds up because of the prep.</h2><p>Your floor gets the same layers as every Golden Epoxy job, starting with a ground, repaired and moisture-checked slab. That&apos;s why it doesn&apos;t lift or peel.</p></div>
        <FloorLayers />
      </section>
      <NextStep title="Want a price for your floor?" review={0} />
    </main><SiteFooter homeLinks={false} /></div>;
}
