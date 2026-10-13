import React from 'react';
import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { clinicConfig } from '@/config/clinic';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Staff Admin Portal | ${clinicConfig.name}`,
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const authenticated = isAdminAuthenticated();
  return <AdminDashboardClient initiallyAuthenticated={authenticated} />;
}
