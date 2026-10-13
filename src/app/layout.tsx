import type { Metadata } from 'next';
import {
  Poppins,
  Inter,
  Noto_Nastaliq_Urdu,
  Noto_Naskh_Arabic,
} from 'next/font/google';
import './globals.css';
import { clinicConfig } from '@/config/clinic';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const notoUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-urdu',
  display: 'swap',
});

const notoSindhi = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-sindhi',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: `${clinicConfig.name} — ${clinicConfig.tagline.en}`,
    template: `%s | ${clinicConfig.name}`,
  },
  description:
    'Book experienced doctors in 60 seconds at MediCare Hub, Clifton Karachi. General Physician, Pediatrics, Gynecology, Dental, Laboratory & Ultrasound.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable} ${notoUrdu.variable} ${notoSindhi.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-surface text-text-primary">
        {children}
      </body>
    </html>
  );
}
