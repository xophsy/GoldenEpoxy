# Page Dependency Trees

The trees below trace local UI and data imports. Framework and third-party packages are intentionally omitted.

## / (Home)

Entry: `app/page.tsx`

Dependencies:

- `app/page.tsx`
  - `components/ParallaxImage.tsx`
  - `components/ScrollPinnedReveal.tsx`
  - `components/SpotlightCard.tsx`
    - `components/design-system.tsx`
  - `components/design-system.tsx`
  - `components/HeroSection.tsx`
    - `components/design-system.tsx`
  - `components/ReviewsCarousel.tsx`
  - `components/SiteFooter.tsx`
    - `components/design-system.tsx`
    - `data/navigation.ts`
  - `components/SiteHeader.tsx`
    - `components/design-system.tsx`
    - `data/navigation.ts`
  - `data/site.ts`
- Shared shell: `app/layout.tsx`
- Shared styling: `app/globals.css`

## /gallery

Entry: `app/gallery/page.tsx`

Dependencies:

- `app/gallery/page.tsx`
  - `components/GalleryGrid.tsx`
    - `lib/gallery.ts`
      - `data/gallery-manifest.json`
  - `components/SiteHeader.tsx`
    - `components/design-system.tsx`
    - `data/navigation.ts`
  - `components/SiteFooter.tsx`
    - `components/design-system.tsx`
    - `data/navigation.ts`
- Shared shell: `app/layout.tsx`
- Shared styling: `app/globals.css`

Actual render branch: the page renders one responsive hero containing the Gallery eyebrow, “Work we stand behind.” heading, descriptive copy, an in-page scroll action, and the owner photograph. It then renders `GalleryGrid`, whose live 55-image state is a natural-aspect-ratio masonry feed with an accessible full-resolution lightbox.

## /catalog

Entry: `app/catalog/page.tsx`

Dependencies:

- `app/catalog/page.tsx`
  - `components/CatalogGrid.tsx`
    - `lib/catalog.ts`
      - `data/catalog-manifest.json`
  - `components/design-system.tsx`
  - `components/SiteHeader.tsx`
    - `components/design-system.tsx`
    - `data/navigation.ts`
  - `components/SiteFooter.tsx`
    - `components/design-system.tsx`
    - `data/navigation.ts`
  - `lib/catalog.ts`
    - `data/catalog-manifest.json`
- Shared shell: `app/layout.tsx`
- Shared styling: `app/globals.css`

## /contact

Entry: `app/contact/page.tsx`

Dependencies:

- `app/contact/page.tsx`
  - `components/ContactForm.tsx`
    - `components/design-system.tsx`
  - `components/design-system.tsx`
  - `components/SiteHeader.tsx`
    - `components/design-system.tsx`
    - `data/navigation.ts`
  - `components/SiteFooter.tsx`
    - `components/design-system.tsx`
    - `data/navigation.ts`
- Shared shell: `app/layout.tsx`
- Shared styling: `app/globals.css`

