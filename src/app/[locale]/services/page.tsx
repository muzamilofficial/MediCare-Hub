import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import type { Locale } from '@/i18n/routing';
import { PageBanner } from '@/components/ui/PageBanner';
import { ServicesFilterList } from '@/components/sections/ServicesFilterList';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('servicesTitle'),
    description: tMeta('servicesDescription'),
    alternates: {
      canonical: `/${params.locale}/services`,
      languages: { en: '/en/services', ur: '/ur/services', sd: '/sd/services' },
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const [tServices, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'services' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div>
      <PageBanner
        locale={locale}
        title={tServices('bannerTitle')}
        subtitle={tServices('bannerSub')}
        breadcrumbLabel={tNav('services')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic">
          <ServicesFilterList
            locale={locale}
            services={services}
            labels={{
              filterAll: tServices('filterAll'),
              filterGeneral: tServices('filterGeneral'),
              filterWomenChild: tServices('filterWomenChild'),
              filterDiagnostics: tServices('filterDiagnostics'),
              filterDental: tServices('filterDental'),
              whatWeTreat: tServices('whatWeTreat'),
              howToPrepare: tServices('howToPrepare'),
              approxFee: tServices('approxFee'),
              fromPkrTemplate: tCommon('fromPkr', { amount: '{amount}' }),
              bookThisService: tCommon('bookThisService'),
              viewDetails: tServices('viewDetails'),
            }}
          />
        </div>
      </section>
    </div>
  );
}
