import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageBannerProps {
  locale: string;
  title: string;
  subtitle?: string;
  breadcrumbLabel: string;
  homeLabel: string;
}

export function PageBanner({
  locale,
  title,
  subtitle,
  breadcrumbLabel,
  homeLabel,
}: PageBannerProps) {
  return (
    <section className="bg-cta-gradient text-white py-12 lg:py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }}
      />
      <div className="container-clinic relative z-10">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-2 text-sm text-white/85">
            <li>
              <Link
                href={`/${locale}`}
                className="hover:text-white underline-offset-4 hover:underline transition-colors"
              >
                {homeLabel}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-4 h-4 rtl-flip opacity-75" />
            </li>
            <li className="font-semibold text-white" aria-current="page">
              {breadcrumbLabel}
            </li>
          </ol>
        </nav>
        <h1 className="heading-h1 text-white mb-3">{title}</h1>
        {subtitle && (
          <p className="text-white/90 text-base lg:text-lg max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
