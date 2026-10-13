import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import type { Locale } from '@/i18n/routing';
import { PageBanner } from '@/components/ui/PageBanner';
import { DoctorsFilterGrid } from '@/components/sections/DoctorsFilterGrid';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('doctorsTitle'),
    description: tMeta('doctorsDescription'),
    alternates: {
      canonical: `/${params.locale}/doctors`,
      languages: { en: '/en/doctors', ur: '/ur/doctors', sd: '/sd/doctors' },
    },
  };
}

export default async function DoctorsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const [tDoctors, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'doctors' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div>
      <PageBanner
        locale={locale}
        title={tDoctors('bannerTitle')}
        subtitle={tDoctors('bannerSub')}
        breadcrumbLabel={tNav('doctors')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic">
          <DoctorsFilterGrid
            locale={locale}
            doctors={doctors}
            labels={{
              searchPlaceholder: tDoctors('searchPlaceholder'),
              allSpecialties: tDoctors('allSpecialties'),
              noDoctorsFound: tDoctors('noDoctorsFound'),
              yearsExpTemplate: tCommon('yearsExp', { years: '{years}' }),
              bookWithDoctorTemplate: tCommon('bookWithDoctor', { name: '{name}' }),
              viewProfile: tDoctors('viewProfile'),
            }}
          />
        </div>
      </section>
    </div>
  );
}
