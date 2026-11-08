# Shared UI Components

Framework: React 19 with Next.js 16 App Router. Styling uses Tailwind CSS 4 utilities plus global custom CSS. The project uses custom components rather than a third-party component library.

## design-system

- Source: `components/design-system.tsx`
- Description: Shared class combiner, button/link primitives, section shells, and labels.

```tsx
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ClassValue = string | false | null | undefined;

export function cx(...values: ClassValue[]) {
  return values.filter(Boolean).join(" ");
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cx(
        "button-base",
        variant === "primary" ? "button-primary" : "button-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

type SectionShellProps = {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
};

export function SectionShell({
  id,
  className,
  containerClassName,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className={cx("section-shell section", className)}>
      <div className={cx("content-shell", containerClassName)}>{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  actions?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  actions,
}: SectionHeadingProps) {
  return (
    <div
      className={cx(
        "section-heading",
        align === "center" && "section-heading-center",
        className,
      )}
    >
      <div className="section-heading-copy">
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-body">{description}</p> : null}
      </div>
      {actions ? <div className="section-heading-actions">{actions}</div> : null}
    </div>
  );
}

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return <article className={cx("surface-card", className)}>{children}</article>;
}

export const motionPresets = {
  section: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  },
  card: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  },
  stagger: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  },
  viewport: { once: true, amount: 0.25 },
} as const;
```

## SpotlightCard

- Source: `components/SpotlightCard.tsx`
- Description: Reusable interactive spotlight surface.

```tsx
"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { cx } from "@/components/design-system";

type Props = {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
};

export default function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 214, 91, 0.13)",
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cx("surface-card", className)}
    >
      {/* Spotlight layer â€” inline position overrides surface-card > * { position: relative } */}
      <div
        className="pointer-events-none inset-0 z-[3] rounded-[inherit] transition-opacity duration-300"
        style={{
          position: "absolute",
          opacity,
          background: `radial-gradient(480px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 45%)`,
        }}
        aria-hidden
      />
      {children}
    </div>
  );
}
```

## ParallaxImage

- Source: `components/ParallaxImage.tsx`
- Description: Reusable image primitive with pointer and scroll parallax.

```tsx
"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = Omit<ImageProps, "fill"> & {
  maxTranslateY?: number;
};

const PARALLAX_OVERFLOW_PX = 40;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function isLowPerformanceDevice() {
  if (typeof window === "undefined") return true;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return true;

  if (nav.connection?.saveData) return true;

  const deviceMemory = nav.deviceMemory;
  if (typeof deviceMemory === "number" && deviceMemory <= 4) return true;

  if (nav.hardwareConcurrency <= 4) return true;

  return false;
}

export default function ParallaxImage({
  maxTranslateY = 40,
  alt,
  className,
  style,
  ...props
}: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return !isLowPerformanceDevice();
  });
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;

    const updatePosition = () => {
      frame = 0;

      if (!frameRef.current) return;

      const rect = frameRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = clamp01((viewportHeight - rect.top) / (viewportHeight + rect.height));

      setTranslateY(-maxTranslateY * progress);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePosition);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [enabled, maxTranslateY]);

  return (
    <div
      ref={frameRef}
      className="absolute inset-x-0 top-0 overflow-hidden"
      style={{ bottom: `-${PARALLAX_OVERFLOW_PX}px` }}
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
        }}
      >
        <Image
          {...props}
          fill
          alt={alt}
          className={className}
          style={style}
        />
      </div>
    </div>
  );
}
```

## ReviewsMarquee

- Source: `components/ReviewsMarquee.tsx`
- Description: Reusable testimonial marquee pattern.

```tsx
"use client";

import { motion } from "framer-motion";

type Review = {
  name: string;
  text: string;
  source: string;
  href: string;
  stars?: number;
};

const GOOGLE_REVIEW_URL = "https://share.google/i1OkVsiyHWqzYPYcw";

const REVIEWS: Review[] = [
  {
    name: "CalimeÃ±o P",
    stars: 5,
    text: "Quality of work is the best and price-wise it is the best.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Dr. Felipe Messias",
    stars: 5,
    text: "Golden Epoxy is top-tier when it comes to epoxy flooring. They deliver high-quality, durable epoxy floor coatings. I have seen nothing but the best results, whether it be for garages, residential spaces, or commercial floors.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Coach Annalee",
    stars: 5,
    text: "Carlos is very professional and trustworthy. He knows what he is doing and works hard to make sure the job is done very well. I definitely recommend him for your next project.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Gerardo Dominguez (GDominguez)",
    stars: 5,
    text: "Very professional and great to work with.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Luz Ospina",
    stars: 5,
    text: "Golden Epoxy is an excellent company. He performed work in my family business office. The floor was more than shiny. The personnel are very professional and work in a timely manner.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Jay Miller",
    stars: 5,
    text: "Good guy nice work gonna use his services highly recommend.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Bryant Osorno",
    stars: 5,
    text: "They did a wonderful job and exceeded my expectations.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Fabio Gomez",
    stars: 5,
    text: "Very professional, reliable and competitive pricing on his services. Strongly recommend this company for future projects.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "josue rivera",
    stars: 5,
    text: "Carlos and his team are the best in town. Very honest and straightforward business. They really make you feel like family and most importantly they pay attention to details which is important for this kind of work.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Yohana Romero",
    stars: 5,
    text: "This company is simply outstanding. From the very first interaction, their professionalism and dedication truly shine. They are the kind of team you can completely trust, always providing quick and effective solutions.",
    source: "Google Review",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "John Maury Muneton",
    stars: 5,
    text: "Excellent work, very professional.",
    source: "Google Review (Translated)",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Walter Sossa",
    stars: 5,
    text: "Excellent service, a very professional and reliable person, and good prices.",
    source: "Google Review (Translated)",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Oscar Mora",
    stars: 5,
    text: "Excellent service, punctuality and good work.",
    source: "Google Review (Translated)",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "NoÃ© Osorio",
    stars: 5,
    text: "This is a completely reliable company, with very high quality finishes; more than enough reasons to consider them for your projects.",
    source: "Google Review (Translated)",
    href: GOOGLE_REVIEW_URL,
  },
  {
    name: "Carlos Alberto Martinez Martinez",
    stars: 5,
    text: "Top-quality work. Very responsible, professional, and with excellent customer service. Their experience and commitment to every detail are evident. I will definitely work with them again and highly recommend them.",
    source: "Google Review (Translated)",
    href: GOOGLE_REVIEW_URL,
  },
];

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
      <path d="M6.5 0l1.59 4.89H13L8.94 7.91 10.53 13 6.5 9.98 2.47 13l1.59-5.09L0 4.89h4.91z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const stars = review.stars ?? 5;

  return (
    <a
      className="reviews-card"
      href={review.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${review.name} Google review`}
    >
      <div className="reviews-card__stars" aria-label={`${stars} out of 5 stars`}>
        {Array.from({ length: stars }).map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>

      <p className="reviews-card__text">&ldquo;{review.text}&rdquo;</p>

      <div className="reviews-card__footer">
        <div className="reviews-card__avatar" aria-hidden="true">
          {review.name[0]}
        </div>
        <div>
          <p className="reviews-card__name">{review.name}</p>
          <div className="reviews-card__source">
            <GoogleIcon />
            <span>{review.source}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function ReviewsMarquee() {
  const track = [...REVIEWS, ...REVIEWS];

  return (
    <section className="reviews-section">
      <div className="content-shell">
        <motion.div
          className="reviews-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-eyebrow">Reviews</p>
          <h2 className="section-title reviews-heading__title">
            What customers are saying on Google.
          </h2>
        </motion.div>
      </div>

      <div className="reviews-marquee-wrap" aria-label="Customer reviews">
        <div className="reviews-marquee">
          <div className="reviews-marquee__track">
            {track.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </div>

        <div className="reviews-marquee__fade reviews-marquee__fade--left" aria-hidden />
        <div className="reviews-marquee__fade reviews-marquee__fade--right" aria-hidden />
      </div>
    </section>
  );
}
```


