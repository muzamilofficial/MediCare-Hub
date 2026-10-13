'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Bot,
  LogOut,
  Search,
  Download,
  MessageCircle,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Lock,
  Loader2,
  Home,
} from 'lucide-react';
import { clinicConfig } from '@/config/clinic';
import { formatPKR, getKarachiDateString } from '@/lib/utils';

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No-show',
];

const DEFAULT_SLOTS_TEXT =
  '09:00 AM, 09:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM, 05:00 PM, 05:30 PM, 06:00 PM, 06:30 PM, 07:00 PM';

function formatPatientPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('03') && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  if (digits.startsWith('923') && digits.length === 12) {
    return digits;
  }
  return digits;
}

export function AdminDashboardClient({
  initiallyAuthenticated,
}: {
  initiallyAuthenticated: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'appointments' | 'doctors' | 'messages' | 'leads'
  >('appointments');

  const [loadingData, setLoadingData] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // Appointment filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Doctor modal / editor state
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docQualification, setDocQualification] = useState('');
  const [docServiceSlug, setDocServiceSlug] = useState('general-physician');
  const [docExp, setDocExp] = useState('10');
  const [docFee, setDocFee] = useState('1800');
  const [docBio, setDocBio] = useState('');
  const [docWeekdaySlots, setDocWeekdaySlots] = useState(DEFAULT_SLOTS_TEXT);
  const [docSundaySlots, setDocSundaySlots] = useState('10:00 AM, 10:30 AM, 11:00 AM');

  const fetchAdminData = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setAppointments(data.appointments || []);
      setDoctors(data.doctors || []);
      setServices(data.services || []);
      setMessages(data.messages || []);
      setLeads(data.leads || []);
    } catch {
      // ignore
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAdminData();
    }
  }, [authenticated, fetchAdminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Invalid credentials');
        setLoggingIn(false);
        return;
      }
      setAuthenticated(true);
    } catch {
      setLoginError('Network error');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'appointment_status', id, status }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Reference',
      'Date',
      'TimeSlot',
      'PatientName',
      'Phone',
      'Doctor',
      'Service',
      'FeePKR',
      'Status',
      'Source',
    ];
    const rows = filteredAppointments.map((a) => [
      a.reference,
      a.date,
      a.timeSlot,
      `"${(a.patientName || '').replace(/"/g, '""')}"`,
      a.phone,
      `"${(a.doctor?.name || '').replace(/"/g, '""')}"`,
      `"${(a.service?.title || '').replace(/"/g, '""')}"`,
      a.doctor?.fee || '',
      a.status,
      a.source,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `medicare-appointments-${getKarachiDateString(0)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openAddDoctor = () => {
    setEditingDoctor(null);
    setDocName('');
    setDocSpecialty('');
    setDocQualification('MBBS, FCPS');
    setDocServiceSlug(services[0]?.slug || 'general-physician');
    setDocExp('10');
    setDocFee('1800');
    setDocBio('');
    setDocWeekdaySlots(DEFAULT_SLOTS_TEXT);
    setDocSundaySlots('10:00 AM, 10:30 AM, 11:00 AM');
    setShowDoctorForm(true);
  };

  const openEditDoctor = (doc: any) => {
    setEditingDoctor(doc);
    setDocName(doc.name);
    setDocSpecialty(doc.specialty);
    setDocQualification(doc.qualification);
    setDocServiceSlug(doc.serviceSlug || 'general-physician');
    setDocExp(String(doc.experienceYears));
    setDocFee(String(doc.fee));
    setDocBio(doc.bio);
    try {
      const avail = JSON.parse(doc.availability || '{}');
      setDocWeekdaySlots((avail.Monday || []).join(', '));
      setDocSundaySlots((avail.Sunday || []).join(', '));
    } catch {
      setDocWeekdaySlots(DEFAULT_SLOTS_TEXT);
      setDocSundaySlots('');
    }
    setShowDoctorForm(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const parseSlots = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const wSlots = parseSlots(docWeekdaySlots);
    const sSlots = parseSlots(docSundaySlots);

    const availability = {
      Monday: wSlots,
      Tuesday: wSlots,
      Wednesday: wSlots,
      Thursday: wSlots,
      Friday: wSlots,
      Saturday: wSlots,
      Sunday: sSlots,
    };

    const res = await fetch('/api/admin/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingDoctor?.id,
        name: docName,
        specialty: docSpecialty,
        qualification: docQualification,
        serviceSlug: docServiceSlug,
        experienceYears: Number(docExp),
        fee: Number(docFee),
        bio: docBio,
        photo: editingDoctor?.photo || '/images/doctor-1.svg',
        availability,
      }),
    });

    if (res.ok) {
      setShowDoctorForm(false);
      await fetchAdminData();
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    const res = await fetch(`/api/admin/doctors?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    }
  };

  // Render Login Screen if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center p-5">
        <div className="card-clinic max-w-md w-full p-8 border-t-4 border-t-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">
                {clinicConfig.name} — Staff Admin
              </h1>
              <p className="text-xs text-text-secondary">
                Sign in to manage appointments, doctors & leads
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-user"
                className="block text-xs font-bold uppercase text-secondary mb-1.5"
              >
                Admin Username
              </label>
              <input
                id="admin-user"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="input-clinic"
              />
            </div>

            <div>
              <label
                htmlFor="admin-pass"
                className="block text-xs font-bold uppercase text-secondary mb-1.5"
              >
                Admin Password
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-clinic"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="btn-primary w-full"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Admin Panel</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-border text-center">
            <Link
              href="/en"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Clinic Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Metrics Calculation (Asia/Karachi timezone)
  const todayStr = getKarachiDateString(0);
  const weekAgoStr = getKarachiDateString(-7);

  const todaysCount = appointments.filter((a) => a.date === todayStr).length;
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const weekTotalCount = appointments.filter((a) => a.date >= weekAgoStr).length;

  const filteredAppointments = appointments.filter((a) => {
    if (dateFilter && a.date !== dateFilter) return false;
    if (doctorFilter !== 'ALL' && a.doctorId !== doctorFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (a.patientName || '').toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q) ||
      (a.reference || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Admin Topbar */}
      <header className="bg-secondary text-white py-4 px-5 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {clinicConfig.name} — Staff Admin Portal
              </h1>
              <p className="text-xs text-white/75">
                Appointments, Doctors, Contact Inbox & Chatbot Leads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/en"
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              View Website
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-error hover:opacity-90 text-xs font-semibold text-white transition-opacity"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-5 lg:p-8 space-y-8">
        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card-clinic p-6 border-l-4 border-l-primary flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-text-secondary mb-1">
                Today&apos;s Appointments ({todayStr})
              </p>
              <p className="text-3xl font-extrabold text-secondary">{todaysCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="card-clinic p-6 border-l-4 border-l-warning flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-text-secondary mb-1">
                Pending Confirmation
              </p>
              <p className="text-3xl font-extrabold text-warning">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="card-clinic p-6 border-l-4 border-l-success flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-text-secondary mb-1">
                Total This Week
              </p>
              <p className="text-3xl font-extrabold text-success">{weekTotalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/15 text-success flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-surface-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'appointments'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-secondary hover:bg-primary-light'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments ({appointments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'doctors'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-secondary hover:bg-primary-light'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Doctors Manager ({doctors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'messages'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-secondary hover:bg-primary-light'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages Inbox ({messages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'leads'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-secondary hover:bg-primary-light'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Chatbot Leads ({leads.length})</span>
          </button>
        </div>

        {loadingData && (
          <div className="p-8 text-center text-primary flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading records...</span>
          </div>
        )}

        {/* TAB 1: APPOINTMENTS TABLE */}
        {activeTab === 'appointments' && (
          <div className="card-clinic p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-text-secondary absolute top-1/2 -translate-y-1/2 left-3.5" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone, ref..."
                    className="input-clinic !pl-9 !min-h-[42px] text-sm"
                  />
                </div>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-clinic !min-h-[42px] text-sm"
                />

                <select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="input-clinic !min-h-[42px] text-sm"
                >
                  <option value="ALL">All Doctors</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-clinic !min-h-[42px] text-sm"
                >
                  <option value="ALL">All Statuses</option>
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="btn-outline !min-h-[42px] !px-4 text-xs shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-soft border-b border-surface-border text-left text-xs uppercase text-text-secondary">
                    <th className="py-3.5 px-3">Ref & Source</th>
                    <th className="py-3.5 px-3">Date & Slot</th>
                    <th className="py-3.5 px-3">Patient</th>
                    <th className="py-3.5 px-3">Doctor & Service</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3 text-right">1-Click WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => {
                    const waPhone = formatPatientPhoneForWhatsApp(apt.phone || '');
                    const waPrefilled = `Assalam-o-Alaikum ${apt.patientName}, your appointment (${apt.reference}) with ${apt.doctor?.name} at ${clinicConfig.name} on ${apt.date} at ${apt.timeSlot} is CONFIRMED. Location: ${clinicConfig.address.en}.`;
                    const waHref = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                      waPrefilled
                    )}`;

                    return (
                      <tr
                        key={apt.id}
                        className="border-b border-surface-border hover:bg-surface-soft/50"
                      >
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-secondary block">
                            {apt.reference}
                          </span>
                          <span className="text-[11px] uppercase px-2 py-0.5 rounded-chip bg-primary-light text-primary font-semibold">
                            {apt.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-secondary block">
                            {apt.date}
                          </span>
                          <span className="text-xs text-primary font-semibold">
                            {apt.timeSlot}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-secondary block">
                            {apt.patientName}
                          </span>
                          <span className="text-xs text-text-secondary block">
                            {apt.phone}
                          </span>
                          {apt.reason && (
                            <span className="text-xs text-text-secondary italic block max-w-xs truncate">
                              &ldquo;{apt.reason}&rdquo;
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-secondary block">
                            {apt.doctor?.name}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {apt.service?.title} ({formatPKR(apt.doctor?.fee || 1500)})
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={apt.status}
                            onChange={(e) =>
                              handleStatusChange(apt.id, e.target.value)
                            }
                            aria-label={`Status for ${apt.reference}`}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                              apt.status === 'Confirmed'
                                ? 'bg-success/15 text-success border-success/30'
                                : apt.status === 'Pending'
                                ? 'bg-warning/15 text-warning border-warning/30'
                                : apt.status === 'Cancelled'
                                ? 'bg-error/15 text-error border-error/30'
                                : 'bg-surface-soft text-secondary border-surface-border'
                            }`}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-whatsapp text-white text-xs font-bold hover:opacity-90"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Patient</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DOCTORS MANAGER */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="heading-h3 text-secondary">
                Clinic Doctors & Weekly Availability
              </h2>
              <button
                type="button"
                onClick={openAddDoctor}
                className="btn-primary !min-h-[42px] !px-4 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Doctor</span>
              </button>
            </div>

            {showDoctorForm && (
              <form
                onSubmit={handleSaveDoctor}
                className="card-clinic p-6 border-t-4 border-t-primary space-y-4"
              >
                <h3 className="font-bold text-secondary text-lg">
                  {editingDoctor ? `Edit ${editingDoctor.name}` : 'Add New Doctor'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="input-clinic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Specialty *
                    </label>
                    <input
                      type="text"
                      required
                      value={docSpecialty}
                      onChange={(e) => setDocSpecialty(e.target.value)}
                      className="input-clinic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Qualification *
                    </label>
                    <input
                      type="text"
                      required
                      value={docQualification}
                      onChange={(e) => setDocQualification(e.target.value)}
                      className="input-clinic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Service Department
                    </label>
                    <select
                      value={docServiceSlug}
                      onChange={(e) => setDocServiceSlug(e.target.value)}
                      className="input-clinic"
                    >
                      {services.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      required
                      value={docExp}
                      onChange={(e) => setDocExp(e.target.value)}
                      className="input-clinic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Consultation Fee (PKR)
                    </label>
                    <input
                      type="number"
                      required
                      value={docFee}
                      onChange={(e) => setDocFee(e.target.value)}
                      className="input-clinic"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">
                    Short Bio
                  </label>
                  <textarea
                    rows={2}
                    value={docBio}
                    onChange={(e) => setDocBio(e.target.value)}
                    className="input-clinic"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Mon–Sat 30-Min Slots (comma separated)
                    </label>
                    <input
                      type="text"
                      value={docWeekdaySlots}
                      onChange={(e) => setDocWeekdaySlots(e.target.value)}
                      className="input-clinic text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">
                      Sunday 30-Min Slots (comma separated, or empty if off)
                    </label>
                    <input
                      type="text"
                      value={docSundaySlots}
                      onChange={(e) => setDocSundaySlots(e.target.value)}
                      className="input-clinic text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDoctorForm(false)}
                    className="btn-outline !min-h-[42px] !px-4 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary !min-h-[42px] !px-5 text-sm"
                  >
                    Save Doctor
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="card-clinic p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-secondary text-base">
                        {doc.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-chip bg-primary-light text-primary text-xs font-bold shrink-0">
                        {formatPKR(doc.fee)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary mb-1">
                      {doc.specialty}
                    </p>
                    <p className="text-xs text-text-secondary mb-3">
                      {doc.qualification} • {doc.experienceYears} yrs exp
                    </p>
                  </div>

                  <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditDoctor(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-primary-light text-secondary text-xs font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoctor(doc.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error text-xs font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT MESSAGES INBOX */}
        {activeTab === 'messages' && (
          <div className="card-clinic p-6">
            <h2 className="heading-h3 text-secondary mb-4">
              Contact Form Submissions
            </h2>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl bg-surface-soft border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-secondary">{msg.name}</span>
                      <span className="text-xs text-primary font-semibold">
                        ({msg.phone})
                      </span>
                      <span className="px-2 py-0.5 rounded-chip bg-white border border-surface-border text-xs font-semibold">
                        {msg.subject}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary">{msg.message}</p>
                  </div>
                  <a
                    href={`https://wa.me/${formatPatientPhoneForWhatsApp(
                      msg.phone
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-whatsapp text-white text-xs font-bold shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Reply on WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CHATBOT LEADS */}
        {activeTab === 'leads' && (
          <div className="card-clinic p-6">
            <h2 className="heading-h3 text-secondary mb-4">
              Chatbot Leads (Callback & Lab Report Requests)
            </h2>
            <div className="space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-xl bg-surface-soft border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-secondary">
                        {lead.name || 'Visitor'}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {lead.phone}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-chip bg-primary-light text-primary text-xs font-bold uppercase">
                        {lead.type}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">{lead.details}</p>
                  </div>
                  <a
                    href={`https://wa.me/${formatPatientPhoneForWhatsApp(
                      lead.phone
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-whatsapp text-white text-xs font-bold shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Lead</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
