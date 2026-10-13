import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  CheckCircle2,
  ClipboardCheck,
  CalendarCheck,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { getWhatsAppUrl } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';
import { localizeField, formatPKR } from '@/lib/utils';
import { PageBanner } from '@/components/ui/PageBanner';
import { ServiceIcon } from '@/components/ui/ServiceIcon';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const srv = await prisma.service.findUnique({ where: { slug: params.slug } });
  if (!srv) return { title: 'Service Not Found' };
  const title = localizeField(srv, 'title', params.locale);
  const desc = localizeField(srv, 'description', params.locale);
  return {
    title,
    description: desc,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = params.locale as Locale;
  const srv = await prisma.service.findUnique({ where: { slug: params.slug } });
  if (!srv) {
    notFound();
  }

  const [tServices, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'services' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const relatedDoctors = await prisma.doctor.findMany({
    where: { serviceSlug: srv.slug, isActive: true },
  });

  const title = localizeField(srv, 'title', locale);
  const desc = localizeField(srv, 'description', locale);
  const treatList: string[] = JSON.parse(srv.whatWeTreat || '[]');
  const prepList: string[] = JSON.parse(srv.howToPrepare || '[]');

  return (
    <div>
      <PageBanner
        locale={locale}
        title={title}
        subtitle={desc}
        breadcrumbLabel={title}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic">
          <div className="mb-6">
            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4 rtl-flip" />
              <span>{tNav('services')}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="card-clinic p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
                    <ServiceIcon name={srv.icon} className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {srv.category}
                    </span>
                    <h2 className="heading-h3 text-secondary">{title}</h2>
                  </div>
                </div>
                <p className="text-text-secondary leading-relaxed mb-6">{desc}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-soft p-5 rounded-xl border border-surface-border">
                    <h3 className="text-base font-bold text-secondary mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span>{tServices('whatWeTreat')}</span>
                    </h3>
                    <ul className="space-y-2.5 text-sm text-text-secondary">
                      {treatList.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-surface-soft p-5 rounded-xl border border-surface-border">
                    <h3 className="text-base font-bold text-secondary mb-3 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-primary shrink-0" />
                      <span>{tServices('howToPrepare')}</span>
                    </h3>
                    <ul className="space-y-2.5 text-sm text-text-secondary">
                      {prepList.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {relatedDoctors.length > 0 && (
                <div className="card-clinic p-6 lg:p-8">
                  <h3 className="heading-h3 text-secondary mb-4">
                    {tServices('availableDoctors')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedDoctors.map((doc) => {
                      const docName = localizeField(doc, 'name', locale);
                      const docSpec = localizeField(doc, 'specialty', locale);
                      return (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl bg-surface-soft border border-surface-border flex items-center gap-4"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                            <Image
                              src={doc.photo}
                              alt={docName}
                              fill
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/${locale}/doctors/${doc.slug}`}
                              className="font-bold text-secondary hover:text-primary block truncate"
                            >
                              {docName}
                            </Link>
                            <p className="text-xs text-text-secondary truncate mb-2">
                              {docSpec}
                            </p>
                            <Link
                              href={`/${locale}/appointment?service=${srv.slug}&doctor=${doc.slug}`}
                              className="text-xs font-bold text-accent hover:underline"
                            >
                              {tCommon('bookAppointment')} →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Booking Card */}
            <div className="lg:col-span-4">
              <div className="card-clinic p-6 lg:p-7 sticky top-28 border-t-4 border-t-accent">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  {tServices('approxFee')}
                </p>
                <p dir="ltr" className="text-3xl font-bold text-secondary mb-6">
                  {tCommon('fromPkr', {
                    amount: srv.feeFrom.toLocaleString('en-US'),
                  })}
                </p>
                <div className="space-y-3">
                  <Link
                    href={`/${locale}/appointment?service=${srv.slug}`}
                    className="btn-accent w-full"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    <span>{tCommon('bookThisService')}</span>
                  </Link>
                  <a
                    href={getWhatsAppUrl(locale)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] w-full px-6 rounded-btn bg-whatsapp text-white font-semibold hover:opacity-95 transition-opacity"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{tCommon('whatsappUs')}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
