# Route Map

The application uses the Next.js 16 App Router. Every route is wrapped by `app/layout.tsx`, imports `app/globals.css`, and uses the shared floating `SiteHeader` and `SiteFooter` where applicable.

| URL | Route file | Shared layout | Summary |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `app/layout.tsx` | Marketing homepage with hero, services, process, project examples, before/after interaction, reviews, service area, and contact CTA. |
| `/catalog` | `app/catalog/page.tsx` | `app/layout.tsx` | Finish catalog with category filters, responsive swatches, and an accessible image lightbox. |
| `/gallery` | `app/gallery/page.tsx` | `app/layout.tsx` | Gallery hero followed by a responsive one/two/three-column masonry portfolio and full-resolution lightbox. |
| `/contact` | `app/contact/page.tsx` | `app/layout.tsx` | Estimate request page with contact details, project imagery, and EmailJS-backed form. |

## Route behavior

- Header links resolve section anchors to the homepage when the current route is not `/`.
- The gallery page is a client-rendered page because its hero uses Framer Motion and its CTA scrolls to the gallery grid.
- Gallery and catalog content are generated from JSON manifests and loaded through `lib/gallery.ts` and `lib/catalog.ts`.
- There is no custom router configuration; filesystem routing is authoritative.

