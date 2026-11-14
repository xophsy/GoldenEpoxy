import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/design-system";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/collection-pages.module.css";
import FloorLayers from "@/components/FloorLayers";
import NextStep, { PHONE_HREF, PHONE_LABEL } from "@/components/NextStep";
import { serviceAreaCities, serviceAreaNote } from "@/data/service-area";
export const metadata: Metadata = { title: "About Us", description: "Golden Epoxy is an owner-operated epoxy floor crew in Tampa. Carlos answers the phone, does your estimate, and the same crew installs your floor." };

const AFTER_YOU_CALL = [
  { title: "You call or send the form", description: "Tell us the space, the look you want and roughly how big it is." },
  { title: "Carlos comes out", description: "Looks at the slab, measures it and brings physical color samples, so you choose on your own floor." },
  { title: "You get a written price", description: "Written down, before any work starts." },
  { title: "We install it", description: "Prep, base coat, your finish and the clear topcoat, all by the same crew." },
];

export default function AboutPage() {
  return <div className="site-shell"><SiteHeader homeLinks={false} />
    <main className={styles.page}>
      <section className={`content-shell ${styles.galleryHero}`}><div className={styles.ruleLabel}><span>About Golden Epoxy</span><span>Based in Tampa</span></div>
        <div className={styles.splitHero}><div><p className={styles.eyebrow}>Who you&apos;ll deal with</p><h1 className={styles.title}>You call Carlos.<br />Carlos comes out.</h1><p className={styles.heroCopy}>Golden Epoxy is an owner-operated crew based in Tampa. Carlos answers the phone, comes out to look at your concrete and gives you the written price. Then the same crew grinds, repairs and coats your floor.</p>
          <div className={`${styles.actions} ${styles.heroActions}`}><ButtonLink href="/contact">Book my free estimate</ButtonLink><ButtonLink href={PHONE_HREF} variant="secondary">Call Carlos: {PHONE_LABEL}</ButtonLink></div></div>
          <figure className={styles.ownerFigure}><Image src="/legacy-images/owner-photo.webp" alt="Golden Epoxy owner on site beside a coated entryway" width={1080} height={810} priority /><figcaption><span>Golden Epoxy on the job</span><span>Tampa Bay</span></figcaption></figure></div>
      </section>
      <section className={`content-shell ${styles.layersSection}`} aria-labelledby="about-layers">
        <div><p className={styles.eyebrow}>How we build a floor</p><h2 id="about-layers">Floors fail from the slab up, so that&apos;s where we start.</h2><p>We spend the most time on the part you never see. The clear topcoat on top takes hot tires and daily wear without lifting or peeling, and homes get a lifetime warranty.</p></div>
        <FloorLayers />
      </section>
      <section className={`content-shell ${styles.process}`} aria-labelledby="about-process"><div className={styles.ruleLabel}><span>What happens after you call</span><span>4 steps</span></div><h2 id="about-process">From your call to your new floor.</h2>
        <ol className={`${styles.processGrid} ${styles.processFour}`}>{AFTER_YOU_CALL.map((step, index) => <li key={step.title}><span className={styles.stepNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol></section>
      <section className={`content-shell ${styles.serviceArea}`} aria-labelledby="service-area-title">
        <div className={styles.serviceAreaIntro}><p className={styles.eyebrow}>Where we work</p><h2 id="service-area-title">Based in Tampa.<br />Working across the Bay.</h2><p>We come out to homes and businesses in these communities.</p></div>
        <div className={styles.serviceAreaDetails}><ul className={styles.cityList} aria-label="Communities we serve">{serviceAreaCities.map(city => <li key={city}>{city}</li>)}</ul><p className={styles.coverageNote}>{serviceAreaNote}</p></div>
      </section>
      <NextStep title="Ready for Carlos to see your floor?" />
    </main><SiteFooter homeLinks={false} /></div>;
}
