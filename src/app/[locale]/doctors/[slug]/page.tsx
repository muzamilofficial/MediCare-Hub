import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  Award,
  Globe,
  CalendarCheck,
  Clock,
  ArrowLeft,
  Stethoscope,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { clinicConfig } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';
import { formatPKR, localizeField } from '@/lib/utils';
import { PageBanner } from '@/components/ui/PageBanner';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const doc = await prisma.doctor.findUnique({ where: { slug: params.slug } });
  if (!doc) return { title: 'Doctor Not Found' };
  const name = localizeField(doc, 'name', params.locale);
  const spec = localizeField(doc, 'specialty', params.locale);
  return {
    title: `${name} — ${spec}`,
    description: localizeField(doc, 'bio', params.locale),
  };
}

const WEEKDAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default async function DoctorProfilePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = params.locale as Locale;
  const doc = await prisma.doctor.findUnique({ where: { slug: params.slug } });
  if (!doc) {
    notFound();
  }

  const [tDoctors, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'doctors' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const displayName = localizeField(doc, 'name', locale);
  const displaySpec = localizeField(doc, 'specialty', locale);
  const displayBio = localizeField(doc, 'bio', locale);

  let languages: string[] = [];
  let availability: Record<string, string[]> = {};
  try {
    languages = JSON.parse(doc.languages || '[]');
    availability = JSON.parse(doc.availability || '{}');
  } catch {
    languages = ['English', 'Urdu'];
    availability = {};
  }

  // Physician JSON-LD Schema (Section 11)
  const physicianJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doc.name,
    medicalSpecialty: doc.specialty,
    description: doc.bio,
    telephone: clinicConfig.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinicConfig.address.en,
      addressLocality: 'Karachi',
      addressRegion: 'Sindh',
      Country: 'PK',
    },
    availableLanguage: languages,
    priceRange: `PKR ${doc.fee}`,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }}
      />

      <PageBanner
        locale={locale}
        title={displayName}
        subtitle={displaySpec}
        breadcrumbLabel={displayName}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic">
          <div className="mb-6">
            <Link
              href={`/${locale}/doctors`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4 rtl-flip" />
              <span>{tNav('doctors')}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Photo & Key Metrics */}
            <div className="lg:col-span-4">
              <div className="card-clinic p-6 text-center sticky top-28">
                <div className="relative w-52 h-52 mx-auto rounded-2xl overflow-hidden bg-surface-soft border border-surface-border mb-5">
                  <Image
                    src={doc.photo}
                    alt={displayName}
                    fill
                    sizes="220px"
                    className="object-contain p-3"
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                  <Stethoscope className="w-4 h-4" />
                  <span>{displaySpec}</span>
                </div>
                <h2 className="heading-h3 text-secondary mb-1">{displayName}</h2>
                <p dir="ltr" className="text-xs font-medium text-text-secondary mb-5">
                  {doc.qualification}
                </p>

                <div className="space-y-3 text-start bg-surface-soft p-4 rounded-xl border border-surface-border mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-primary" />
                      {tDoctors('experience')}
                    </span>
                    <span className="font-bold text-secondary">
                      {tCommon('yearsExp', { years: doc.experienceYears })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-surface-border">
                    <span className="text-text-secondary">
                      {tDoctors('consultationFee')}
                    </span>
                    <span dir="ltr" className="font-bold text-primary text-base">
                      {formatPKR(doc.fee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-surface-border">
                    <span className="text-xs text-text-secondary flex items-center gap-1.5 mb-1.5">
                      <Globe className="w-4 h-4 text-primary" />
                      {tDoctors('languagesSpoken')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2.5 py-0.5 rounded-chip bg-white border border-surface-border text-xs font-semibold text-secondary"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/${locale}/appointment?doctor=${doc.slug}&service=${doc.serviceSlug}`}
                  className="btn-accent w-full"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>{tCommon('bookAppointment')}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Bio & Weekly Availability Table */}
            <div className="lg:col-span-8 space-y-8">
              <div className="card-clinic p-6 lg:p-8">
                <h3 className="heading-h3 text-secondary mb-4">
                  {tDoctors('aboutDoctor')}
                </h3>
                <p className="text-text-secondary leading-relaxed">{displayBio}</p>
              </div>

              <div className="card-clinic p-6 lg:p-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <Clock className="w-6 h-6 text-primary" />
                  <h3 className="heading-h3 text-secondary">
                    {tDoctors('weeklySchedule')}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {WEEKDAYS_ORDER.map((day) => {
                        const slots = availability[day] || [];
                        return (
                          <tr
                            key={day}
                            className="border-b border-surface-border last:border-b-0"
                          >
                            <th
                              scope="row"
                              className="py-4 px-3 font-bold text-secondary text-start w-36 align-top"
                            >
                              {day}
                            </th>
                            <td className="py-4 px-3">
                              {slots.length === 0 ? (
                                <span className="text-text-secondary italic text-xs">
                                  {tDoctors('closed')}
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5" dir="ltr">
                                  {slots.map((slot) => (
                                    <span
                                      key={slot}
                                      className="px-2.5 py-1 rounded-lg bg-surface-soft border border-surface-border text-xs font-medium text-text-primary"
                                    >
                                      {slot}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
