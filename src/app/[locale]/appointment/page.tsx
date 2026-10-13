import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import type { Locale } from '@/i18n/routing';
import { PageBanner } from '@/components/ui/PageBanner';
import { AppointmentWizard } from '@/components/booking/AppointmentWizard';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('appointmentTitle'),
    description: tMeta('appointmentDescription'),
    alternates: {
      canonical: `/${params.locale}/appointment`,
      languages: {
        en: '/en/appointment',
        ur: '/ur/appointment',
        sd: '/sd/appointment',
      },
    },
  };
}

export default async function AppointmentPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { service?: string; doctor?: string };
}) {
  const locale = params.locale as Locale;
  const [tApt, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'appointment' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const [services, doctors] = await Promise.all([
    prisma.service.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.doctor.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const labels = {
    step1: tApt('step1'),
    step2: tApt('step2'),
    step3: tApt('step3'),
    step4: tApt('step4'),
    selectService: tApt('selectService'),
    selectDoctor: tApt('selectDoctor'),
    anyAvailableDoctor: tApt('anyAvailableDoctor'),
    selectDate: tApt('selectDate'),
    selectDateHint: tApt('selectDateHint'),
    selectTimeSlot: tApt('selectTimeSlot'),
    bookedLabel: tApt('bookedLabel'),
    noSlotsAvailable: tApt('noSlotsAvailable'),
    patientName: tApt('patientName'),
    patientNamePlaceholder: tApt('patientNamePlaceholder'),
    phone: tApt('phone'),
    phonePlaceholder: tApt('phonePlaceholder'),
    phoneHint: tApt('phoneHint'),
    email: tApt('email'),
    emailPlaceholder: tApt('emailPlaceholder'),
    age: tApt('age'),
    agePlaceholder: tApt('agePlaceholder'),
    gender: tApt('gender'),
    genderMale: tApt('genderMale'),
    genderFemale: tApt('genderFemale'),
    genderOther: tApt('genderOther'),
    reason: tApt('reason'),
    reasonPlaceholder: tApt('reasonPlaceholder'),
    consentLabel: tApt('consentLabel'),
    reviewTitle: tApt('reviewTitle'),
    editSection: tApt('editSection'),
    serviceLabel: tApt('serviceLabel'),
    doctorLabel: tApt('doctorLabel'),
    dateTimeLabel: tApt('dateTimeLabel'),
    patientInfoLabel: tApt('patientInfoLabel'),
    feeSummaryLabel: tApt('feeSummaryLabel'),
    confirmButton: tApt('confirmButton'),
    submitting: tApt('submitting'),
    successTitle: tApt('successTitle'),
    successSub: tApt('successSub'),
    referenceLabel: tApt('referenceLabel'),
    addToCalendar: tApt('addToCalendar'),
    sendOnWhatsApp: tApt('sendOnWhatsApp'),
    backToHome: tCommon('backToHome'),
    back: tCommon('back'),
    next: tCommon('next'),
    loading: tCommon('loading'),
    errors: {
      serviceRequired: tApt('errors.serviceRequired'),
      doctorRequired: tApt('errors.doctorRequired'),
      dateRequired: tApt('errors.dateRequired'),
      slotRequired: tApt('errors.slotRequired'),
      nameRequired: tApt('errors.nameRequired'),
      phoneInvalid: tApt('errors.phoneInvalid'),
      emailInvalid: tApt('errors.emailInvalid'),
      consentRequired: tApt('errors.consentRequired'),
      slotTaken: tApt('errors.slotTaken'),
      rateLimit: tApt('errors.rateLimit'),
    },
  };

  return (
    <div>
      <PageBanner
        locale={locale}
        title={tApt('bannerTitle')}
        subtitle={tApt('bannerSub')}
        breadcrumbLabel={tNav('appointment')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding bg-surface-soft">
        <div className="container-clinic">
          <AppointmentWizard
            locale={locale}
            services={services}
            doctors={doctors}
            initialServiceSlug={searchParams?.service}
            initialDoctorSlug={searchParams?.doctor}
            labels={labels}
          />
        </div>
      </section>
    </div>
  );
}
