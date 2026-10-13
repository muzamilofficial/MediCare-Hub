import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

import { getAllHealthTips } from '@/lib/blog';
import type { Locale } from '@/i18n/routing';
import { localizeField } from '@/lib/utils';
import { PageBanner } from '@/components/ui/PageBanner';
import { FadeInSection } from '@/components/ui/FadeInSection';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: tMeta('healthTipsTitle'),
    description: tMeta('healthTipsDescription'),
    alternates: {
      canonical: `/${params.locale}/health-tips`,
      languages: {
        en: '/en/health-tips',
        ur: '/ur/health-tips',
        sd: '/sd/health-tips',
      },
    },
  };
}

export default async function HealthTipsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const [tTips, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'healthTips' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const articles = getAllHealthTips();

  return (
    <div>
      <PageBanner
        locale={locale}
        title={tTips('bannerTitle')}
        subtitle={tTips('bannerSub')}
        breadcrumbLabel={tNav('healthTips')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {articles.map((art, idx) => {
              const title = localizeField(art, 'title', locale);
              const excerpt = localizeField(art, 'excerpt', locale);
              return (
                <FadeInSection key={art.slug} delay={idx * 0.05}>
                  <article className="card-clinic h-full flex flex-col overflow-hidden group">
                    <Link
                      href={`/${locale}/health-tips/${art.slug}`}
                      className="relative h-52 w-full bg-surface-soft overflow-hidden block"
                    >
                      <Image
                        src={art.image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-chip bg-primary text-white text-xs font-bold shadow-xs">
                        {art.category}
                      </span>
                    </Link>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
                          <span className="inline-flex items-center gap-1" dir="ltr">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {art.date}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {tTips('readTime', { minutes: art.readTime })}
                          </span>
                        </div>

                        <h2 className="heading-h3 text-secondary mb-2.5">
                          <Link
                            href={`/${locale}/health-tips/${art.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {title}
                          </Link>
                        </h2>

                        <p className="text-sm text-text-secondary line-clamp-3 mb-5">
                          {excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-surface-border flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{art.author}</span>
                        </span>

                        <Link
                          href={`/${locale}/health-tips/${art.slug}`}
                          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline shrink-0"
                        >
                          <span>{tCommon('readMore')}</span>
                          <ArrowRight className="w-4 h-4 rtl-flip" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
