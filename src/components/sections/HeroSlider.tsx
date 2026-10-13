'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import {
  CalendarCheck,
  MessageCircle,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { clinicConfig, getClinicName, getWhatsAppUrl } from '@/config/clinic';
import { isRtlLocale, type Locale } from '@/i18n/routing';
import { CallNowButton } from '@/components/ui/CallNowButton';

interface HeroSliderProps {
  locale: Locale;
  copy: {
    slide1Title: string;
    slide1Sub: string;
    slide2Title: string;
    slide2Sub: string;
    slide3Title: string;
    slide3Sub: string;
    bookAppointment: string;
    callNow: string;
    bookOnline: string;
    seeDoctors: string;
    viewTimings: string;
    whatsappUs: string;
  };
}

export function HeroSlider({ locale, copy }: HeroSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const isRtl = isRtlLocale(locale);
  const whatsappUrl = getWhatsAppUrl(locale);
  const clinicDisplayName = getClinicName(locale);
  const cityDisplay = clinicConfig.city[locale] || clinicConfig.city.en;

  const slides = [
    {
      id: 'slide-1',
      image: '/images/hero-1.svg',
      title: copy.slide1Title,
      subtitle: copy.slide1Sub,
      primaryAction: (
        <Link href={`/${locale}/appointment`} className="btn-accent">
          <CalendarCheck className="w-5 h-5 shrink-0" />
          <span>{copy.bookAppointment}</span>
        </Link>
      ),
      secondaryAction: <CallNowButton label={copy.callNow} variant="outline-white" />,
    },
    {
      id: 'slide-2',
      image: '/images/hero-2.svg',
      title: copy.slide2Title,
      subtitle: copy.slide2Sub,
      primaryAction: (
        <Link href={`/${locale}/appointment`} className="btn-accent">
          <CalendarCheck className="w-5 h-5 shrink-0" />
          <span>{copy.bookOnline}</span>
        </Link>
      ),
      secondaryAction: (
        <Link href={`/${locale}/doctors`} className="btn-outline-white">
          <Users className="w-5 h-5 shrink-0" />
          <span>{copy.seeDoctors}</span>
        </Link>
      ),
    },
    {
      id: 'slide-3',
      image: '/images/hero-3.svg',
      title: copy.slide3Title,
      subtitle: copy.slide3Sub,
      primaryAction: (
        <Link href={`/${locale}/contact#timings`} className="btn-primary">
          <Clock className="w-5 h-5 shrink-0" />
          <span>{copy.viewTimings}</span>
        </Link>
      ),
      secondaryAction: (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 rounded-btn bg-whatsapp text-white text-[16px] font-semibold transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span>{copy.whatsappUs}</span>
        </a>
      ),
    },
  ];

  return (
    <section
      aria-label="Clinic Highlights"
      className="relative w-full h-[70vh] min-h-[480px] lg:h-[85vh] lg:min-h-[600px] max-h-[820px] overflow-hidden"
    >
      <Swiper
        key={locale}
        dir={isRtl ? 'rtl' : 'ltr'}
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={600}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        onSwiper={(sw) => {
          swiperRef.current = sw;
        }}
        className="w-full h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            <div className="relative w-full h-full flex items-center pb-16 lg:pb-20">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover"
              />
              {/* Gradient Overlay (Section 3) */}
              <div
                className={`absolute inset-0 ${
                  isRtl ? 'bg-hero-overlay-rtl' : 'bg-hero-overlay'
                }`}
              />

              {/* Slide Content */}
              <div className="container-clinic relative z-10 text-white">
                <div className="max-w-2xl">
                  <span className="inline-block px-3.5 py-1 rounded-chip bg-white/15 border border-white/25 text-xs sm:text-sm font-semibold tracking-wide mb-4 backdrop-blur-xs">
                    {clinicDisplayName} • {cityDisplay}
                  </span>
                  <h1 className="heading-h1 text-white mb-4 drop-shadow-xs">
                    {slide.title}
                  </h1>
                  <p className="text-white/90 text-base sm:text-lg lg:text-xl mb-8 leading-relaxed max-w-xl">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-3.5">
                    {slide.primaryAction}
                    {slide.secondaryAction}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Desktop Navigation Arrows (hidden on mobile per Section 7A) */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous slide"
        className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white border border-white/25 backdrop-blur-xs absolute top-1/2 -translate-y-1/2 left-6 z-20 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next slide"
        className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white border border-white/25 backdrop-blur-xs absolute top-1/2 -translate-y-1/2 right-6 z-20 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
}
