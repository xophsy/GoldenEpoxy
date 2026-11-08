# Shared Layouts

These files form the shared shell used by the gallery and the other primary routes.

## app/layout.tsx

Root document layout, metadata, global fonts, and global CSS.

```tsx
import type { Metadata } from "next";
import { Geist, Space_Grotesk, Bodoni_Moda } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: {
    default: "Golden Epoxy | Premium Epoxy Flooring in Tampa Bay",
    template: "%s | Golden Epoxy",
  },
  description:
    "Golden Epoxy installs premium residential, commercial, and industrial epoxy floors across Tampa Bay. Free quotes, lifetime residential warranty, and metallic and flake finishes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${spaceGrotesk.variable} ${bodoniModa.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

## components/SiteHeader.tsx

Responsive floating navigation used across all routes.

```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink, cx } from "@/components/design-system";
import { primaryNavLinks, resolveNavHref } from "@/data/navigation";

type Props = {
  homeLinks?: boolean;
  overlayHero?: boolean;
};

export default function SiteHeader({ homeLinks = true, overlayHero = false }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(!overlayHero);
  const pathname = usePathname();
  const navLinks = primaryNavLinks.map((link) => ({
    ...link,
    href: resolveNavHref(link.href, homeLinks),
  }));

  const handleLogoClick = () => {
    setMobileOpen(false);

    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!overlayHero) return;

    const handleScroll = () => {
      const hero = document.querySelector<HTMLElement>("[data-hero='home']");

      if (!hero) {
        setScrolledPastHero(true);
        return;
      }

      const rect = hero.getBoundingClientRect();
      setScrolledPastHero(rect.bottom <= 96);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [overlayHero]);

  return (
    <>
      <header
        className={cx(
          "top-0 z-50 px-3 md:px-4",
          overlayHero ? "fixed inset-x-0 pt-3" : "sticky pt-3",
        )}
      >
        <nav
          className={cx(
            "content-shell relative flex justify-between items-center overflow-visible rounded-[1.75rem] px-4 h-[5.5rem]",
            scrolledPastHero || mobileOpen
              ? "glass border border-white/10 bg-coal-900/78 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
              : "glass border border-white/10 bg-coal-900/24 shadow-[0_12px_30px_rgba(0,0,0,0.16)]",
          )}
        >
          {/* Crown â€” absolutely anchored to nav pill, never affected by layout */}
          <div className="absolute -left-2 top-1/2 -translate-y-[28%] z-10 overflow-visible">
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 360, damping: 24, mass: 0.45 }}
              style={{ transformOrigin: "center center" }}
            >
              <Link href="/" onClick={handleLogoClick} className="block overflow-visible">
                <Image
                  src="/legacy-images/logonew.png"
                  alt="Golden Epoxy logo"
                  width={175}
                  height={175}
                  className="h-[170px] w-auto object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
                />
              </Link>
            </motion.div>
          </div>

          {/* Wordmark â€” absolutely positioned like the crown, independent of flex layout */}
          <div className="absolute left-[110px] top-1/2 -translate-y-[40%] z-10">
            <Link href="/" onClick={handleLogoClick}>
              <Image
                src="/legacy-images/logo-text.png"
                alt="Golden Epoxy"
                width={400}
                height={150}
                className="h-[115px] w-auto object-contain mix-blend-screen"
              />
            </Link>
          </div>
          {/* Spacer to push right side into position */}
          <div className="flex-1" />
          {/* Right side â€” always flex, content switches at lg */}
          <div className="flex items-center gap-8">
            {/* Desktop nav links */}
            <ul className="hidden lg:flex items-center gap-7 text-sm text-white/72">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-gold-300" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Free Quote tablet only (smâ€“lg) */}
            <div className="hidden sm:block lg:hidden">
              <ButtonLink href="/contact" className="!w-auto !min-h-0 !py-2.5 !px-5 !text-[0.65rem]">
                Free Quote
              </ButtonLink>
            </div>
            {/* Free Quote desktop */}
            <div className="hidden lg:block">
              <ButtonLink href="/contact" className="w-auto">
                Free Quote
              </ButtonLink>
            </div>
            {/* Burger â€” hidden on desktop */}
            <button
              type="button"
              className={cx(
                "button-ghost flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden",
                mobileOpen && "border-gold-300/40 bg-white/8",
              )}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>
        {mobileOpen ? (
          <div className="content-shell glass mt-3 rounded-[1.75rem] border border-white/10 bg-coal-900/86 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)] lg:hidden">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="block rounded-2xl border border-transparent px-4 py-3 text-sm text-white/78 hover:border-white/10 hover:bg-white/5"
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 px-1 sm:hidden">
              <ButtonLink href="/contact" className="w-full" onClick={() => setMobileOpen(false)}>
                Get a Free Quote
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
```

## components/SiteFooter.tsx

Shared footer with brand, navigation, contact details, and social links.

```tsx
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/design-system";
import { footerNavLinks, resolveNavHref } from "@/data/navigation";

type Props = {
  homeLinks?: boolean;
};

export default function SiteFooter({ homeLinks = true }: Props) {
  const navLinks = footerNavLinks.map((link) => ({
    ...link,
    href: resolveNavHref(link.href, homeLinks),
  }));

  return (
    <footer className="section-shell section-shell-tight border-t border-white/8 bg-black/24">
      <div className="content-shell">
        <div className="section-panel px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-8 text-left md:grid-cols-[1.4fr_0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Image
                  src="/legacy-images/logonew.png"
                  alt="Golden Epoxy logo"
                  width={64}
                  height={64}
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="max-w-md text-sm leading-7 text-white/72">
                Premium epoxy floors for homes and businesses across Tampa Bay. Clean prep,
                durable systems, and finishes that look intentional in every light.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/18135800323"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition-colors hover:border-gold-400/30 hover:text-gold-400"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/goldenepoxydesigns/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition-colors hover:border-gold-400/30 hover:text-gold-400"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61565026196201"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition-colors hover:border-gold-400/30 hover:text-gold-400"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
              <ButtonLink href="/contact" className="w-full sm:w-auto">
                Book an Estimate
              </ButtonLink>
            </div>

            <div>
              <p className="meta-label">Explore</p>
              <ul className="mt-4 space-y-3 text-sm text-white/78">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-gold-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="meta-list">
              <div>
                <p className="meta-label">Phone</p>
                <a href="tel:+18135800323" className="meta-value block text-white">
                  (813) 580-0323
                </a>
              </div>
              <div className="divider-line" />
              <div>
                <p className="meta-label">Hours</p>
                <p className="meta-value">Mon-Sun 8am-5pm</p>
              </div>
              <div className="divider-line" />
              <div>
                <p className="meta-label">Email</p>
                <a
                  href="mailto:goldenepoxyworks@gmail.com"
                  className="meta-value block text-white"
                >
                  goldenepoxyworks@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 text-center text-xs uppercase tracking-[0.22em] text-white/40">
          &copy; {new Date().getFullYear()} Golden Epoxy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

## data/navigation.ts

Shared navigation model consumed by the header and footer.

```ts
export type NavLink = {
  label: string;
  href: string;
};

export const primaryNavLinks: NavLink[] = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Catalog", href: "/catalog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const footerNavLinks: NavLink[] = [
  { label: "Services", href: "#services" },
  { label: "Before / After", href: "#before-after" },
  { label: "Process", href: "#process" },
  { label: "Catalog", href: "/catalog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function resolveNavHref(href: string, homeLinks: boolean) {
  if (!href.startsWith("#")) {
    return href;
  }

  return `${homeLinks ? "" : "/"}${href}`;
}
```


