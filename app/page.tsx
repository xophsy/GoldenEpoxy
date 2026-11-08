import Image from "next/image";
import ScrollPinnedReveal from "@/components/ScrollPinnedReveal";
import {
  ButtonLink,
  SectionHeading,
  SectionShell,
  SurfaceCard,
} from "@/components/design-system";
import HeroSection from "@/components/HeroSection";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  faqs,
  flooringTypes,
  processSteps,
  services,
  type FAQ,
} from "@/data/siteContent";

function FaqAccordion({ faqs }: { faqs: FAQ[] }) {
  return (
    <div className="home-faq">
      {faqs.map((faq, i) => (
        <details key={faq.question} name="home-faq" open={i === 0}>
          <summary><span>{faq.question}</span><span className="home-faq__toggle" aria-hidden="true">+</span></summary>
          <p>{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="site-shell">
      <SiteHeader homeLinks overlayHero />
      <main className="home-compact">
      <HeroSection />

        {/* ── Flooring Systems ──── */}
      <SectionShell id="finishes" className="section-shell-compact">
          <SectionHeading
            eyebrow="Flooring Systems"
            title="Choose your finish."
          />

          <div
            className="compact-card-track" tabIndex={0} role="region" aria-label="Floor finishes"
          >
            {flooringTypes.map((floor) => (
              <div key={floor.title}>
                <div className="flooring-overlay-card group">
                  <Image
                    fill
                    src={floor.image}
                    alt={floor.title}
                    sizes="(min-width: 640px) 30vw, 90vw"
                    className="h-full w-full object-cover"
                  />
                  <div className="flooring-overlay-card__gradient" />
                  <div className="flooring-overlay-card__top-line" />
                  <div className="flooring-overlay-card__content">
                    <h3 className="text-xl font-bold tracking-[-0.025em] text-white">{floor.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/58">{floor.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        <p className="swipe-hint">Swipe to explore all three finishes</p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
          We select protective topcoats and traction options to suit your space.
        </p>
      </SectionShell>

      <ScrollPinnedReveal
        beforeImage="/legacy-images/slider/before.png"
        afterImage="/legacy-images/slider/after.png"
        imageAlt="Floor before coating"
        eyebrow="Transformation"
        title="A single scroll reveals the full transformation."
        description=""
      />

      {/* ── Services ──────────────────────────────────────────── */}
      <SectionShell id="services">
        <div>
          <SectionHeading title="Flooring for your home." />
        </div>

        <div className="compact-card-track" tabIndex={0} role="region" aria-label="Services">
          {services.map((service, i) => (
            <SurfaceCard key={service.title} className="compact-service-card">
              <div className="image-frame compact-service-photo">
                <Image fill src={service.image} alt={service.alt ?? service.title}
                  sizes="(min-width: 769px) 30vw, 85vw" className="h-full w-full object-cover" />
              </div>
              <div className="compact-service-copy">
                <p className="meta-label">{["Foundation", "Residential", "Commercial"][i]}</p>
                <h3 className="text-xl font-semibold tracking-[-0.025em]">{service.title}</h3>
                <p className="text-sm leading-6 text-white/72">{service.description}</p>
              </div>
            </SurfaceCard>
          ))}
        </div>
        <p className="swipe-hint">Swipe to explore our services</p>

      </SectionShell>

      <ReviewsCarousel />

      {/* ── Process ───────────────────────────────────────────── */}
      <SectionShell id="process">
        <div>
          <SectionHeading
            eyebrow="Process"
            title="What to expect."
          />
        </div>

        <ol className="process-timeline">
          {processSteps.map((step, i) => (
            <li key={step.title}>
              <span className="process-timeline__number" aria-hidden="true">{i + 1}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </li>
          ))}
        </ol>

      </SectionShell>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <SectionShell id="faq" className="section-shell-compact">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <SectionHeading
            eyebrow="FAQ"
            title="Common questions answered."
          />
          <FaqAccordion faqs={faqs} />
        </div>
      </SectionShell>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <SectionShell className="section-shell-compact">
        <div>
          <div className="section-cta-premium rounded-[2rem] px-6 py-8 text-center md:px-10 md:py-10">
            <p className="section-eyebrow mx-auto justify-center">Estimate</p>
            <h2 className="section-title mx-auto mt-5 max-w-xl">
              Have a project in mind?
            </h2>
            <p className="section-body mx-auto mt-5 text-center">
              Tell us about your floor and we&apos;ll take it from there.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact" className="sm:w-auto">
                Book a free estimate
              </ButtonLink>
              <ButtonLink href="tel:+18135800323" variant="secondary" className="sm:w-auto">
                Call (813) 580-0323
              </ButtonLink>
            </div>
          </div>
        </div>
      </SectionShell>

      </main>
      <SiteFooter homeLinks />
    </div>
  );
}
