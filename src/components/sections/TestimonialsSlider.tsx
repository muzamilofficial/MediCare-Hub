'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

import { isRtlLocale, type Locale } from '@/i18n/routing';

interface TestimonialItem {
  name: string;
  city: string;
  quote: string;
}

interface TestimonialsSliderProps {
  locale: Locale;
  items: TestimonialItem[];
}

export function TestimonialsSlider({ locale, items }: TestimonialsSliderProps) {
  const isRtl = isRtlLocale(locale);

  return (
    <Swiper
      key={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      modules={[Autoplay, Pagination]}
      spaceBetween={24}
      slidesPerView={1}
      pagination={{ clickable: true }}
      autoplay={{
        delay: 6000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      breakpoints={{
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      className="!pb-12"
    >
      {items.map((item, idx) => (
        <SwiperSlide key={idx} className="h-auto">
          <div className="card-clinic p-6 lg:p-7 h-full flex flex-col justify-between relative">
            <Quote className="w-9 h-9 text-primary/15 absolute top-5 right-5" />
            <div>
              <div className="flex items-center gap-1 text-warning mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, sIdx) => (
                  <Star key={sIdx} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-text-primary text-[16px] leading-relaxed mb-6">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-surface-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center shrink-0">
                {item.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-secondary text-sm">{item.name}</p>
                <p className="text-xs text-text-secondary">{item.city}</p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
