import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { clinicConfig } from '../src/config/clinic';
import { getAllHealthTips } from '../src/lib/blog';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const LOCALES = ['en', 'ur', 'sd'] as const;

export async function runPagesTests() {
  console.log('\n🌐 [1/4] Running Page, Navigation, i18n, RTL & Header Tests...');
  let passed = 0;

  const dbServices = await prisma.service.findMany({ select: { slug: true } });
  const dbDoctors = await prisma.doctor.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  const blogArticles = getAllHealthTips();

  const SERVICE_SLUGS = dbServices.map((s) => s.slug);
  const DOCTOR_SLUGS = dbDoctors.map((d) => d.slug);
  const ARTICLE_SLUGS = blogArticles.map((a) => a.slug);

  assert.equal(SERVICE_SLUGS.length, 8, 'Expected 8 seeded services');
  assert.ok(DOCTOR_SLUGS.length >= 6, 'Expected at least 6 active seeded doctors');
  assert.equal(ARTICLE_SLUGS.length, 6, 'Expected 6 health tip articles');

  // 1. Check security headers on home page
  {
    const res = await fetch(`${BASE_URL}/en`);
    assert.equal(res.status, 200, 'Expected /en to return 200');
    assert.equal(
      res.headers.get('x-powered-by'),
      null,
      'X-Powered-By header should be removed'
    );
    assert.ok(
      res.headers.get('content-security-policy'),
      'Content-Security-Policy header should be present'
    );
    assert.equal(
      res.headers.get('x-content-type-options'),
      'nosniff',
      'X-Content-Type-Options should be nosniff'
    );
    assert.ok(
      res.headers.get('x-frame-options'),
      'X-Frame-Options header should be present'
    );
    assert.ok(
      res.headers.get('referrer-policy'),
      'Referrer-Policy header should be present'
    );
    passed++;
  }

  // 2. Test static and dynamic routes in all 3 languages
  const staticSubRoutes = [
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

  for (const locale of LOCALES) {
    const expectedDir = locale === 'en' ? 'dir="ltr"' : 'dir="rtl"';
    const expectedLang = `lang="${locale}"`;

    await Promise.all(
      staticSubRoutes.map(async (sub) => {
        const url = `${BASE_URL}/${locale}${sub}`;
        const res = await fetch(url);
        assert.equal(res.status, 200, `Expected 200 for ${url}, got ${res.status}`);
        const html = await res.text();
        assert.ok(html.includes(expectedDir), `Expected ${expectedDir} on ${url}`);
        assert.ok(html.includes(expectedLang), `Expected ${expectedLang} on ${url}`);
        assert.ok(
          html.includes('Demo website, for presentation only.'),
          `Expected footer demo notice on ${url}`
        );
        assert.ok(
          html.includes(clinicConfig.phone),
          `Expected clinic phone from clinicConfig on ${url}`
        );
        assert.ok(
          !html.includes('home.hero.slide1Title') &&
            !html.includes('nav.bookAppointment'),
          `Raw translation key leaked on ${url}`
        );
        passed++;
      })
    );

    await Promise.all([
      ...SERVICE_SLUGS.map(async (slug) => {
        const url = `${BASE_URL}/${locale}/services/${slug}`;
        const res = await fetch(url);
        assert.equal(res.status, 200, `Expected 200 for service route ${url}`);
        passed++;
      }),
      ...DOCTOR_SLUGS.map(async (slug) => {
        const url = `${BASE_URL}/${locale}/doctors/${slug}`;
        const res = await fetch(url);
        assert.equal(res.status, 200, `Expected 200 for doctor route ${url}`);
        passed++;
      }),
      ...ARTICLE_SLUGS.map(async (slug) => {
        const url = `${BASE_URL}/${locale}/health-tips/${slug}`;
        const res = await fetch(url);
        assert.equal(res.status, 200, `Expected 200 for article route ${url}`);
        passed++;
      }),
    ]);
  }

  // 3. Test preselected query parameters on /appointment
  {
    const docUrl = `${BASE_URL}/en/appointment?doctor=dr-ayesha-kamran`;
    const docRes = await fetch(docUrl);
    assert.equal(docRes.status, 200);
    const docHtml = await docRes.text();
    assert.ok(
      docHtml.includes('Dr. Ayesha Kamran'),
      'Expected preselected doctor on /en/appointment?doctor=dr-ayesha-kamran'
    );

    const srvUrl = `${BASE_URL}/en/appointment?service=dental-care`;
    const srvRes = await fetch(srvUrl);
    assert.equal(srvRes.status, 200);
    const srvHtml = await srvRes.text();
    assert.ok(
      srvHtml.includes('Dental Care'),
      'Expected preselected service on /en/appointment?service=dental-care'
    );
    passed += 2;
  }

  // 4. Test Admin route, sitemap.xml, robots.txt, and 404 page
  {
    const adminRes = await fetch(`${BASE_URL}/admin`);
    assert.equal(adminRes.status, 200, 'Expected /admin to return 200');

    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    assert.equal(sitemapRes.status, 200, 'Expected /sitemap.xml to return 200');

    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    assert.equal(robotsRes.status, 200, 'Expected /robots.txt to return 200');

    const notFoundRes = await fetch(`${BASE_URL}/en/non-existent-route-98765`);
    assert.equal(notFoundRes.status, 404, 'Expected unknown route to return 404');
    passed += 4;
  }

  console.log(`   ✅ Passed ${passed} page, i18n, RTL, and header checks.`);
}
