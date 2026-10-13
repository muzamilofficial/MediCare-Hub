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
    title: tMeta('termsTitle'),
  };
}

export default async function TermsPage({
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
        title={tNav('terms')}
        breadcrumbLabel={tNav('terms')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic max-w-3xl">
          <div className="card-clinic p-6 sm:p-10 space-y-6 text-text-primary leading-relaxed">
            <p className="text-sm text-text-secondary">
              Effective Date: January 2026 • {clinicName}
            </p>

            <div>
              <h2 className="heading-h3 text-secondary mb-2">
                1. Online Appointments & Arrival Time
              </h2>
              <p className="text-text-secondary">
                Online appointment slots are reserved for 30-minute consultation windows.
                Patients are requested to arrive at least 10 minutes before their scheduled
                time slot. If you need to cancel or reschedule, please notify reception via
                phone or WhatsApp at least 2 hours in advance.
              </p>
            </div>

            <div>
              <h2 className="heading-h3 text-secondary mb-2">
                2. Medical Disclaimer & Emergency Care
              </h2>
              <p className="text-text-secondary">
                Content on this website (including Health Tips articles and the automated
                Chatbot Assistant) is provided for general informational and scheduling
                purposes only and never substitutes for an in-person examination by a
                qualified physician. In case of a medical emergency (such as chest pain,
                severe breathing difficulty, or heavy bleeding), call{' '}
                <span dir="ltr" className="font-semibold">
                  {clinicConfig.emergencyPhone}
                </span>{' '}
                or Rescue 1122 immediately.
              </p>
            </div>

            <div>
              <h2 className="heading-h3 text-secondary mb-2">
                3. Consultation & Diagnostic Fees
              </h2>
              <p className="text-text-secondary">
                Consultation fees and diagnostic rates displayed on the website are payable
                at the clinic reception counter in Pakistani Rupees (PKR). There is no
                advance online charge for booking an appointment slot.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
