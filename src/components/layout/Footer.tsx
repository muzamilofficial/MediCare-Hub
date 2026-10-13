import React from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
} from 'lucide-react';
import { clinicConfig, getClinicName, getWhatsAppUrl } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';

interface FooterProps {
  locale: Locale;
  labels: {
    aboutBlurb: string;
    quickLinks: string;
    ourServices: string;
    contactInfo: string;
    copyright: string;
    privacyLink: string;
    termsLink: string;
    nav: {
      home: string;
      about: string;
      services: string;
      doctors: string;
      appointment: string;
      gallery: string;
      healthTips: string;
      contact: string;
      admin: string;
    };
  };
}

export function Footer({ locale, labels }: FooterProps) {
  const clinicDisplayName = getClinicName(locale);
  const addressText = clinicConfig.address[locale] || clinicConfig.address.en;
  const timingsText = clinicConfig.timings.summary[locale] || clinicConfig.timings.summary.en;

  const replaceClinicName = (text: string) =>
    text
      .replace(/MediCare Hub/g, clinicDisplayName)
      .replace(/میڈی کیئر ہب/g, clinicDisplayName)
      .replace(/ميڊي ڪيئر هب/g, clinicDisplayName);

  const serviceLinks = [
    {
      slug: 'general-physician',
      name:
        locale === 'ur'
          ? 'جنرل فزیشن'
          : locale === 'sd'
          ? 'جنرل فزيشن'
          : 'General Physician',
    },
    {
      slug: 'pediatrics',
      name:
        locale === 'ur'
          ? 'چائلڈ اسپیشلسٹ (بچوں کے ماہر)'
          : locale === 'sd'
          ? 'ٻارن جا ماهر'
          : 'Pediatrics (Child Specialist)',
    },
    {
      slug: 'gynecology-obstetrics',
      name:
        locale === 'ur'
          ? 'گائناکالوجی و زچگی'
          : locale === 'sd'
          ? 'گائناڪولوجي ۽ ويم'
          : 'Gynecology & Obstetrics',
    },
    {
      slug: 'dental-care',
      name:
        locale === 'ur'
          ? 'ڈینٹل کیئر (دانتوں کا علاج)'
          : locale === 'sd'
          ? 'ڏندن جو علاج'
          : 'Dental Care',
    },
    {
      slug: 'laboratory-diagnostics',
      name:
        locale === 'ur'
          ? 'لیبارٹری اور ٹیسٹ'
          : locale === 'sd'
          ? 'ليبارٽري ۽ ٽيسٽ'
          : 'Laboratory & Diagnostics',
    },
    {
      slug: 'ecg-ultrasound',
      name:
        locale === 'ur'
          ? 'ای سی جی اور الٹراساؤنڈ'
          : locale === 'sd'
          ? 'اي سي جي ۽ الٽراسائونڊ'
          : 'ECG & Ultrasound',
    },
  ];

  return (
    <footer className="bg-surface-footer text-white pt-14 pb-24 lg:pb-10">
      <div className="container-clinic">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/15">
          {/* Column 1: About blurb + logo */}
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white">{clinicDisplayName}</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              {replaceClinicName(labels.aboutBlurb)}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={clinicConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={clinicConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={clinicConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href={getWhatsAppUrl(locale)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-whatsapp hover:opacity-90 flex items-center justify-center transition-opacity"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{labels.quickLinks}</h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link href={`/${locale}`} className="hover:text-white transition-colors">
                  {labels.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
                  {labels.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/doctors`} className="hover:text-white transition-colors">
                  {labels.nav.doctors}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/appointment`}
                  className="hover:text-white transition-colors font-medium text-accent"
                >
                  {labels.nav.appointment}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/gallery`} className="hover:text-white transition-colors">
                  {labels.nav.gallery}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/health-tips`}
                  className="hover:text-white transition-colors"
                >
                  {labels.nav.healthTips}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">
                  {labels.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{labels.ourServices}</h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              {serviceLinks.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${locale}/services/${s.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{labels.contactInfo}</h3>
            <ul className="space-y-3.5 text-sm text-white/85">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{addressText}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a
                  href={`tel:${clinicConfig.phoneClean}`}
                  dir="ltr"
                  className="hover:text-white hover:underline"
                >
                  {clinicConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-whatsapp shrink-0" />
                <a
                  href={getWhatsAppUrl(locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="hover:text-white hover:underline"
                >
                  {clinicConfig.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a
                  href={`mailto:${clinicConfig.email}`}
                  dir="ltr"
                  className="hover:text-white hover:underline break-all"
                >
                  {clinicConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{timingsText}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/75">
          <div className="text-center sm:text-start space-y-1">
            <p>{replaceClinicName(labels.copyright)}</p>
            <p className="text-white/60 text-[11px]">
              Demo website, for presentation only.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
              {labels.privacyLink}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
              {labels.termsLink}
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors opacity-80">
              {labels.nav.admin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
