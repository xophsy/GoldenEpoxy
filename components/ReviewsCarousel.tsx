export const GOOGLE_REVIEW_URL = "https://share.google/i1OkVsiyHWqzYPYcw";

export const REVIEWS = [
  {
    name: "Dr. Felipe Messias",
    initials: "FM",
    text: "Golden Epoxy is top-tier when it comes to epoxy flooring. They deliver high-quality, durable epoxy floor coatings. I have seen nothing but the best results, whether it be for garages, residential spaces, or commercial floors.",
    source: "Google Review",
  },
  {
    name: "Yohana Romero",
    initials: "YR",
    text: "This company is simply outstanding. From the very first interaction, their professionalism and dedication truly shine. They are the kind of team you can completely trust, always providing quick and effective solutions.",
    source: "Google Review",
  },
  {
    name: "Josue Rivera",
    initials: "JR",
    text: "Carlos and his team are the best in town. Very honest and straightforward business. They really make you feel like family and most importantly they pay attention to details which is important for this kind of work.",
    source: "Google Review",
  },

];

function StarRow() {
  return (
    <div className="reviews-carousel__stars" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="reviews-carousel__star">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
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

export default function ReviewsCarousel() {
  return (
    <section id="reviews" className="reviews-carousel-section" aria-labelledby="reviews-heading">
      <div className="content-shell">
        <div className="reviews-carousel__header">
          <p className="section-eyebrow">Reviews</p>
          <h2 id="reviews-heading" className="section-title">
            What customers are saying on Google.
          </h2>
        </div>
        <div className="reviews-carousel__grid compact-card-track" tabIndex={0} role="region" aria-label="Customer reviews">
          {REVIEWS.map((review) => (
            <figure key={review.name} className="reviews-carousel__card">
              <StarRow />
              <blockquote className="reviews-carousel__blockquote">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <figcaption className="reviews-carousel__author">
                <div className="reviews-carousel__initials" aria-hidden="true">
                  {review.initials}
                </div>
                <div>
                  <p className="reviews-carousel__name">{review.name}</p>
                  <div className="reviews-carousel__source">
                    <GoogleIcon />
                    <span>{review.source}</span>
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="swipe-hint">Swipe to read all three reviews</p>
        <div className="reviews-carousel__cta">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noreferrer"
            className="reviews-carousel__cta-link"
          >
            <GoogleIcon />
            <span>See all reviews on Google</span>
          </a>
        </div>
      </div>
    </section>
  );
}
