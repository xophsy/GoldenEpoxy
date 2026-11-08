# Extractable Superdesign Components

## Layout components

### SiteHeader

- Source: `components/SiteHeader.tsx`
- Category: layout
- Description: Floating rounded navigation shell with paired brand marks, desktop links, free-quote CTA, and responsive mobile menu.
- Extractable props: `homeLinks` (boolean, default: `true`)
- Hardcoded: Golden Epoxy logo assets, navigation labels, menu icon geometry, component classes, and motion behavior.

### SiteFooter

- Source: `components/SiteFooter.tsx`
- Category: layout
- Description: Shared footer with company positioning, social links, estimate CTA, exploration links, phone, hours, and email.
- Extractable props: `homeLinks` (boolean, default: `true`)
- Hardcoded: Logo, business copy, social destinations, contact details, labels, and CSS classes.

## Basic components

### ButtonLink

- Source: `components/design-system.tsx`
- Category: basic
- Description: Rounded uppercase navigation/action link with primary, secondary, or ghost visual variants.
- Extractable props: `href` (string), `variant` (string, default: `primary`)
- Hardcoded: Base geometry, typography, motion classes, and brand color styles.

### SectionShell

- Source: `components/design-system.tsx`
- Category: basic
- Description: Shared content-width and vertical-section wrapper.
- Extractable props: `id` (string), `className` (string)
- Hardcoded: Section and content-shell CSS structure.

### SectionLabel

- Source: `components/design-system.tsx`
- Category: basic
- Description: Small uppercase gold eyebrow label used above headings.
- Extractable props: none
- Hardcoded: Typography and brand-accent classes.

### SpotlightCard

- Source: `components/SpotlightCard.tsx`
- Category: basic
- Description: Dark surface card with pointer-following radial highlight.
- Extractable props: `as` (string, default: `article`), `className` (string)
- Hardcoded: Spotlight gradient mechanics and CSS interaction pattern.

### ParallaxImage

- Source: `components/ParallaxImage.tsx`
- Category: basic
- Description: Responsive image frame with bounded scroll and pointer parallax.
- Extractable props: image source, alt text, dimensions, `className`, `strength`, and `priority`
- Hardcoded: Motion implementation, image sizing behavior, and reduced-motion safeguards.

## Page-specific patterns not extracted

- `GalleryGrid` and its lightbox are specific to the gallery route and should be passed directly as draft context.
- `CatalogGrid` has similar lightbox mechanics but different filtering and data behavior.
- Hero, review, contact-form, and before/after components carry page-specific content and should remain inline design context rather than shared DraftComponents.

