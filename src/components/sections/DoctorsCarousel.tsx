'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Award, CalendarCheck, Stethoscope, UserCheck } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

import { isRtlLocale, type Locale } from '@/i18n/routing';
import { formatPKR, localizeField } from '@/lib/utils';

export interface DoctorCarouselItem {
  id: string;
  slug: string;
  name: string;
  nameUr: string;
  nameSd: string;
  specialty: string;
  specialtyUr: string;
  specialtySd: string;
  qualification: string;
  experienceYears: number;
  photo: string;
  fee: number;
}

interface DoctorsCarouselProps {
  locale: Locale;
  doctors: DoctorCarouselItem[];
  labels: {
    yearsExpTemplate: string;
    bookWithDoctorTemplate: string;
    viewProfile: string;
  };
}

export function DoctorsCarousel({ locale, doctors, labels }: DoctorsCarouselProps) {
  const isRtl = isRtlLocale(locale);

  return (
    <div className="relative pb-10">
      <Swiper
        key={locale}
        dir={isRtl ? 'rtl' : 'ltr'}
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 1.4 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="!pb-12"
      >
        {doctors.map((doc) => {
          const displayName = localizeField(doc, 'name', locale);
          const displaySpecialty = localizeField(doc, 'specialty', locale);
          const expText = labels.yearsExpTemplate.replace(
            '{years}',
            String(doc.experienceYears)
          );
          const bookBtnText = labels.bookWithDoctorTemplate.replace('{name}', displayName);

          return (
            <SwiperSlide key={doc.id} className="h-auto">
              <div className="card-clinic h-full flex flex-col overflow-hidden group">
                <Link
                  href={`/${locale}/doctors/${doc.slug}`}
                  className="relative h-60 w-full bg-surface-soft overflow-hidden block"
                >
                  <Image
                    src={doc.photo}
                    alt={displayName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    dir="ltr"
                    className="absolute top-3 right-3 px-3 py-1 rounded-chip bg-secondary/90 text-white text-xs font-bold shadow-xs"
                  >
                    {formatPKR(doc.fee)}
                  </span>
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5">
                      <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                      <span>{displaySpecialty}</span>
                    </div>
                    <h3 className="heading-h3 text-secondary mb-1">
                      <Link
                        href={`/${locale}/doctors/${doc.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {displayName}
                      </Link>
                    </h3>
                    <p
                      dir="ltr"
                      className="text-xs font-medium text-text-secondary mb-3"
                    >
                      {doc.qualification}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-soft px-3 py-2 rounded-lg mb-5">
                      <Award className="w-4 h-4 text-primary shrink-0" />
                      <span>{expText}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Link
                      href={`/${locale}/appointment?doctor=${doc.slug}`}
                      className="btn-accent w-full !px-4 text-sm"
                    >
                      <CalendarCheck className="w-4 h-4 shrink-0" />
                      <span className="truncate">{bookBtnText}</span>
                    </Link>
                    <Link
                      href={`/${locale}/doctors/${doc.slug}`}
                      className="btn-outline w-full !min-h-[42px] !px-4 text-xs"
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>{labels.viewProfile}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
