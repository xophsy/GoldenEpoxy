import type { Metadata } from "next";
import Image from "next/image";
import { FACEBOOK_REVIEW_URL, GOOGLE_WRITE_REVIEW_URL } from "@/components/ReviewsCarousel";
import { PHONE_HREF, PHONE_LABEL } from "@/components/NextStep";

// A page sent to finished customers by text or email. Kept out of search results and the site menu.
export const metadata: Metadata = {
  title: "Leave a review",
  description: "Thanks for choosing Golden Epoxy. Leave a quick review on Google or Facebook.",
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden px-4 py-12">
      <picture className="absolute inset-0 -z-10">
        <source type="image/avif" srcSet="/gallery/generated/img-7280/768.avif 768w, /gallery/generated/img-7280/1440.avif 1440w" sizes="100vw" />
        <img src="/gallery/generated/img-7280/1080.webp" alt="" className="h-full w-full object-cover object-[50%_62%]" />
      </picture>
      <div className="absolute inset-0 -z-10 bg-black/75" aria-hidden="true" />

      <div className="w-full max-w-md text-center">
        <Image src="/goldenepoxy-crown-v6-still.png" alt="Golden Epoxy" width={240} height={240} priority
          className="mx-auto h-32 w-auto" />

        <h1 className="mt-6 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold leading-tight tracking-[-0.01em] text-white sm:text-4xl">
          Thanks for trusting us with your floor.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/85">
          We&apos;re a small local business, and your review helps other Tampa Bay homeowners find us. It takes about a minute.
        </p>

        <div className="mt-8 grid gap-3">
          <a href={GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
            className="button-base button-primary !min-h-14 w-full !text-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.06-1.06-.14-1.51z" />
            </svg>
            Review us on Google
          </a>
          <a href={FACEBOOK_REVIEW_URL} target="_blank" rel="noopener noreferrer"
            className="button-base button-secondary !min-h-14 w-full !text-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Recommend us on Facebook
          </a>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-white/75">
          Tip: say which town you&apos;re in and the floor you got.
        </p>
        <p className="mt-8 text-sm text-white/70">
          Something not right with your floor? Call Carlos first:{" "}
          <a href={PHONE_HREF} className="whitespace-nowrap text-gold-400 underline underline-offset-4 hover:text-white">{PHONE_LABEL}</a>
        </p>
      </div>
    </main>
  );
}
