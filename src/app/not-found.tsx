import Link from 'next/link';
import { HeartPulse, Home, CalendarCheck } from 'lucide-react';
import { clinicConfig } from '@/config/clinic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-soft px-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-6">
        <HeartPulse className="w-9 h-9" />
      </div>
      <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
        404 — Page Not Found
      </p>
      <h1 className="heading-h2 text-secondary mb-3">
        We couldn&apos;t find the page you were looking for
      </h1>
      <p className="text-text-secondary max-w-md mb-8">
        The link may be outdated or the page may have moved. You can return to the{' '}
        {clinicConfig.name} homepage or book an appointment directly below.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/en" className="btn-primary">
          <Home className="w-5 h-5" />
          <span>Go Home</span>
        </Link>
        <Link href="/en/appointment" className="btn-accent">
          <CalendarCheck className="w-5 h-5" />
          <span>Book Appointment</span>
        </Link>
      </div>
    </div>
  );
}
