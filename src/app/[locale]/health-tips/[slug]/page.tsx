import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Calendar, Clock, User, ArrowLeft, CalendarCheck } from 'lucide-react';

import { getHealthTipBySlug, getAllHealthTips } from '@/lib/blog';
import type { Locale } from '@/i18n/routing';
import { localizeField } from '@/lib/utils';
import { PageBanner } from '@/components/ui/PageBanner';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const art = getHealthTipBySlug(params.slug);
  if (!art) return { title: 'Article Not Found' };
  return {
    title: localizeField(art, 'title', params.locale),
    description: localizeField(art, 'excerpt', params.locale),
  };
}

function renderMarkdownBlocks(markdown: string) {
  const blocks = markdown.split(/\r?\n\r?\n/);
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-lg font-bold text-secondary mt-5 mb-2">
          {trimmed.slice(5)}
        </h4>
      );
    }

    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="heading-h3 text-secondary mt-7 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
    }

    if (
      trimmed
        .split(/\r?\n/)
        .every((l) => l.trim().startsWith('- ') || l.trim().startsWith('1. ') || /^\d+\.\s/.test(l.trim()))
    ) {
      const lines = trimmed.split(/\r?\n/);
      return (
        <ul key={idx} className="space-y-2.5 my-4 pl-5 list-disc text-text-primary">
          {lines.map((line, lIdx) => {
            const cleanLine = line
              .trim()
              .replace(/^(-|\d+\.)\s+/, '')
              .replace(/\*\*(.*?)\*\*/g, '$1');
            return (
              <li key={lIdx} className="leading-relaxed">
                {cleanLine}
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <p key={idx} className="text-text-primary leading-relaxed my-4">
        {trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
      </p>
    );
  });
}

export default async function HealthTipArticlePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = params.locale as Locale;
  const art = getHealthTipBySlug(params.slug);
  if (!art) {
    notFound();
  }

  const [tTips, tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'healthTips' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const title = localizeField(art, 'title', locale);
  const excerpt = localizeField(art, 'excerpt', locale);
  const otherArticles = getAllHealthTips()
    .filter((a) => a.slug !== art.slug)
    .slice(0, 3);

  return (
    <div>
      <PageBanner
        locale={locale}
        title={title}
        subtitle={excerpt}
        breadcrumbLabel={tNav('healthTips')}
        homeLabel={tNav('home')}
      />

      <section className="section-padding">
        <div className="container-clinic">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Link
                href={`/${locale}/health-tips`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4 rtl-flip" />
                <span>{tNav('healthTips')}</span>
              </Link>
            </div>

            <article className="card-clinic p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pb-6 mb-6 border-b border-surface-border">
                <span className="px-3 py-1 rounded-chip bg-primary-light text-primary font-bold">
                  {art.category}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-secondary">
                  <User className="w-4 h-4 text-primary" />
                  {tTips('byAuthor', { author: `${art.author} (${art.authorRole})` })}
                </span>
                <span className="inline-flex items-center gap-1" dir="ltr">
                  <Calendar className="w-4 h-4 text-primary" />
                  {tTips('publishedOn', { date: art.date })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  {tTips('readTime', { minutes: art.readTime })}
                </span>
              </div>

              <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden bg-surface-soft mb-8">
                <Image
                  src={art.image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>

              {/* Article Body (English medical guide + localized summary) */}
              <div className="prose max-w-none">{renderMarkdownBlocks(art.content)}</div>

              {/* [Book a Consultation] CTA at the end of every article (Section 7 Page 7) */}
              <div className="mt-10 p-6 lg:p-8 rounded-2xl bg-cta-gradient text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="heading-h3 text-white mb-1.5">
                    {tTips('ctaBoxTitle')}
                  </h3>
                  <p className="text-white/90 text-sm">{tTips('ctaBoxDesc')}</p>
                </div>
                <Link
                  href={`/${locale}/appointment?service=${art.serviceSlug}`}
                  className="btn-accent shrink-0"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>{tCommon('bookConsultation')}</span>
                </Link>
              </div>
            </article>

            {/* Related Articles */}
            {otherArticles.length > 0 && (
              <div className="mt-12">
                <h3 className="heading-h3 text-secondary mb-5">
                  {tNav('healthTips')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {otherArticles.map((oa) => (
                    <Link
                      key={oa.slug}
                      href={`/${locale}/health-tips/${oa.slug}`}
                      className="card-clinic p-4 hover:border-primary transition-colors block"
                    >
                      <span className="text-[11px] font-bold text-primary block mb-1">
                        {oa.category}
                      </span>
                      <h4 className="font-bold text-secondary text-sm line-clamp-2">
                        {localizeField(oa, 'title', locale)}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
