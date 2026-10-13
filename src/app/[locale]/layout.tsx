import React from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales, isRtlLocale, type Locale } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingElements } from '@/components/layout/FloatingElements';
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';
import { prisma } from '@/lib/prisma';
import { clinicConfig, getClinicName } from '@/config/clinic';

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  unstable_setRequestLocale(typedLocale);
  const isRtl = isRtlLocale(typedLocale);
  const messages = await getMessages({ locale: typedLocale });
  const tCommon = await getTranslations({ locale: typedLocale, namespace: 'common' });
  const tNav = await getTranslations({ locale: typedLocale, namespace: 'nav' });
  const tFooter = await getTranslations({ locale: typedLocale, namespace: 'footer' });

  const [doctors, services] = await Promise.all([
    prisma.doctor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        nameUr: true,
        nameSd: true,
        specialty: true,
        specialtyUr: true,
        specialtySd: true,
        serviceSlug: true,
        qualification: true,
        fee: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.service.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        titleUr: true,
        titleSd: true,
        description: true,
        descriptionUr: true,
        descriptionSd: true,
        feeFrom: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const clinicDisplayName = getClinicName(typedLocale);

  // MedicalClinic JSON-LD structured data (Section 11)
  const medicalClinicJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinicConfig.name,
    alternateName: [clinicConfig.nameUr, clinicConfig.nameSd],
    description: clinicConfig.tagline.en,
    telephone: clinicConfig.phone,
    email: clinicConfig.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinicConfig.address.en,
      addressLocality: 'Karachi',
      addressRegion: 'Sindh',
      postalCode: '75600',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinicConfig.map.lat,
      longitude: clinicConfig.map.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '10:00',
        closes: '14:00',
      },
    ],
  };

  return (
    <NextIntlClientProvider locale={typedLocale} messages={messages}>
      <div
        lang={typedLocale}
        dir={isRtl ? 'rtl' : 'ltr'}
        className="min-h-screen flex flex-col"
      >
        {/* Sync root html lang and dir immediately on client */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.lang="${typedLocale}";document.documentElement.dir="${
              isRtl ? 'rtl' : 'ltr'
            }";`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalClinicJsonLd) }}
        />

        <Header
          locale={typedLocale}
          labels={{
            skipToContent: tCommon('skipToContent'),
            home: tNav('home'),
            about: tNav('about'),
            services: tNav('services'),
            doctors: tNav('doctors'),
            appointment: tNav('appointment'),
            gallery: tNav('gallery'),
            healthTips: tNav('healthTips'),
            contact: tNav('contact'),
            bookAppointment: tCommon('bookAppointment'),
            callNow: tCommon('callNow'),
            whatsappUs: tCommon('whatsappUs'),
          }}
        />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer
          locale={typedLocale}
          labels={{
            aboutBlurb: tFooter('aboutBlurb'),
            quickLinks: tFooter('quickLinks'),
            ourServices: tFooter('ourServices'),
            contactInfo: tFooter('contactInfo'),
            copyright: tFooter('copyright', { clinicName: clinicDisplayName }),
            privacyLink: tFooter('privacyLink'),
            termsLink: tFooter('termsLink'),
            nav: {
              home: tNav('home'),
              about: tNav('about'),
              services: tNav('services'),
              doctors: tNav('doctors'),
              appointment: tNav('appointment'),
              gallery: tNav('gallery'),
              healthTips: tNav('healthTips'),
              contact: tNav('contact'),
              admin: tNav('admin'),
            },
          }}
        />

        <FloatingElements
          locale={typedLocale}
          labels={{
            callNow: tCommon('callNow'),
            whatsappUs: tCommon('whatsappUs'),
            bookAppointment: tCommon('bookAppointment'),
            backToTop: tCommon('backToTop'),
          }}
        />

        <ChatbotWidget
          initialLocale={typedLocale}
          doctors={doctors}
          services={services}
          tooltipText={tCommon('chatWithUs')}
        />
      </div>
    </NextIntlClientProvider>
  );
}
