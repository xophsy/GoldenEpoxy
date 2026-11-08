# Golden Epoxy Design System

## Product context

Golden Epoxy is a premium epoxy-flooring installer serving homes and businesses across Tampa Bay. The website’s primary jobs are to demonstrate workmanship, build trust, explain available systems, and convert visitors into estimate requests.

Primary routes:

- Home: positioning, services, process, proof, reviews, service area, and conversion.
- Gallery: visual proof through 55 real installation photographs and an accessible full-resolution lightbox.
- Catalog: finish exploration by category.
- Contact: estimate request and direct contact information.

## Audience and jobs to be done

- Homeowners comparing garage, patio, interior, or outdoor floor upgrades.
- Business owners evaluating durable and polished commercial flooring.
- Visitors need to quickly judge workmanship, see enough relevant examples, understand that the work is real, and reach the estimate path without feeling overwhelmed.
- Gallery users must browse efficiently on touch devices, inspect images at full resolution, and return to their browsing position.

## Brand principles

- Confident, clean, premium, and credible.
- Photographs carry the experience; interface decoration remains restrained.
- Gold is an accent and interaction signal, not a large background color.
- Avoid invented project names, locations, finish classifications, statistics, or installation claims.
- Preserve an authentic owner/crew presence rather than making the company feel anonymous.

## Color

Use only the existing coal, white, and gold palette.

- Page background: `#080808` to `#0f0f10` vertical gradient.
- Primary text: `#f7f7f7`.
- Muted text: `rgba(247,247,247,.72)`.
- Soft text: `rgba(247,247,247,.56)`.
- Gold primary: `#f4b400`.
- Gold bright: `#ffd65b`.
- Gold deep: `#a87300`.
- Surface: `rgba(255,255,255,.06)`.
- Strong surface: `rgba(255,255,255,.1)`.
- Surface border: `rgba(255,255,255,.1)`.
- Emphasis border: `rgba(255,214,91,.2)`.

Do not introduce blue, purple, red, neon, pastel, or multicolor gradients.

## Typography

- Body and controls: Geist.
- Headings and display copy: Space Grotesk.
- Bodoni Moda 600 italic may be used only for rare editorial emphasis already supported by the site.
- Headings use compact line height, bold weight, and slightly negative tracking.
- Eyebrows and action labels use uppercase, small sizing, and wide tracking.
- Supporting copy uses generous line height and muted white.

Do not introduce any additional font family.

## Spacing and layout

- Maximum content width: `74rem`.
- Page gutter: `clamp(1.25rem, 2vw, 2rem)`.
- Section spacing: `clamp(3rem, 5.5vw, 4.5rem)`.
- Stack gap: `clamp(1.25rem, 3vw, 2rem)`.
- Minimum interactive touch target: 44 by 44 px.
- Core breakpoints: 480, 640, 768, 1024, and 1100 px.
- Rounded shapes use 1rem, 1.5rem, and 2rem radii.
- Depth comes from black shadows, translucent borders, and very subtle gold focus glow.

## Shared shell

- Keep the existing floating rounded navigation with real Golden Epoxy brand marks.
- Desktop navigation shows Services, Process, Catalog, Gallery, Contact, and Free Quote.
- Mobile navigation uses the compact menu trigger.
- Keep the shared footer’s brand, navigation, social, and contact structure.

## Gallery ground truth

- Keep the existing owner-led header composition and the exact heading “Work we stand behind.”
- Keep the current descriptive copy and “View Our Work” action.
- Keep all 55 real images and their existing relative order.
- Keep the natural-aspect-ratio masonry layout: one column on mobile, two on tablet, and three on desktop.
- Keep responsive AVIF/WebP loading, image dimensions, lazy loading, entrance motion, reduced-motion support, and full-resolution lightbox assets.
- Keep keyboard navigation, focus trapping, scroll locking, click-away closing, and previous/next/close controls.
- Do not recreate the rejected editorial grid or introduce featured-card reordering.

## Gallery improvement space

Design branches may explore only contained usability refinements:

- Progressive disclosure that initially shows a useful subset while preserving access to all 55 photographs.
- Clear “showing X of 55” wayfinding.
- Stronger touch target for “View Our Work.”
- Quieter card overlays with less repetitive copy.
- Subtle count or affordance that does not compete with photography.
- Improved lightbox control sizing, counter legibility, image breathing room, and focus return.
- Optional back-to-top or gallery progress affordance when it remains visually quiet.

## Motion

- Standard transition: `220ms cubic-bezier(0.22,1,0.36,1)`.
- Entrances may use small opacity, vertical translation, and scale changes.
- Image hover may use restrained scale and saturation changes.
- Avoid continuous decorative motion except the existing subtle scroll indicator.
- Under `prefers-reduced-motion: reduce`, motion duration collapses and smooth scrolling is disabled.

## Accessibility and responsive behavior

- Focus-visible uses a 2px gold outline with 3px offset.
- Controls need descriptive accessible names.
- Card images nested inside labelled buttons may use empty alt text; full-size lightbox images need useful position-based descriptions when no factual project metadata exists.
- Dialog focus must remain trapped and return to the originating card when closed.
- Mobile controls must remain reachable around tall and wide photographs.
- Do not rely on hover to communicate required actions.

## Design branch goals

1. A minimal “Masonry Refined” direction: visually almost identical to the current page, with progressive disclosure, better controls, and quieter overlays.
2. A “Project Browse” direction: still masonry and in the same brand, but with a compact count/progress utility row and stronger mobile wayfinding.

Every design must use only the fonts, colors, spacing, and component styles defined here and in the repository theme. Do not introduce any fonts, colors, or unrelated visual styles.


## Catalog, gallery, and About refresh — 2026-10-07

- Scope: refresh /catalog and /gallery; create /about; connect header/footer navigation. Agent-selected direction is provisional for visual feedback.
- Inspected Atelier Noir thumbnail and live local preview: adapt fine rules, asymmetric introduction, and restrained italic emphasis to existing coal/gold palette and Bodoni font. Phantom thumbnail supports quiet, left-aligned content. No reference code or assets copied.
- Catalog: three collection previews, 74 existing swatches, category controls, collection-scoped name/number search, named full-size lightbox, physical sample guidance.
- Gallery: retain exact headline, owner photo, copy, all 55 photos in manifest order, natural masonry. Show 12 initially; load 12 more per action. Quiet overlays, count row, quote/catalog actions.
- About: existing owner photo, preparation-first story, existing process steps; no invented biography or credentials.
- Sources: components/collection-pages.module.css; app/about/page.tsx; catalog/gallery routes; CatalogGrid; GalleryGrid; data/navigation.ts.
- Checkpoint: desktop/tablet/phone 1440/768/390 render checks passed without overflow, broken images, or browser errors. Category/search/empty state, both lightboxes, focus return, 55-photo access, reduced motion, mobile About navigation passed. TypeScript and targeted ESLint passed. Final desktop/mobile screenshots inspected; masonry focus outline and 44px lightbox controls verified. Ready for user review at http://localhost:3010/catalog, /gallery, and /about. Not deployed.

### Gallery feedback — 2026-10-08
- Remove owner portrait and caption from gallery header; keep portrait on About Us. Header now pairs headline with introduction.
- Exclude img-6258 (selected preparation photo) from public gallery and lightbox, preserving source assets. Public count is now 54; remaining order is unchanged.

### Typography consistency feedback — 2026-10-08
- User rejected gold italic serif headings as inconsistent with Services. Catalog/gallery/About headings now use Services typography: Space Grotesk, weight 800, foreground white, compact line height and tracking. Page titles remain larger for hierarchy; gold stays on supporting labels and controls. This supersedes the provisional serif-emphasis direction.

### Approved mobile showroom gallery — 2026-10-08
- Goal: dramatic photo browsing on iPhone Safari and Android Chrome; user approved showroom plus collage. This supersedes the earlier masonry gallery direction only.
- Appearance: existing coal/white/gold palette and Space Grotesk headings; short introduction, blue floor opening image, six curated highlights, numbered thumbnail strip, varied photo tiles. Forty live catalog preview informed alternating tile scale; Phantom thumbnail informed the quiet introduction. No reference code or imagery copied.
- Files: GalleryGrid.tsx and GalleryGrid.module.css implement the experience; data/gallery-editorial.ts stores stable photo slugs, selected crop positions and factual visual descriptions independently of the generator.
- Preserve all source assets and img-6258 exclusion: 55 source images, 54 publicly browsable. Keep original collection order, 12-photo batches, navigation and quote/catalog links.
- PhotoSwipe replaces the custom viewer: full uncropped images, pinch/button zoom, swipe/arrow navigation, labelled modal, explicit Tab cycle, Safari-safe trigger focus return and restored scroll. No autoplay; reduced motion honored.
- Mobile: native horizontal thumbnail scrolling, visible 44px+ controls, safe-area-aware viewer controls, 1 column below 360px, 2 through tablet, 3 on desktop. Images retain reserved space; preview and viewer failures have readable recovery states.
- Verification: production build, TypeScript, targeted ESLint and gallery asset verification passed. Chromium and WebKit checks passed at 320/390/768/1440: overflow, photo selection, all 54 photos, wraparound, keyboard/zoom, focus/scroll restoration, reduced motion and landscape controls. Delayed/failed requests passed in both engines. Chromium CDP touch verified thumbnail scrolling, swipe and pinch zoom; WebKit swipe used synthetic touch-pointer events. Physical devices have not been tested.
- Preview: http://localhost:3011/gallery (local production server). QA scripts, JSON evidence and screenshots: C:/Users/xophs/Documents/ChatGPT/Websites/showroom-* and verify-showroom*.cjs. No deployment.
- Final visual refinement: constrained the wide desktop tile to 5:3 after detecting that its portrait source inflated the first grid row. Corrected desktop and phone collage screenshots inspected; production gallery and viewer smoke checks passed again in both engines. Ready for review.

### About service coverage and quote flow — 2026-10-08
- Implemented approved service section immediately after the About introduction; retained owner portrait, story, process and brand. Closing action now prioritizes a quote with gallery secondary.
- Shared approved coverage in data/service-area.ts: Tampa, Brandon, Riverview, Lutz, Wesley Chapel, Clearwater and St. Petersburg; About and Contact render the same list and outside-area invitation.
- Inspected public/service-area-map.png: its radius extends toward Spring Hill/Lakeland, so omitted it from Contact and used the accurate town list on both pages. Source asset preserved. No public travel-time guarantee or eligibility rejection.
- Optional Project city or ZIP code field added to existing final contact step. API accepts missing location, trims/limits it to 100 characters and escapes HTML; business email HTML/text and mailto fallback include it. Existing submission/spam handling retained.
- Validation passed: targeted ESLint and production build; mocked route tests for older payloads, city, ZIP, whitespace, HTML escaping and length cap. No real test emails sent.
- Chromium and WebKit: About/Contact at 390/768/1440 have no horizontal overflow; shared city lists, quote navigation, phone URL, optional field, outgoing form payload and failure mailto draft verified. Final isolated-page run had no page errors. Initial reused WebKit navigation/font-loading waits were unstable; functional checks used fresh pages and DOM readiness. Existing screenshots inspected on desktop and mobile.
- Evidence: scripts/verify-lead-location.cjs; C:/Users/xophs/Documents/ChatGPT/Websites/verify-service-area.cjs, service-area-qa.json and service-area-*.png. Local preview refreshed at http://localhost:3011/about. No deployment; physical devices and conversion improvement remain unverified.
