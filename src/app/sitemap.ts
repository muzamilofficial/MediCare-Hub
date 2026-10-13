import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { getAllHealthTips } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const routes = [
    '',
    '/about',
    '/services',
    '/doctors',
    '/appointment',
    '/gallery',
    '/health-tips',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const articles = getAllHealthTips();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' || route === '/appointment' ? 1.0 : 0.8,
      });
    }

    for (const art of articles) {
      entries.push({
        url: `${baseUrl}/${locale}/health-tips/${art.slug}`,
        lastModified: new Date(art.date),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
