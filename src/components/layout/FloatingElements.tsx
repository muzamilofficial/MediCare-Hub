'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, CalendarCheck, ArrowUp } from 'lucide-react';
import { clinicConfig, getWhatsAppUrl } from '@/config/clinic';
import { isRtlLocale, type Locale } from '@/i18n/routing';

interface FloatingElementsProps {
  locale: Locale;
  labels: {
    callNow: string;
    whatsappUs: string;
    bookAppointment: string;
    backToTop: string;
  };
}

export function FloatingElements({ locale, labels }: FloatingElementsProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isRtl = isRtlLocale(locale);
  const whatsappUrl = getWhatsAppUrl(locale);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating WhatsApp Button: bottom-left in LTR, mirrored to bottom-right in RTL (Section 6) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.whatsappUs}
        className={`fixed bottom-[76px] lg:bottom-6 ${
          isRtl ? 'right-4 lg:right-6' : 'left-4 lg:left-6'
        } z-30 w-13 h-13 min-w-[52px] min-h-[52px] rounded-full bg-whatsapp text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center`}
      >
        <MessageCircle className="w-7 h-7" />
      </a>

      {/* Back to top button: appears after 600px scroll (Section 8) */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label={labels.backToTop}
          className={`fixed bottom-[138px] lg:bottom-24 ${
            isRtl ? 'right-4 lg:right-6' : 'left-4 lg:left-6'
          } z-30 w-11 h-11 rounded-full bg-secondary/90 text-white shadow-md hover:bg-secondary transition-all flex items-center justify-center`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Sticky Bottom Bar: Call | WhatsApp | Book (Section 4 & 6) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-surface-border shadow-[0_-4px_20px_rgba(18,53,91,0.1)] px-2.5 py-2">
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          <a
            href={`tel:${clinicConfig.phoneClean}`}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl border-2 border-primary text-primary font-semibold text-xs sm:text-sm px-2 active:bg-primary active:text-white"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span className="truncate">{labels.callNow}</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-whatsapp text-white font-semibold text-xs sm:text-sm px-2"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{labels.whatsappUs}</span>
          </a>

          <Link
            href={`/${locale}/appointment`}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-accent text-white font-semibold text-xs sm:text-sm px-2"
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">{labels.bookAppointment}</span>
          </Link>
        </div>
      </div>
    </>
  );
}
