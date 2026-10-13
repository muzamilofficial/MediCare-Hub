import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import {
  CalendarCheck,
  UserSearch,
  Clock,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { clinicConfig, getClinicName, getWhatsAppUrl } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';
import { localizeField, formatPKR } from '@/lib/utils';
import { HeroSlider } from '@/components/sections/HeroSlider';
import { StatsCounterBar } from '@/components/sections/StatsCounterBar';
import { DoctorsCarousel } from '@/components/sections/DoctorsCarousel';
import { TestimonialsSlider } from '@/components/sections/TestimonialsSlider';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { FadeInSection } from '@/components/ui/FadeInSection';
import { ServiceIcon } from '@/components/ui/ServiceIcon';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('homeTitle'),
    description: tMeta('homeDescription'),
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        en: '/en',
        ur: '/ur',
        sd: '/sd',
      },
    },
    openGraph: {
      title: tMeta('homeTitle'),
      description: tMeta('homeDescription'),
      type: 'website',
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const [tCommon, tHero, tQuick, tHome, tDoctors] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'hero' }),
    getTranslations({ locale, namespace: 'quickActions' }),
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'doctors' }),
  ]);

  const [services, doctors] = await Promise.all([
    prisma.service.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.doctor.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const clinicDisplayName = getClinicName(locale);
  const whatsappUrl = getWhatsAppUrl(locale);

  const quickActions = [
    {
      icon: CalendarCheck,
      title: tQuick('bookTitle'),
      desc: tQuick('bookDesc'),
      href: `/${locale}/appointment`,
      accent: true,
    },
    {
      icon: UserSearch,
      title: tQuick('doctorTitle'),
      desc: tQuick('doctorDesc'),
      href: `/${locale}/doctors`,
    },
    {
      icon: Clock,
      title: tQuick('timingsTitle'),
      desc: tQuick('timingsDesc'),
      href: `/${locale}/contact#timings`,
    },
    {
      icon: PhoneCall,
      title: tQuick('emergencyTitle'),
      desc: tQuick('emergencyDesc'),
      href: `tel:${clinicConfig.phoneClean}`,
      isTel: true,
    },
  ];

  const howSteps = [
    { num: '1', title: tHome('step1Title'), desc: tHome('step1Desc') },
    { num: '2', title: tHome('step2Title'), desc: tHome('step2Desc') },
    { num: '3', title: tHome('step3Title'), desc: tHome('step3Desc') },
    { num: '4', title: tHome('step4Title'), desc: tHome('step4Desc') },
  ];

  const testimonials = [
    { name: tHome('t1Name'), city: tHome('t1City'), quote: tHome('t1Quote') },
    { name: tHome('t2Name'), city: tHome('t2City'), quote: tHome('t2Quote') },
    { name: tHome('t3Name'), city: tHome('t3City'), quote: tHome('t3Quote') },
  ];

  const faqs = [
    { question: tHome('faq1Q'), answer: tHome('faq1A') },
    { question: tHome('faq2Q'), answer: tHome('faq2A') },
    { question: tHome('faq3Q'), answer: tHome('faq3A') },
    { question: tHome('faq4Q'), answer: tHome('faq4A') },
    { question: tHome('faq5Q'), answer: tHome('faq5A') },
    { question: tHome('faq6Q'), answer: tHome('faq6A') },
  ];

  return (
    <div>
      {/* A) HERO SLIDER (full width, 85vh desktop / 70vh mobile) */}
      <HeroSlider
        locale={locale}
        copy={{
          slide1Title: tHero('slide1Title'),
          slide1Sub: tHero('slide1Sub'),
          slide2Title: tHero('slide2Title'),
          slide2Sub: tHero('slide2Sub'),
          slide3Title: tHero('slide3Title'),
          slide3Sub: tHero('slide3Sub'),
          bookAppointment: tCommon('bookAppointment'),
          callNow: tCommon('callNow'),
          bookOnline: tCommon('bookOnline'),
          seeDoctors: tCommon('seeDoctors'),
          viewTimings: tCommon('viewTimings'),
          whatsappUs: tCommon('whatsappUs'),
        }}
      />

      {/* B) QUICK ACTION CARDS (overlapping bottom of hero by 60px) */}
      <section aria-label="Quick Actions" className="container-clinic -mt-[60px] relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {quickActions.map((card, idx) => {
            const Icon = card.icon;
            const content = (
              <div
                className={`card-clinic p-5 lg:p-6 h-full flex items-start gap-4 transition-transform hover:-translate-y-1 ${
                  card.accent ? 'border-t-4 border-t-accent' : 'border-t-4 border-t-primary'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    card.accent
                      ? 'bg-accent/15 text-accent'
                      : 'bg-primary-light text-primary'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-secondary mb-1">{card.title}</h2>
                  <p className="text-sm text-text-secondary line-clamp-1">{card.desc}</p>
                </div>
              </div>
            );

            return card.isTel ? (
              <a key={idx} href={card.href} className="block">
                {content}
              </a>
            ) : (
              <Link key={idx} href={card.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      {/* C) ABOUT PREVIEW: image left, text right */}
      <section className="section-padding">
        <div className="container-clinic">
          <FadeInSection className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-card overflow-hidden shadow-card border border-surface-border aspect-4/3 bg-surface-soft">
                <Image
                  src="/images/clinic-about.svg"
                  alt={clinicDisplayName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6">
              <span className="inline-block px-3.5 py-1 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-3">
                {tHome('aboutBadge')}
              </span>
              <h2 className="heading-h2 text-secondary mb-4">
                {tHome('aboutTitle', { clinicName: clinicDisplayName })}
              </h2>
              <p className="text-text-secondary mb-4 leading-relaxed">
                {tHome('aboutP1', { clinicName: clinicDisplayName })}
              </p>
              <p className="text-text-secondary mb-6 leading-relaxed">
                {tHome('aboutP2')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                {[
                  tHome('check1'),
                  tHome('check2'),
                  tHome('check3'),
                  tHome('check4'),
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="font-semibold text-text-primary text-[16px]">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              <Link href={`/${locale}/about`} className="btn-primary">
                <span>{tCommon('learnMore')}</span>
                <ArrowRight className="w-4 h-4 rtl-flip" />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* D) SERVICES GRID: 8 cards */}
      <section className="section-padding bg-surface-soft">
        <div className="container-clinic">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3.5 py-1 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-3">
              {tHome('servicesBadge')}
            </span>
            <h2 className="heading-h2 text-secondary mb-3">{tHome('servicesTitle')}</h2>
            <p className="text-text-secondary">{tHome('servicesSub')}</p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv, idx) => {
              const title = localizeField(srv, 'title', locale);
              const desc = localizeField(srv, 'description', locale);
              return (
                <FadeInSection key={srv.id} delay={idx * 0.04}>
                  <div className="card-clinic p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4">
                        <ServiceIcon name={srv.icon} className="w-6 h-6" />
                      </div>
                      <h3 className="heading-h3 text-secondary mb-2">{title}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                        {desc}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                      <span dir="ltr" className="text-xs font-bold text-primary">
                        {formatPKR(srv.feeFrom)}+
                      </span>
                      <Link
                        href={`/${locale}/services/${srv.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary transition-colors"
                      >
                        <span>{tCommon('learnMore')}</span>
                        <ArrowRight className="w-4 h-4 rtl-flip" />
                      </Link>
                    </div>
                  </div>
                </FadeInSection>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href={`/${locale}/services`} className="btn-outline">
              <span>{tHome('viewAllServices')}</span>
              <ArrowRight className="w-4 h-4 rtl-flip" />
            </Link>
          </div>
        </div>
      </section>

      {/* E) STATISTICS BAR */}
      <StatsCounterBar
        labels={{
          years: tHome('statsYears'),
          patients: tHome('statsPatients'),
          doctors: tHome('statsDoctors'),
          rating: tHome('statsRating'),
        }}
      />

      {/* F) OUR DOCTORS CAROUSEL */}
      <section className="section-padding">
        <div className="container-clinic">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3.5 py-1 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-3">
              {tHome('doctorsBadge')}
            </span>
            <h2 className="heading-h2 text-secondary mb-3">{tHome('doctorsTitle')}</h2>
            <p className="text-text-secondary">{tHome('doctorsSub')}</p>
          </FadeInSection>

          <DoctorsCarousel
            locale={locale}
            doctors={doctors}
            labels={{
              yearsExpTemplate: tCommon('yearsExp', { years: '{years}' }),
              bookWithDoctorTemplate: tCommon('bookWithDoctor', { name: '{name}' }),
              viewProfile: tDoctors('viewProfile'),
            }}
          />
        </div>
      </section>

      {/* G) HOW IT WORKS: 4 steps with numbered circles and connecting line */}
      <section className="section-padding bg-surface-soft">
        <div className="container-clinic">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3.5 py-1 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-3">
              {tHome('howBadge')}
            </span>
            <h2 className="heading-h2 text-secondary mb-3">{tHome('howTitle')}</h2>
            <p className="text-text-secondary">{tHome('howSub')}</p>
          </FadeInSection>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Desktop horizontal connecting line */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-primary/25 z-0"
            />
            {howSteps.map((step, idx) => (
              <FadeInSection
                key={idx}
                delay={idx * 0.08}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div
                  dir="ltr"
                  className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center shadow-md ring-8 ring-white mb-5"
                >
                  {step.num}
                </div>
                <h3 className="heading-h3 text-secondary mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary max-w-xs">{step.desc}</p>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* H) TESTIMONIALS SLIDER */}
      <section className="section-padding">
        <div className="container-clinic">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3.5 py-1 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-3">
              {tHome('testimonialsBadge')}
            </span>
            <h2 className="heading-h2 text-secondary mb-3">
              {tHome('testimonialsTitle')}
            </h2>
            <p className="text-text-secondary">{tHome('testimonialsSub')}</p>
          </FadeInSection>

          <TestimonialsSlider locale={locale} items={testimonials} />
        </div>
      </section>

      {/* I) FAQ ACCORDION (6 questions) */}
      <section className="section-padding bg-surface-soft">
        <div className="container-clinic">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3.5 py-1 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-3">
              {tHome('faqBadge')}
            </span>
            <h2 className="heading-h2 text-secondary mb-3">{tHome('faqTitle')}</h2>
            <p className="text-text-secondary">{tHome('faqSub')}</p>
          </FadeInSection>

          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* J) CTA BANNER */}
      <section className="py-14 lg:py-20 bg-cta-gradient text-white">
        <div className="container-clinic text-center">
          <FadeInSection className="max-w-3xl mx-auto">
            <h2 className="heading-h2 text-white mb-4">{tHome('ctaTitle')}</h2>
            <p className="text-white/90 text-base lg:text-lg mb-8">{tHome('ctaSub')}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href={`/${locale}/appointment`} className="btn-accent">
                <CalendarCheck className="w-5 h-5" />
                <span>{tCommon('bookAppointment')}</span>
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 rounded-btn bg-whatsapp text-white text-[16px] font-semibold hover:opacity-95 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{tCommon('whatsappUs')}</span>
              </a>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
