import type { Metadata } from "next";
import { serviceAreaCities, serviceAreaNote } from "@/data/service-area";
import ContactForm from "@/components/ContactForm";
import {
  ButtonLink,
  SectionHeading,
  SectionShell,
  SurfaceCard,
} from "@/components/design-system";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { GOOGLE_REVIEW_URL, REVIEWS } from "@/components/ReviewsCarousel";
import { PHONE_HREF, PHONE_LABEL } from "@/components/NextStep";
import { leadEmail } from "@/data/siteContent";
import { photoDescriptions, photoTags } from "@/data/gallery-editorial";
import { getCatalogManifest } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Free Estimate",
  description: "Book a free on-site estimate for an epoxy floor in Tampa Bay. Carlos measures your slab, brings color samples and gives you a written price.",
};

const STYLE_BY_LOOK: Record<string, string> = { metallic: "Metallic / shimmer", flakes: "Flake / terrazzo", flake: "Flake / terrazzo", solid: "Solid color" };

// Only slugs that exist in the site's own data are accepted; anything else in the URL is ignored.
function prefillFrom(params: Record<string, string | string[] | undefined>) {
  const finish = typeof params.finish === "string" ? params.finish : "";
  const photo = typeof params.photo === "string" ? params.photo : "";
  const swatch = getCatalogManifest().images.find(image => image.slug === finish);
  if (swatch) {
    const label = `${swatch.title} (${swatch.category}${swatch.number !== null ? ` #${swatch.number}` : ""})`;
    return { picked: `the ${label} finish`, initial: { style: STYLE_BY_LOOK[swatch.category], message: `Finish I picked in the catalog: ${label}` } };
  }
  if (photoDescriptions[photo]) {
    const look = photoTags[photo]?.finish;
    return { picked: "a floor from our gallery", initial: { style: look ? STYLE_BY_LOOK[look] : undefined, message: `I'd like a floor like this gallery photo: ${photoDescriptions[photo]} (${photo})` } };
  }
  return null;
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const prefill = prefillFrom(await searchParams);
  const review = REVIEWS[2];
  return (
    <div className="site-shell">
      <SiteHeader homeLinks={false} />
      <main>
        <SectionShell id="contact-page">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.75fr]">
            <div>
              <SectionHeading
                eyebrow="Free on-site estimate"
                title="Book your free estimate."
                description="Four quick questions, then your name and number. Carlos gets back to you to set a time, comes out to look at the slab and measure it, and brings color samples. You get a written price before any work starts."
              />
              {prefill ? (
                <p className="mb-5 rounded-xl border border-gold-400/40 px-4 py-3 text-sm leading-relaxed text-white/85" role="status">
                  You picked {prefill.picked}. It&apos;s already in your request{prefill.initial.style ? ", so you start at the space question" : ""}.
                </p>
              ) : null}
              <ContactForm initial={prefill?.initial} />
            </div>

            <aside className="grid gap-6 self-start">
              <SurfaceCard className="p-6">
                <p className="meta-label">Rather talk it through?</p>
                <div className="meta-list mt-5">
                  <div>
                    <p className="meta-label">Call Carlos</p>
                    <a href={PHONE_HREF} className="meta-value block text-white hover:text-gold-400 transition-colors">
                      {PHONE_LABEL}
                    </a>
                    <p className="text-xs text-white/70 mt-1">Every day, 8 am to 5 pm</p>
                  </div>
                  <div className="divider-line" />
                  <div>
                    <p className="meta-label">Email</p>
                    <a
                      href={`mailto:${leadEmail}`}
                      className="meta-value block text-white hover:text-gold-400 transition-colors"
                    >
                      {leadEmail}
                    </a>
                  </div>
                  <div className="divider-line" />
                  <div>
                    <p className="meta-label">Instagram</p>
                    <a
                      href="https://www.instagram.com/goldenepoxydesigns/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meta-value flex items-center gap-2 text-white hover:text-gold-400 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                      @goldenepoxydesigns
                    </a>
                  </div>
                  <div className="divider-line" />
                  <div>
                    <p className="meta-label">Facebook</p>
                    <a
                      href="https://www.facebook.com/profile.php?id=61565026196201"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meta-value flex items-center gap-2 text-white hover:text-gold-400 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Golden Epoxy Designs
                    </a>
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-6">
                <figure className="m-0">
                  <blockquote className="m-0 text-base leading-relaxed text-white/90">{review.text}</blockquote>
                  <figcaption className="mt-4 text-sm text-white/70">
                    {review.name},{" "}
                    <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="text-gold-400 underline underline-offset-4 hover:text-white">
                      Google review
                    </a>
                  </figcaption>
                </figure>
              </SurfaceCard>

              <SurfaceCard className="p-6">
                <p className="meta-label">Where we work</p>
                <p className="meta-value mt-4">Based in Tampa. We come out to homes and businesses in:</p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2" aria-label="Communities we serve">{serviceAreaCities.map(city => <li key={city} className="text-sm text-white/85">{city}</li>)}</ul>
                <p className="mt-5 text-sm leading-relaxed text-white/70">{serviceAreaNote}</p>
                <div className="mt-6">
                  <ButtonLink href="/gallery" variant="secondary" className="sm:w-auto">
                    See floors we&apos;ve finished
                  </ButtonLink>
                </div>
              </SurfaceCard>
            </aside>
          </div>
        </SectionShell>
      </main>
      <SiteFooter homeLinks={false} />
    </div>
  );
}
