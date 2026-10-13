import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { PageBanner } from '@/components/ui/PageBanner';
import {
  GalleryMasonryLightbox,
  type GalleryItem,
} from '@/components/sections/GalleryMasonryLightbox';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('galleryTitle'),
    description: tMeta('galleryDescription'),
    alternates: {
      canonical: `/${params.locale}/gallery`,
      languages: { en: '/en/gallery', ur: '/ur/gallery', sd: '/sd/gallery' },
    },
  };
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: '/images/gallery-1.svg',
    category: 'Clinic',
    title: {
      en: 'Main Reception & Family Waiting Lounge',
      ur: 'مرکزی استقبالیہ اور فیملی ویٹنگ لاؤنج',
      sd: 'مرڪزي استقباليه ۽ فيملي ويٽنگ لائونج',
    },
  },
  {
    id: 2,
    src: '/images/gallery-2.svg',
    category: 'Equipment',
    title: {
      en: 'Automated Hematology & Pathology Analyzer',
      ur: 'جدید خودکار پیتھالوجی اور خون کے ٹیسٹ کی مشین',
      sd: 'جديد خودڪار پيٿالوجي ۽ رت جي ٽيسٽ جي مشين',
    },
  },
  {
    id: 3,
    src: '/images/gallery-3.svg',
    category: 'Clinic',
    title: {
      en: 'Senior Physician Consultation Room',
      ur: 'سینیئر فزیشن کنسلٹیشن روم',
      sd: 'سينيئر فزيشن ڪنسلٽيشن روم',
    },
  },
  {
    id: 4,
    src: '/images/gallery-4.svg',
    category: 'Equipment',
    title: {
      en: 'Digital 12-Lead ECG & Cardiac Monitor',
      ur: 'ڈیجیٹل 12 لیڈ ای سی جی اور کارڈیک مانیٹر',
      sd: 'ڊجيٽل 12 ليڊ اي سي جي ۽ ڪارڊيڪ مانيٽر',
    },
  },
  {
    id: 5,
    src: '/images/gallery-5.svg',
    category: 'Equipment',
    title: {
      en: 'Ultrasonic Dental Chair & Sterilization Suite',
      ur: 'الٹراسونک ڈینٹل یونٹ اور اسٹرلائزیشن روم',
      sd: 'الٽراسونڪ ڊينٽل يونٽ ۽ اسٽرلائيزيشن روم',
    },
  },
  {
    id: 6,
    src: '/images/gallery-6.svg',
    category: 'Events',
    title: {
      en: 'Free Community Blood Pressure & Sugar Camp',
      ur: 'مفت بلڈ پریشر اور شوگر چیک اپ کیمپ',
      sd: 'مفت بلڊ پريشر ۽ شوگر چيڪ اپ ڪئمپ',
    },
  },
  {
    id: 7,
    src: '/images/gallery-7.svg',
    category: 'Clinic',
    title: {
      en: 'Child-Friendly Pediatric Examination Suite',
      ur: 'بچوں کے معائنے کا خصوصی کمرہ',
      sd: 'ٻارن جي معائني جو خاص ڪمرو',
    },
  },
  {
    id: 8,
    src: '/images/gallery-8.svg',
    category: 'Equipment',
    title: {
      en: 'High-Resolution 4D Color Doppler Ultrasound',
      ur: 'ہائی ریزولوشن کلر ڈوپلر الٹراساؤنڈ مشین',
      sd: 'هاءِ ريزوليوشن ڪلر ڊاپلر الٽراسائونڊ مشين',
    },
  },
  {
    id: 9,
    src: '/images/gallery-9.svg',
    category: 'Clinic',
    title: {
      en: 'WHO-Standard Cold-Chain Vaccination Center',
      ur: 'کولڈ چین ویکسینیشن سینٹر',
      sd: 'ڪولڊ چين ويڪسينيشن سينٽر',
    },
  },
  {
    id: 10,
    src: '/images/gallery-10.svg',
    category: 'Events',
    title: {
      en: 'Pre-Ramadan Diabetes Management Seminar',
      ur: 'رمضان سے قبل شوگر آگاہی سیمینار',
      sd: 'رمضان کان اڳ شوگر آگاهي سيمينار',
    },
  },
  {
    id: 11,
    src: '/images/gallery-11.svg',
    category: 'Equipment',
    title: {
      en: 'Class-B Vacuum Autoclave Sterilizer',
      ur: 'کلاس بی ویکیوم آٹوکلیو اسٹرلائزر',
      sd: 'ڪلاس بي ويڪيوم آٽو ڪليو اسٽرلائيزر',
    },
  },
  {
    id: 12,
    src: '/images/gallery-12.svg',
    category: 'Events',
    title: {
      en: 'Childhood Dental Hygiene & Dengue Awareness Drive',
      ur: 'بچوں کے دانتوں کی صفائی اور ڈینگی آگاہی مہم',
      sd: 'ٻارن جي ڏندن جي صفائي ۽ ڊينگي آگاهي مهم',
    },
  },
];

export default async function GalleryPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const [tGallery, tNav] = await Promise.all([
    getTranslations({ locale, namespace: 'gallery' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <div>
      <PageBanner
        locale={locale}
        title={tGallery('bannerTitle')}
        subtitle={tGallery('bannerSub')}
        breadcrumbLabel={tNav('gallery')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic">
          <GalleryMasonryLightbox
            locale={locale}
            items={GALLERY_ITEMS}
            labels={{
              catAll: tGallery('catAll'),
              catClinic: tGallery('catClinic'),
              catEquipment: tGallery('catEquipment'),
              catEvents: tGallery('catEvents'),
              closeLightbox: tGallery('closeLightbox'),
              prevImage: tGallery('prevImage'),
              nextImage: tGallery('nextImage'),
            }}
          />
        </div>
      </section>
    </div>
  );
}
