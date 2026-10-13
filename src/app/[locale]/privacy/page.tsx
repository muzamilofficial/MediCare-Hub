import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { clinicConfig, getClinicName } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';
import { PageBanner } from '@/components/ui/PageBanner';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('privacyTitle'),
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const clinicName = getClinicName(locale);

  return (
    <div>
      <PageBanner
        locale={locale}
        title={tNav('privacy')}
        breadcrumbLabel={tNav('privacy')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic max-w-3xl">
          <div className="card-clinic p-6 sm:p-10 space-y-6 text-text-primary leading-relaxed">
            <p className="text-sm text-text-secondary">
              Last updated: January 2026 • {clinicName} ({clinicConfig.address.en})
            </p>

            <div>
              <h2 className="heading-h3 text-secondary mb-2">
                1. What Patient Data We Collect
              </h2>
              <p className="text-text-secondary">
                When you book an appointment online, use our clinic chatbot, or submit a
                contact form at {clinicConfig.name}, we collect only the basic information
                necessary to schedule your visit: your full name, Pakistani mobile /
                WhatsApp number, optional email address, age, gender, selected doctor,
                appointment date/time, and any brief visit reason you choose to provide.
              </p>
            </div>

            <div>
              <h2 className="heading-h3 text-secondary mb-2">
                2. How Your Information Is Used
              </h2>
              <p className="text-text-secondary">
                Your contact and booking details are used strictly to confirm your
                appointment slot, notify you of any schedule changes via phone or WhatsApp,
                and share your diagnostic laboratory reports when requested.
              </p>
            </div>

            <div>
              <h2 className="heading-h3 text-secondary mb-2">
                3. Strict Confidentiality — We Never Sell Your Data
              </h2>
              <p className="text-text-secondary">
                {clinicConfig.name} does <strong>not</strong> sell, rent, or trade patient
                phone numbers, names, or medical records to any third-party advertisers,
                pharmaceutical companies, or marketing agencies. Access to appointment
                records is restricted to authorized clinic reception and medical staff.
              </p>
            </div>

            <div>
              <h2 className="heading-h3 text-secondary mb-2">
                4. How to Request Data Deletion
              </h2>
              <p className="text-text-secondary">
                You may request correction or complete deletion of your online booking or
                chat lead record at any time by emailing{' '}
                <a
                  href={`mailto:${clinicConfig.email}`}
                  className="text-primary font-semibold underline"
                >
                  {clinicConfig.email}
                </a>{' '}
                or messaging our reception WhatsApp at{' '}
                <span dir="ltr" className="font-semibold">
                  {clinicConfig.whatsapp}
                </span>{' '}
                with your booking reference number.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
