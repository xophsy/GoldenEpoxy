import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getGalleryImages } from "@/lib/gallery";
import styles from "./preview.module.css";

export const metadata: Metadata = {
  title: "Homepage Concept",
  robots: { index: false, follow: false },
};

function Installation({ id, eager = false }: { id: string; eager?: boolean }) {
  const photo = getGalleryImages().find((item) => item.id === id || item.slug === id);
  if (!photo) throw new Error(`Missing preview photograph: ${id}`);
  return (
    <picture>
      <source type="image/avif" srcSet={photo.responsive.map((item) => `${item.avif} ${item.width}w`).join(", ")} sizes={eager ? "(min-width: 900px) 58vw, 100vw" : "(min-width: 700px) 33vw, 100vw"} />
      <source type="image/webp" srcSet={photo.responsive.map((item) => `${item.webp} ${item.width}w`).join(", ")} sizes={eager ? "(min-width: 900px) 58vw, 100vw" : "(min-width: 700px) 33vw, 100vw"} />
      {/* Existing generated sources preserve the gallery's responsive asset pipeline. */}
      <img src={photo.thumbnail.webp} width={photo.width} height={photo.height} alt={id === "img-3800" ? "Finished yellow and charcoal metallic epoxy floor" : id === "img-3765" ? "Installer standing on a reflective metallic epoxy floor" : "White garage floor with a custom Tesla logo"} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} />
    </picture>
  );
}

const finishes = [
  { title: "Metallic", image: "/legacy-images/metallic-floor.png", text: "Flowing color. Reflective depth. A finish with its own character." },
  { title: "Flake", image: "/legacy-images/flake-floor-v2.png", text: "Layered texture and versatile blends for hardworking spaces." },
  { title: "Custom Solids & Logos", image: "/legacy-images/teslalogo-floor.png", text: "Clean color or a personal detail that makes the space yours." },
];

export default function PreviewPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#preview-content">Skip to content</a>
      <header className={styles.header}>
        <Link href="/" aria-label="Golden Epoxy home" className={styles.logo}><Image src="/legacy-images/logonew.png" width={64} height={64} alt="Golden Epoxy" /><span>GOLDEN EPOXY<small>FLOORING • TAMPA BAY</small></span></Link>
        <nav aria-label="Main navigation"><Link href="/gallery">Gallery</Link><Link href="/catalog">Catalog</Link><Link href="/contact" className={styles.button}>Get a Free Estimate <span aria-hidden="true">↗</span></Link></nav>
      </header>
      <main id="preview-content">
        <section className={styles.hero}>
          <div className={styles.heroCopy}><p className={styles.eyebrow}>CRAFTED FOR TAMPA BAY</p><h1>Epoxy floors<br />made for<br /><em>your space.</em></h1><p className={styles.body}>From the garage to the showroom. Thoughtful preparation, distinctive finishes, and care in every coat.</p><div className={styles.actions}><Link className={styles.button} href="/contact">Get a Free Estimate <span aria-hidden="true">↗</span></Link><Link className={styles.textLink} href="/gallery">Explore our work <span aria-hidden="true">→</span></Link></div><p className={styles.heroNote}>RESIDENTIAL & COMMERCIAL FLOORING</p></div>
          <div className={styles.heroPhoto}><Installation id="img-3800" eager /><span className={styles.photoLabel}>REAL FLOORS. OUR WORK.</span></div>
        </section>
        <div className={styles.trust}><span>Careful surface preparation</span><span>Metallic, flake & custom finishes</span><span>Serving the Tampa Bay area</span></div>
        <section className={styles.section}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>A CLOSER LOOK</p><h2>The finish speaks<br />for itself.</h2></div><Link className={styles.textLink} href="/gallery">View the full gallery <span aria-hidden="true">↗</span></Link></div>
          <div className={styles.workGrid}>{["img-3800", "img-3765", "teslalogo"].map((id, index) => <Link href="/gallery" key={id} className={styles.workCard} aria-label={`Explore installation photograph ${index + 1} in the gallery`}><div><Installation id={id} /></div><span><small>SELECTED WORK / 0{index + 1}</small><span aria-hidden="true">↗</span></span></Link>)}</div>
        </section>
        <section className={`${styles.section} ${styles.finishes}`}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>FIND YOUR FINISH</p><h2>One space.<br />So many possibilities.</h2></div><p className={styles.body}>Start with a look you love. We’ll help you find the right system for how you use your floor.</p></div>
          <div className={styles.finishGrid}>{finishes.map((finish, i) => <Link href="/catalog" className={styles.finishCard} key={finish.title}><div className={styles.finishPhoto}><Image src={finish.image} alt={`${finish.title} floor finish`} fill sizes="(min-width: 700px) 33vw, 100vw" /></div><div className={styles.finishTitle}><h3>{finish.title}</h3><span aria-hidden="true">↗</span></div><p>{finish.text}</p><small>0{i + 1} / EXPLORE FINISH</small></Link>)}</div>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>FROM THE GROUND UP</p><h2>A new way to see<br />your space.</h2></div><p className={styles.body}>The difference starts below the surface. See how preparation and a fresh finish transform a floor.</p></div>
          <div className={styles.comparison}>{["before", "after"].map((stage) => <figure key={stage}><Image src={`/legacy-images/slider/${stage}.png`} alt={`Floor ${stage} coating`} fill sizes="(min-width: 700px) 50vw, 100vw" /><figcaption>{stage === "before" ? "01 / BEFORE" : "02 / AFTER"}</figcaption></figure>)}</div>
          <div className={styles.steps}>{[{ title: "Prepare with care", text: "Assess the slab, repair imperfections, and prepare the surface for adhesion." }, { title: "Build your finish", text: "Apply the selected coating system, from the base to the color and protective layers." }, { title: "Give it time", text: "Allow the system to cure, then explain when and how to put your floor back to use." }].map((step, i) => <div key={step.title}><span>0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div>
        </section>
        <section className={styles.owner}><div className={styles.ownerPhoto}><Image src="/legacy-images/owner-photo.webp" alt="Golden Epoxy owner" fill sizes="(min-width: 900px) 40vw, 100vw" /></div><div className={styles.ownerCopy}><p className={styles.eyebrow}>THE PERSON BEHIND THE WORK</p><h2>Good floors start<br />with a conversation.</h2><p className={styles.body}>Meet the owner behind Golden Epoxy. Tell us what you have in mind, ask about finishes, and let’s work out the next step for your space.</p><div className={styles.actions}><Link href="/contact" className={styles.button}>Get a Free Estimate <span aria-hidden="true">↗</span></Link><a className={styles.textLink} href="tel:+18135800323">(813) 580-0323</a></div><p className={styles.serviceArea}>Tampa · St. Petersburg · Clearwater · Brandon<br />Wesley Chapel and surrounding communities</p></div></section>
      </main>
      <footer className={styles.footer}><span>GOLDEN EPOXY <small>Made for the way you live.</small></span><Link href="/">Compare with current homepage ↗</Link><small>© {new Date().getFullYear()} Golden Epoxy</small></footer>
    </div>
  );
}
