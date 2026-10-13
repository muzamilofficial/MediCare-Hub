import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  Heart,
  ShieldCheck,
  Award,
  Wallet,
  Target,
  Eye,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';

import { clinicConfig, getClinicName } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';
import { PageBanner } from '@/components/ui/PageBanner';
import { FadeInSection } from '@/components/ui/FadeInSection';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('aboutTitle'),
    description: tMeta('aboutDescription'),
    alternates: {
      canonical: `/${params.locale}/about`,
      languages: { en: '/en/about', ur: '/ur/about', sd: '/sd/about' },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const [tAbout, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'about' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const clinicDisplayName = getClinicName(locale);

  const coreValues = [
    { icon: Heart, title: tAbout('val1Title'), desc: tAbout('val1Desc') },
    { icon: ShieldCheck, title: tAbout('val2Title'), desc: tAbout('val2Desc') },
    { icon: Award, title: tAbout('val3Title'), desc: tAbout('val3Desc') },
    { icon: Wallet, title: tAbout('val4Title'), desc: tAbout('val4Desc') },
  ];

  const facilities = [
    { image: '/images/gallery-1.svg', title: tAbout('fac1') },
    { image: '/images/gallery-2.svg', title: tAbout('fac2') },
    { image: '/images/gallery-3.svg', title: tAbout('fac3') },
    { image: '/images/gallery-9.svg', title: tAbout('fac4') },
  ];

  const accreditations = [
    tAbout('acc1'),
    tAbout('acc2'),
    tAbout('acc3'),
    tAbout('acc4'),
  ];

  return (
    <div>
      <PageBanner
        locale={locale}
        title={tAbout('bannerTitle', { clinicName: clinicDisplayName })}
        subtitle={tAbout('bannerSub')}
        breadcrumbLabel={tNav('about')}
        homeLabel={tNav('home')}
      />

      {/* 1. Our Story (3 paragraphs) */}
      <section className="section-padding">
        <div className="container-clinic">
          <FadeInSection className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6">
              <span className="inline-block px-3.5 py-1 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-3">
                {tAbout('storyBadge')}
              </span>
              <h2 className="heading-h2 text-secondary mb-5">{tAbout('storyTitle')}</h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>{tAbout('storyP1', { clinicName: clinicDisplayName })}</p>
                <p>{tAbout('storyP2', { clinicName: clinicDisplayName })}</p>
                <p>{tAbout('storyP3')}</p>
              </div>
            </div>

            <div className="lg:col-span-6">
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
          </FadeInSection>
        </div>
      </section>

      {/* 2. Mission & Vision (2 cards) */}
      <section className="section-padding bg-surface-soft">
        <div className="container-clinic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeInSection className="card-clinic p-8 border-t-4 border-t-primary">
              <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="heading-h3 text-secondary mb-3">{tAbout('missionTitle')}</h2>
              <p className="text-text-secondary leading-relaxed">
                {tAbout('missionDesc')}
              </p>
            </FadeInSection>

            <FadeInSection delay={0.1} className="card-clinic p-8 border-t-4 border-t-secondary">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="heading-h3 text-secondary mb-3">{tAbout('visionTitle')}</h2>
              <p className="text-text-secondary leading-relaxed">{tAbout('visionDesc')}</p>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 3. Core Values (4 icon cards) */}
      <section className="section-padding">
        <div className="container-clinic">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="heading-h2 text-secondary">{tAbout('valuesTitle')}</h2>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <FadeInSection key={idx} delay={idx * 0.05} className="card-clinic p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="heading-h3 text-secondary mb-2">{val.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{val.desc}</p>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Facilities (Photo Grid of reception, lab, consultation room, pharmacy) */}
      <section className="section-padding bg-surface-soft">
        <div className="container-clinic">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="heading-h2 text-secondary mb-3">{tAbout('facilitiesTitle')}</h2>
            <p className="text-text-secondary">{tAbout('facilitiesSub')}</p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {facilities.map((fac, idx) => (
              <FadeInSection key={idx} delay={idx * 0.05} className="card-clinic overflow-hidden">
                <div className="relative h-60 w-full bg-white">
                  <Image
                    src={fac.image}
                    alt={fac.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-secondary">{fac.title}</h3>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Meet the Founder / Medical Director */}
      <section className="section-padding">
        <div className="container-clinic">
          <FadeInSection className="card-clinic p-8 lg:p-12 bg-gradient-to-br from-white to-surface-soft">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-primary/20 bg-white mb-4 shadow-md">
                  <Image
                    src={clinicConfig.founder.photo}
                    alt={clinicConfig.founder.name[locale]}
                    fill
                    sizes="200px"
                    className="object-contain p-2"
                  />
                </div>
                <h3 className="text-xl font-bold text-secondary">
                  {clinicConfig.founder.name[locale]}
                </h3>
                <p className="text-sm font-semibold text-primary mb-1">
                  {clinicConfig.founder.title[locale]}
                </p>
                <p dir="ltr" className="text-xs text-text-secondary">
                  {clinicConfig.founder.qualification}
                </p>
              </div>

              <div className="lg:col-span-8">
                <span className="inline-block px-3.5 py-1 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-4">
                  {tAbout('founderBadge')}
                </span>
                <blockquote className="text-lg lg:text-xl text-secondary font-medium italic leading-relaxed mb-6">
                  {tAbout('founderQuote')}
                </blockquote>
                <Link
                  href={`/${locale}/appointment?doctor=dr-tariq-mahmood-siddiqui`}
                  className="btn-accent"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>{tCommon('bookAppointment')}</span>
                </Link>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 6. Accreditations / Registrations Placeholder Badges */}
      <section className="section-padding bg-surface-soft">
        <div className="container-clinic">
          <FadeInSection className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="heading-h2 text-secondary">{tAbout('accreditationsTitle')}</h2>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {accreditations.map((badge, idx) => (
              <div
                key={idx}
                className="card-clinic p-5 flex items-center gap-3.5 border border-primary/25"
              >
                <div className="w-10 h-10 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="font-semibold text-secondary text-sm">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
