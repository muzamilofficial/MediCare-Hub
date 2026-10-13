'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ClipboardCheck, CalendarCheck, ArrowRight, Search } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { formatPKR, localizeField } from '@/lib/utils';
import { ServiceIcon } from '@/components/ui/ServiceIcon';

export interface ServiceItemData {
  id: string;
  slug: string;
  title: string;
  titleUr: string;
  titleSd: string;
  description: string;
  descriptionUr: string;
  descriptionSd: string;
  whatWeTreat: string;
  howToPrepare: string;
  feeFrom: number;
  category: string;
  icon: string;
}

interface ServicesFilterListProps {
  locale: Locale;
  services: ServiceItemData[];
  labels: {
    filterAll: string;
    filterGeneral: string;
    filterWomenChild: string;
    filterDiagnostics: string;
    filterDental: string;
    whatWeTreat: string;
    howToPrepare: string;
    approxFee: string;
    fromPkrTemplate: string;
    bookThisService: string;
    viewDetails: string;
  };
}

export function ServicesFilterList({
  locale,
  services,
  labels,
}: ServicesFilterListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { key: 'All', label: labels.filterAll },
    { key: 'General', label: labels.filterGeneral },
    { key: 'Women & Child', label: labels.filterWomenChild },
    { key: 'Diagnostics', label: labels.filterDiagnostics },
    { key: 'Dental', label: labels.filterDental },
  ];

  const filtered = services.filter((srv) => {
    const matchesCategory =
      selectedCategory === 'All' || srv.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const title = localizeField(srv, 'title', locale).toLowerCase();
    const desc = localizeField(srv, 'description', locale).toLowerCase();
    return (
      matchesCategory &&
      (title.includes(q) || desc.includes(q) || srv.title.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* Filter Chips Row + Search Bar (Section 7 Page 3) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 bg-surface-soft p-4 rounded-card border border-surface-border">
        <div
          role="tablist"
          aria-label="Service Categories"
          className="flex flex-wrap items-center gap-2"
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat.key)}
                className={`min-h-[42px] px-4 py-2 rounded-chip text-sm font-semibold transition-all ${
                  active
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-text-secondary border border-surface-border hover:border-primary hover:text-primary'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-text-secondary absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === 'ur'
                ? 'سروس تلاش کریں...'
                : locale === 'sd'
                ? 'سروس ڳوليو...'
                : 'Search service...'
            }
            className="input-clinic !pl-10 !min-h-[42px] text-sm"
          />
        </div>
      </div>

      {/* Detailed Service Sections with Anchor Links (Section 7 Page 3) */}
      <div className="space-y-8">
        {filtered.map((srv) => {
          const title = localizeField(srv, 'title', locale);
          const desc = localizeField(srv, 'description', locale);
          let treatList: string[] = [];
          let prepList: string[] = [];
          try {
            treatList = JSON.parse(srv.whatWeTreat || '[]');
            prepList = JSON.parse(srv.howToPrepare || '[]');
          } catch {
            treatList = [];
            prepList = [];
          }

          return (
            <article
              key={srv.id}
              id={srv.slug}
              className="card-clinic p-6 lg:p-8 scroll-mt-28"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-surface-border">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                    <ServiceIcon name={srv.icon} className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {srv.category}
                    </span>
                    <h2 className="heading-h3 text-secondary mt-0.5">{title}</h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-surface-soft px-4 py-2 rounded-xl border border-surface-border">
                    <span className="block text-[11px] text-text-secondary">
                      {labels.approxFee}
                    </span>
                    <span dir="ltr" className="text-base font-bold text-secondary">
                      {labels.fromPkrTemplate.replace(
                        '{amount}',
                        srv.feeFrom.toLocaleString('en-US')
                      )}
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/appointment?service=${srv.slug}`}
                    className="btn-accent !px-5"
                  >
                    <CalendarCheck className="w-4 h-4 shrink-0" />
                    <span>{labels.bookThisService}</span>
                  </Link>
                </div>
              </div>

              <p className="text-text-secondary mt-5 mb-6 leading-relaxed">{desc}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* What We Treat */}
                <div className="bg-surface-soft p-5 rounded-xl border border-surface-border">
                  <h3 className="text-base font-bold text-secondary mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span>{labels.whatWeTreat}</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {treatList.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How to Prepare */}
                <div className="bg-surface-soft p-5 rounded-xl border border-surface-border">
                  <h3 className="text-base font-bold text-secondary mb-3 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-primary shrink-0" />
                    <span>{labels.howToPrepare}</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {prepList.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-surface-border flex justify-end">
                <Link
                  href={`/${locale}/services/${srv.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <span>{labels.viewDetails}</span>
                  <ArrowRight className="w-4 h-4 rtl-flip" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
