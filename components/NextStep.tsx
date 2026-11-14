import { ButtonLink } from "@/components/design-system";
import styles from "@/components/collection-pages.module.css";
import { GOOGLE_REVIEW_URL, REVIEWS } from "@/components/ReviewsCarousel";

export const PHONE_HREF = "tel:+18135800323";
export const PHONE_LABEL = "(813) 580-0323";

// Closing band shared by the interior pages: the ask, the facts behind it, and one real Google review beside it.
export default function NextStep({ title, review = 2 }: { title: string; review?: number }) {
  const quote = REVIEWS[review] ?? REVIEWS[0];
  return <section className={`content-shell ${styles.nextStep}`} aria-labelledby="next-step-title">
    <div>
      <p className={styles.eyebrow}>Free on-site estimate</p>
      <h2 id="next-step-title">{title}</h2>
      <p>Carlos comes out, looks at your slab, measures it and brings physical color samples. You get a written price before any work starts.</p>
      <div className={styles.actions}>
        <ButtonLink href="/contact">Book my free estimate</ButtonLink>
        <ButtonLink href={PHONE_HREF} variant="secondary">Call Carlos: {PHONE_LABEL}</ButtonLink>
      </div>
    </div>
    <figure className={styles.review}>
      <blockquote><p>{quote.text}</p></blockquote>
      <figcaption>{quote.name}, <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer">Google review</a></figcaption>
    </figure>
  </section>;
}
