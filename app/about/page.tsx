import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/design-system";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/collection-pages.module.css";
import { serviceAreaCities, serviceAreaNote } from "@/data/service-area";
import { processSteps } from "@/data/siteContent";
export const metadata: Metadata = { title: "About Us", description: "Meet Golden Epoxy, serving homes and businesses across Tampa Bay with carefully prepared, custom finished floors." };
export default function AboutPage() {
  return <div className="site-shell"><SiteHeader homeLinks={false} />
    <main className={styles.page}>
      <section className={`content-shell ${styles.galleryHero}`}><div className={styles.ruleLabel}><span>About Golden Epoxy</span><span>Serving Tampa Bay</span></div>
        <div className={styles.splitHero}><div><p className={styles.eyebrow}>The people behind your floor</p><h1 className={styles.title}>Good floors.<br />Personal care.</h1><p className={styles.heroCopy}>We turn concrete into a finished part of your space. From a home garage to a busy business, our work starts with careful preparation and a conversation about what you need.</p><ButtonLink href="/contact" className="!w-auto">Let’s Talk About Your Floor</ButtonLink></div><figure className={styles.ownerFigure}><Image src="/legacy-images/owner-photo.webp" alt="Golden Epoxy owner on site beside a coated entryway" width={1080} height={810} priority /><figcaption><span>On site. Hands on.</span><span>Golden Epoxy</span></figcaption></figure></div>
      </section>
      <section className={`content-shell ${styles.serviceArea}`} aria-labelledby="service-area-title">
        <div className={styles.serviceAreaIntro}><p className={styles.eyebrow}>Local to Tampa</p><h2 id="service-area-title">Based in Tampa.<br />Serving the surrounding Bay area.</h2><p>Custom floors for homes and businesses across these communities.</p></div>
        <div className={styles.serviceAreaDetails}><ul className={styles.cityList} aria-label="Communities we serve">{serviceAreaCities.map(city => <li key={city}><span aria-hidden>↗</span>{city}</li>)}</ul><p className={styles.coverageNote}>{serviceAreaNote}</p><div className={styles.actions}><ButtonLink href="/contact">Get a Free Quote</ButtonLink><ButtonLink href="tel:+18135800323" variant="secondary">Call (813) 580-0323</ButtonLink></div></div>
      </section>
      <section className={`content-shell ${styles.story}`}><p className={styles.eyebrow}>Our approach</p><div><h2>The finish gets the attention.<br />The preparation earns it.</h2><p>A beautiful surface starts underneath. Concrete repair, diamond grinding, and the right coating system are part of the work that makes a finished floor useful every day.</p><p>We help you weigh color, texture, and how your space will be used. Then we prepare the concrete, install the finish, and explain the curing and care your floor needs.</p></div></section>
      <section className={`content-shell ${styles.process}`} aria-labelledby="about-process"><div className={styles.ruleLabel}><span>From first conversation to finished floor</span><span>01 — 03</span></div><h2 id="about-process">Know what comes next.</h2><div className={styles.processGrid}>{processSteps.map((step, index) => <article key={step.title}><span className={styles.stepNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></section>
      <section className={`content-shell ${styles.nextStep}`}><div><p className={styles.eyebrow}>Homes & businesses · Tampa Bay</p><h2>Let’s talk about<br />your floor.</h2><p>Tell us about your space and where you’re located. We’ll help you explore the next step.</p></div><div className={styles.actions}><ButtonLink href="/contact">Get a Free Quote</ButtonLink><ButtonLink href="/gallery" variant="secondary">Visit the Gallery</ButtonLink></div></section>
    </main><SiteFooter homeLinks={false} /></div>;
}
