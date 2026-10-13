'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Award,
  Stethoscope,
  CalendarCheck,
  UserCheck,
  Globe,
} from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { formatPKR, localizeField } from '@/lib/utils';

export interface DoctorGridItem {
  id: string;
  slug: string;
  name: string;
  nameUr: string;
  nameSd: string;
  specialty: string;
  specialtyUr: string;
  specialtySd: string;
  serviceSlug: string;
  qualification: string;
  experienceYears: number;
  photo: string;
  fee: number;
  languages: string;
}

interface DoctorsFilterGridProps {
  locale: Locale;
  doctors: DoctorGridItem[];
  labels: {
    searchPlaceholder: string;
    allSpecialties: string;
    noDoctorsFound: string;
    yearsExpTemplate: string;
    bookWithDoctorTemplate: string;
    viewProfile: string;
  };
}

export function DoctorsFilterGrid({
  locale,
  doctors,
  labels,
}: DoctorsFilterGridProps) {
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  const uniqueSpecialties = Array.from(
    new Set(doctors.map((d) => localizeField(d, 'specialty', locale)))
  );

  const filteredDoctors = doctors.filter((doc) => {
    const localName = localizeField(doc, 'name', locale);
    const localSpec = localizeField(doc, 'specialty', locale);
    const matchesSpec = specialtyFilter === 'All' || localSpec === specialtyFilter;
    const q = search.toLowerCase().trim();
    if (!q) return matchesSpec;
    return (
      matchesSpec &&
      (localName.toLowerCase().includes(q) ||
        doc.name.toLowerCase().includes(q) ||
        localSpec.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* Filter bar: search by name + dropdown by specialty (Section 7 Page 4) */}
      <div className="bg-surface-soft p-5 rounded-card border border-surface-border mb-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-7 relative">
          <Search className="w-5 h-5 text-text-secondary absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="input-clinic !pl-11"
          />
        </div>

        <div className="md:col-span-5">
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            aria-label={labels.allSpecialties}
            className="input-clinic"
          >
            <option value="All">{labels.allSpecialties}</option>
            {uniqueSpecialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="card-clinic p-12 text-center text-text-secondary">
          <p className="text-lg font-medium">{labels.noDoctorsFound}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredDoctors.map((doc) => {
            const displayName = localizeField(doc, 'name', locale);
            const displaySpec = localizeField(doc, 'specialty', locale);
            const expText = labels.yearsExpTemplate.replace(
              '{years}',
              String(doc.experienceYears)
            );
            const bookBtnText = labels.bookWithDoctorTemplate.replace(
              '{name}',
              displayName
            );
            let langs: string[] = [];
            try {
              langs = JSON.parse(doc.languages || '[]');
            } catch {
              langs = ['English', 'Urdu'];
            }

            return (
              <article
                key={doc.id}
                className="card-clinic flex flex-col overflow-hidden group"
              >
                <Link
                  href={`/${locale}/doctors/${doc.slug}`}
                  className="relative h-64 w-full bg-surface-soft overflow-hidden block"
                >
                  <Image
                    src={doc.photo}
                    alt={displayName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    dir="ltr"
                    className="absolute top-3.5 right-3.5 px-3.5 py-1 rounded-chip bg-secondary text-white text-xs font-bold shadow-xs"
                  >
                    {formatPKR(doc.fee)}
                  </span>
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5">
                      <Stethoscope className="w-4 h-4 shrink-0" />
                      <span>{displaySpec}</span>
                    </div>
                    <h2 className="heading-h3 text-secondary mb-1">
                      <Link
                        href={`/${locale}/doctors/${doc.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {displayName}
                      </Link>
                    </h2>
                    <p dir="ltr" className="text-xs font-medium text-text-secondary mb-4">
                      {doc.qualification}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-soft px-3 py-2 rounded-lg">
                        <Award className="w-4 h-4 text-primary shrink-0" />
                        <span>{expText}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-soft px-3 py-2 rounded-lg">
                        <Globe className="w-4 h-4 text-primary shrink-0" />
                        <span>{langs.join(' • ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Link
                      href={`/${locale}/appointment?doctor=${doc.slug}`}
                      className="btn-accent w-full !px-4 text-sm"
                    >
                      <CalendarCheck className="w-4 h-4 shrink-0" />
                      <span className="truncate">{bookBtnText}</span>
                    </Link>
                    <Link
                      href={`/${locale}/doctors/${doc.slug}`}
                      className="btn-outline w-full !min-h-[42px] !px-4 text-xs"
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>{labels.viewProfile}</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
