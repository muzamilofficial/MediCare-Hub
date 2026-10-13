import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Navigation,
} from 'lucide-react';

import { clinicConfig, getWhatsAppUrl } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';
import { PageBanner } from '@/components/ui/PageBanner';
import { ContactForm } from '@/components/sections/ContactForm';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('contactTitle'),
    description: tMeta('contactDescription'),
    alternates: {
      canonical: `/${params.locale}/contact`,
      languages: { en: '/en/contact', ur: '/ur/contact', sd: '/sd/contact' },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const [tContact, tNav, tCommon, tApt] = await Promise.all([
    getTranslations({ locale, namespace: 'contact' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'appointment' }),
  ]);

  const addressText = clinicConfig.address[locale] || clinicConfig.address.en;
  const whatsappUrl = getWhatsAppUrl(locale);

  return (
    <div>
      <PageBanner
        locale={locale}
        title={tContact('bannerTitle')}
        subtitle={tContact('bannerSub')}
        breadcrumbLabel={tNav('contact')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column: Contact Form */}
            <div className="lg:col-span-6">
              <ContactForm
                labels={{
                  formTitle: tContact('formTitle'),
                  formSub: tContact('formSub'),
                  nameLabel: tContact('nameLabel'),
                  phoneLabel: tContact('phoneLabel'),
                  emailLabel: tContact('emailLabel'),
                  subjectLabel: tContact('subjectLabel'),
                  subjGeneral: tContact('subjGeneral'),
                  subjAppointment: tContact('subjAppointment'),
                  subjLab: tContact('subjLab'),
                  subjFeedback: tContact('subjFeedback'),
                  messageLabel: tContact('messageLabel'),
                  sendButton: tContact('sendButton'),
                  successMessage: tContact('successMessage'),
                  nameRequired: tApt('errors.nameRequired'),
                  phoneInvalid: tApt('errors.phoneInvalid'),
                  emailInvalid: tApt('errors.emailInvalid'),
                }}
              />
            </div>

            {/* Right Column: Info Cards, Timings Table, Action Buttons, & Google Map */}
            <div className="lg:col-span-6 space-y-6">
              <div className="card-clinic p-6 sm:p-8 space-y-5">
                <h2 className="heading-h3 text-secondary">
                  {tContact('infoTitle')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Address Card */}
                  <div className="p-4 rounded-xl bg-surface-soft border border-surface-border sm:col-span-2 flex items-start gap-3.5">
                    <MapPin className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-secondary mb-1">
                        {tContact('addressTitle')}
                      </h3>
                      <p className="text-sm text-text-secondary">{addressText}</p>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="p-4 rounded-xl bg-surface-soft border border-surface-border flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-text-secondary mb-0.5">
                        {tContact('phoneTitle')}
                      </h3>
                      <a
                        href={`tel:${clinicConfig.phoneClean}`}
                        dir="ltr"
                        className="text-base font-bold text-secondary hover:text-primary"
                      >
                        {clinicConfig.phone}
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp Card */}
                  <div className="p-4 rounded-xl bg-surface-soft border border-surface-border flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-whatsapp shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-text-secondary mb-0.5">
                        {tContact('whatsappTitle')}
                      </h3>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="text-base font-bold text-secondary hover:text-primary"
                      >
                        {clinicConfig.whatsapp}
                      </a>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="p-4 rounded-xl bg-surface-soft border border-surface-border sm:col-span-2 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-text-secondary">
                        {tContact('emailTitle')}
                      </h3>
                      <a
                        href={`mailto:${clinicConfig.email}`}
                        dir="ltr"
                        className="text-sm font-semibold text-secondary hover:text-primary break-all"
                      >
                        {clinicConfig.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Timings Table */}
                <div
                  id="timings"
                  className="p-5 rounded-xl bg-primary-light/60 border border-primary/25 scroll-mt-28"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-secondary text-base">
                      {tContact('timingsTitle')}
                    </h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-primary/15">
                        <td className="py-2 font-semibold text-secondary">
                          {clinicConfig.timings.weekdays.days[locale]}
                        </td>
                        <td
                          dir="ltr"
                          className="py-2 text-end font-bold text-primary"
                        >
                          {clinicConfig.timings.weekdays.hours}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-secondary">
                          {clinicConfig.timings.sunday.days[locale]}
                        </td>
                        <td
                          dir="ltr"
                          className="py-2 text-end font-bold text-primary"
                        >
                          {clinicConfig.timings.sunday.hours}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Action Buttons: [Get Directions] [Call] [WhatsApp] (Section 7 Page 8) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <a
                    href={clinicConfig.map.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !px-3 text-sm"
                  >
                    <Navigation className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tCommon('getDirections')}</span>
                  </a>

                  <a
                    href={`tel:${clinicConfig.phoneClean}`}
                    className="btn-outline !px-3 text-sm"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tCommon('callNow')}</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-3 rounded-btn bg-whatsapp text-white text-sm font-semibold hover:opacity-95 transition-opacity"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tCommon('whatsappUs')}</span>
                  </a>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="card-clinic overflow-hidden h-[300px] border border-surface-border">
                <iframe
                  title={`${clinicConfig.name} Location Map`}
                  src={clinicConfig.map.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
