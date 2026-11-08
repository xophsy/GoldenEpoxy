import Image from "next/image";
import { ButtonLink } from "@/components/design-system";
import styles from "./HeroSection.module.css";

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" />
      <path d="m6.5 10 2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section data-hero="home" className={`section ${styles.hero}`} aria-labelledby="home-headline">
      <Image
        src="/legacy-images/main.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.background}
      />
      <div className={`content-shell ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Tampa Bay · Epoxy flooring</p>
          <h1 id="home-headline" className={styles.headline}>
            <span>Beautiful floors.</span>{" "}
            <span className={styles.accent}>Built to last.</span>
          </h1>
          <p className={styles.description}>
            A better foundation for your everyday.<br />
            Epoxy flooring for Tampa Bay homes and businesses, from careful prep to the final finish.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/contact" className={styles.primary}>
              Get a Free Estimate
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                <path d="M3 10h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ButtonLink>
            <ButtonLink href="/gallery" variant="secondary" className={styles.secondary}>
              View Our Work
            </ButtonLink>
          </div>
          <ul className={styles.proof} aria-label="Installation details">
            <li><CheckIcon />Professional surface prep</li>
            <li><CheckIcon />One-day install available</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
