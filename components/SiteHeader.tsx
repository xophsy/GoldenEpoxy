"use client";

import Image from "next/image";
import CrownLogo from "@/components/CrownLogo";
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
  const splitAt = Math.ceil(navLinks.length / 2);

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
          "site-header top-0 z-50 px-3 md:px-4",
          overlayHero ? "fixed inset-x-0 pt-3" : "sticky pt-3",
        )}
      >
        <nav
          className={cx(
            "site-header__nav content-shell relative flex justify-between items-center overflow-visible rounded-[1.75rem] px-4 h-[5.5rem]",
            scrolledPastHero || mobileOpen
              ? "glass border border-white/10 bg-coal-900/78 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
              : "glass border border-white/10 bg-coal-900/24 shadow-[0_12px_30px_rgba(0,0,0,0.16)]",
          )}
        >
          {/* Crown — absolutely anchored to nav pill, never affected by layout */}
          {/* The rim's lowest point is 54% down the image: bottom-0 plus a 46% shift puts it on the
              bar's bottom edge at any size, so the crown rests on the bar and only the drips hang below. */}
          <div className="site-header__crown absolute -left-2 bottom-0 translate-y-[46%] z-10 overflow-visible">
            <div>
              <Link href="/" onClick={handleLogoClick} className="block overflow-visible">
                <CrownLogo />
              </Link>
            </div>
          </div>

          {/* Wordmark — absolutely centered in the bar, independent of flex layout */}
          <div className="site-header__wordmark absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link href="/" onClick={handleLogoClick}>
              <Image
                src="/goldenepoxy-wordmark-v5.png"
                alt="Golden Epoxy"
                width={206}
                height={54}
                className="h-[54px] w-auto object-contain"
              />
            </Link>
          </div>
          {/* Desktop: the links split around the centered wordmark. This half is exactly 50% (padding
              included), so the seam with the right half is the bar's center; padding clears the crown and wordmark. */}
          <ul className="hidden xl:flex basis-1/2 shrink-0 items-center justify-center gap-7 pl-[184px] pr-[128px] text-sm text-white/72">
            {navLinks.slice(0, splitAt).map((link) => (
              <li key={link.href}>
                <Link className="hover:text-gold-300" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Right half — always flex, content switches at xl */}
          <div className="site-header__actions relative z-20 flex flex-1 items-center justify-end gap-8">
            <ul className="hidden xl:flex flex-1 items-center justify-center gap-7 pl-[128px] text-sm text-white/72">
              {navLinks.slice(splitAt).map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-gold-300" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Free Quote tablet only (sm–lg) */}
            <div className="hidden sm:block xl:hidden">
              <ButtonLink href="/contact" className="!w-auto !min-h-0 !py-2.5 !px-5 !text-[0.65rem]">
                Free Quote
              </ButtonLink>
            </div>
            {/* Free Quote desktop */}
            <div className="hidden xl:block">
              <ButtonLink href="/contact" className="w-auto">
                Free Quote
              </ButtonLink>
            </div>
            {/* Burger — hidden on desktop */}
            <button
              type="button"
              className={cx(
                "button-ghost flex h-11 w-11 items-center justify-center rounded-2xl xl:hidden",
                mobileOpen && "border-gold-300/40 bg-white/8",
              )}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>
        {mobileOpen ? (
          <div id="site-mobile-menu" className="site-header__menu content-shell glass mt-3 rounded-[1.75rem] border border-white/10 bg-coal-900/86 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)] xl:hidden">
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
