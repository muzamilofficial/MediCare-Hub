'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  Clock,
  Menu,
  X,
  HeartPulse,
  CalendarCheck,
  MessageCircle,
} from 'lucide-react';
import { clinicConfig, getClinicName, getWhatsAppUrl } from '@/config/clinic';
import { isRtlLocale, type Locale } from '@/i18n/routing';

interface HeaderProps {
  locale: Locale;
  labels: {
    skipToContent: string;
    home: string;
    about: string;
    services: string;
    doctors: string;
    appointment: string;
    gallery: string;
    healthTips: string;
    contact: string;
    bookAppointment: string;
    callNow: string;
    whatsappUs: string;
  };
}

export function Header({ locale, labels }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const isRtl = isRtlLocale(locale);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Remember language choice in localStorage (Section 5)
  useEffect(() => {
    try {
      localStorage.setItem('medicare_locale', locale);
    } catch {
      // Ignore storage errors in restricted privacy modes
    }
  }, [locale]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape and trap Tab focus inside drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems = [
    { href: `/${locale}`, label: labels.home, exact: true },
    { href: `/${locale}/about`, label: labels.about },
    { href: `/${locale}/services`, label: labels.services },
    { href: `/${locale}/doctors`, label: labels.doctors },
    { href: `/${locale}/appointment`, label: labels.appointment },
    { href: `/${locale}/gallery`, label: labels.gallery },
    { href: `/${locale}/health-tips`, label: labels.healthTips },
    { href: `/${locale}/contact`, label: labels.contact },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href || pathname === `${href}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const switchLocale = (targetLocale: Locale) => {
    try {
      localStorage.setItem('medicare_locale', targetLocale);
    } catch {
      // ignore
    }
    if (!pathname) {
      router.push(`/${targetLocale}`);
      return;
    }
    const segments = pathname.split('/');
    if (segments.length > 1 && ['en', 'ur', 'sd'].includes(segments[1])) {
      segments[1] = targetLocale;
      const newPath = segments.join('/') || `/${targetLocale}`;
      const query = typeof window !== 'undefined' ? window.location.search : '';
      router.push(`${newPath}${query}`);
    } else {
      router.push(`/${targetLocale}`);
    }
  };

  const clinicDisplayName = getClinicName(locale);
  const timingsText =
    clinicConfig.timings.summary[locale as keyof typeof clinicConfig.timings.summary] ||
    clinicConfig.timings.summary.en;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2.5 focus:rounded-btn focus:shadow-lg"
      >
        {labels.skipToContent}
      </a>

      {/* Top thin bar: 36px height, teal background, hidden on mobile (Section 6) */}
      <div className="hidden lg:block bg-primary text-white h-[36px] text-xs font-medium">
        <div className="container-clinic h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${clinicConfig.phoneClean}`}
              className="inline-flex items-center gap-1.5 hover:underline"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{clinicConfig.phone}</span>
            </a>
            <a
              href={`mailto:${clinicConfig.email}`}
              className="inline-flex items-center gap-1.5 hover:underline"
              dir="ltr"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{clinicConfig.email}</span>
            </a>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{timingsText}</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
          isScrolled ? 'shadow-header border-b border-surface-border/70' : 'border-b border-surface-border'
        }`}
      >
        <div className="container-clinic h-[74px] flex items-center justify-between gap-3">
          {/* Left: Logo + Clinic Name */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label={clinicDisplayName}
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-secondary leading-tight">
                {clinicDisplayName}
              </span>
              <span className="text-[11px] text-primary font-medium hidden sm:inline leading-tight">
                {clinicConfig.city[locale]}
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center gap-1 2xl:gap-2"
          >
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                    active
                      ? 'text-primary bg-primary-light font-semibold'
                      : 'text-text-primary hover:text-primary hover:bg-surface-soft'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Language Switcher + Book Appointment CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div
              role="group"
              aria-label="Language Switcher"
              className="inline-flex items-center rounded-lg border border-surface-border bg-surface-soft p-1 text-xs font-semibold"
            >
              <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`min-h-[34px] px-2.5 rounded-md transition-colors ${
                  locale === 'en'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-pressed={locale === 'en'}
              >
                EN
              </button>
              <span className="text-surface-border px-0.5" aria-hidden="true">
                |
              </span>
              <button
                type="button"
                onClick={() => switchLocale('ur')}
                className={`min-h-[34px] px-2.5 rounded-md transition-colors font-urdu ${
                  locale === 'ur'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-pressed={locale === 'ur'}
              >
                اردو
              </button>
              <span className="text-surface-border px-0.5" aria-hidden="true">
                |
              </span>
              <button
                type="button"
                onClick={() => switchLocale('sd')}
                className={`min-h-[34px] px-2.5 rounded-md transition-colors font-sindhi ${
                  locale === 'sd'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-pressed={locale === 'sd'}
              >
                سنڌي
              </button>
            </div>

            <Link href={`/${locale}/appointment`} className="btn-accent !px-5 !min-h-[44px]">
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>{labels.bookAppointment}</span>
            </Link>
          </div>

          {/* Mobile Controls: Compact Language Switcher + Hamburger */}
          <div className="flex xl:hidden items-center gap-2">
            <div className="flex lg:hidden items-center rounded-lg border border-surface-border bg-surface-soft p-0.5 text-xs font-semibold">
              {(['en', 'ur', 'sd'] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => switchLocale(loc)}
                  className={`min-h-[36px] min-w-[36px] px-2 rounded-md transition-colors ${
                    locale === loc
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {loc === 'en' ? 'EN' : loc === 'ur' ? 'اردو' : 'سنڌي'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-surface-border text-secondary hover:bg-surface-soft"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Height Slide-in Drawer (Section 6) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="fixed inset-0 bg-secondary/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            className={`fixed top-0 bottom-0 ${
              isRtl ? 'left-0' : 'right-0'
            } w-[85vw] max-w-[340px] bg-white shadow-2xl flex flex-col justify-between overflow-y-auto z-10`}
            aria-label="Mobile Navigation Drawer"
          >
            <div className="p-5">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-secondary text-lg">
                    {clinicDisplayName}
                  </span>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-soft"
                  aria-label="Close navigation menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Language Switcher inside Drawer */}
              <div className="mt-4 mb-3">
                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-surface-soft p-1.5 border border-surface-border">
                  <button
                    type="button"
                    onClick={() => switchLocale('en')}
                    className={`min-h-[40px] rounded-lg text-sm font-semibold ${
                      locale === 'en' ? 'bg-primary text-white' : 'text-text-primary'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => switchLocale('ur')}
                    className={`min-h-[40px] rounded-lg text-sm font-semibold font-urdu ${
                      locale === 'ur' ? 'bg-primary text-white' : 'text-text-primary'
                    }`}
                  >
                    اردو
                  </button>
                  <button
                    type="button"
                    onClick={() => switchLocale('sd')}
                    className={`min-h-[40px] rounded-lg text-sm font-semibold font-sindhi ${
                      locale === 'sd' ? 'bg-primary text-white' : 'text-text-primary'
                    }`}
                  >
                    سنڌي
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1 mt-2">
                {navItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-[16px] font-medium flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-primary-light text-primary font-semibold'
                          : 'text-text-primary hover:bg-surface-soft'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Call / WhatsApp / Book Buttons inside Drawer */}
            <div className="p-5 border-t border-surface-border bg-surface-soft space-y-2.5">
              <Link
                href={`/${locale}/appointment`}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-accent w-full"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>{labels.bookAppointment}</span>
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${clinicConfig.phoneClean}`}
                  className="btn-outline !px-3 w-full text-sm"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{labels.callNow}</span>
                </a>
                <a
                  href={getWhatsAppUrl(locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[48px] px-3 rounded-btn bg-whatsapp text-white text-sm font-semibold hover:opacity-95 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>{labels.whatsappUs}</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
