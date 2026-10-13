'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Loader2,
  Edit3,
  Download,
  MessageCircle,
  Home,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { clinicConfig, getWhatsAppUrl } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';
import { isValidPakPhone, isValidPersonName } from '@/lib/security';
import { formatPKR, getKarachiDateString, localizeField } from '@/lib/utils';

export interface BookingDoctorOption {
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
  photo: string;
  fee: number;
}

export interface BookingServiceOption {
  id: string;
  slug: string;
  title: string;
  titleUr: string;
  titleSd: string;
  feeFrom: number;
}

interface AppointmentWizardProps {
  locale: Locale;
  services: BookingServiceOption[];
  doctors: BookingDoctorOption[];
  initialServiceSlug?: string;
  initialDoctorSlug?: string;
  labels: Record<string, any>;
}

function parseSlotTo24Hour(dateStr: string, slotStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const match = slotStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let hours = 10;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }
  const start = new Date(y, m - 1, d, hours, minutes, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { start, end };
}

function formatIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(
    d.getHours()
  )}${pad(d.getMinutes())}00`;
}

export function AppointmentWizard({
  locale,
  services,
  doctors,
  initialServiceSlug,
  initialDoctorSlug,
  labels,
}: AppointmentWizardProps) {
  const todayStr = getKarachiDateString(0);

  // Resolve initial preselection from URL query params (?service=slug or ?doctor=slug)
  const preselectedDoc = initialDoctorSlug
    ? doctors.find((d) => d.slug === initialDoctorSlug)
    : undefined;
  const preselectedSrv = initialServiceSlug
    ? services.find((s) => s.slug === initialServiceSlug)
    : preselectedDoc
    ? services.find((s) => s.slug === preselectedDoc.serviceSlug)
    : services[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [serviceId, setServiceId] = useState<string>(preselectedSrv?.id || services[0]?.id || '');
  const [doctorId, setDoctorId] = useState<string>(
    preselectedDoc?.id || 'ANY'
  );
  const [date, setDate] = useState<string>(todayStr);
  const [timeSlot, setTimeSlot] = useState<string>('');

  // Slots state from server
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Patient Details state
  const [patientName, setPatientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [reason, setReason] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);

  // Validation & Submission state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reference: string;
    serviceTitle: string;
    doctorName: string;
    date: string;
    timeSlot: string;
    patientName: string;
    phone: string;
    fee: number;
  } | null>(null);

  const selectedService = services.find((s) => s.id === serviceId) || services[0];

  // Doctors filtered by selected service
  const filteredDoctors = doctors.filter(
    (d) => !selectedService || d.serviceSlug === selectedService.slug
  );
  const availableDoctorsList =
    filteredDoctors.length > 0 ? filteredDoctors : doctors;

  // Resolved concrete doctor (when 'ANY' is selected, pick first available doctor for the service)
  const resolvedDoctor =
    doctorId === 'ANY'
      ? availableDoctorsList[0] || doctors[0]
      : doctors.find((d) => d.id === doctorId) || availableDoctorsList[0] || doctors[0];

  // Keep doctor aligned when service changes
  const handleServiceChange = (newServiceId: string) => {
    setServiceId(newServiceId);
    const srv = services.find((s) => s.id === newServiceId);
    if (srv) {
      const matchingDocs = doctors.filter((d) => d.serviceSlug === srv.slug);
      if (
        doctorId !== 'ANY' &&
        matchingDocs.length > 0 &&
        !matchingDocs.some((d) => d.id === doctorId)
      ) {
        setDoctorId(matchingDocs[0].id);
      }
    }
    setTimeSlot('');
  };

  // Load slots whenever resolvedDoctor or date changes
  const loadSlots = useCallback(async () => {
    if (!resolvedDoctor?.id || !date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/appointments/slots?doctorId=${encodeURIComponent(
          resolvedDoctor.id
        )}&date=${encodeURIComponent(date)}`
      );
      const data = await res.json();
      setAllSlots(data.allSlots || []);
      setBookedSlots(data.bookedSlots || []);
      if (timeSlot && (data.bookedSlots || []).includes(timeSlot)) {
        setTimeSlot('');
      }
    } catch {
      setAllSlots([]);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [resolvedDoctor?.id, date, timeSlot]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Step validity checks
  const isStep1Valid = Boolean(serviceId && resolvedDoctor?.id);
  const isStep2Valid = Boolean(
    date &&
      date >= todayStr &&
      timeSlot &&
      !bookedSlots.includes(timeSlot)
  );

  const nameError = !isValidPersonName(patientName)
    ? labels.errors.nameRequired
    : '';
  const phoneError = !isValidPakPhone(phone) ? labels.errors.phoneInvalid : '';
  const emailError =
    email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? labels.errors.emailInvalid
      : '';
  const ageNum = age.trim() === '' ? null : Number(age);
  const ageError =
    ageNum !== null &&
    (!Number.isFinite(ageNum) ||
      !Number.isInteger(ageNum) ||
      ageNum < 1 ||
      ageNum > 120)
      ? labels.errors.ageInvalid || 'Please enter a valid age between 1 and 120.'
      : '';
  const consentError = !consent ? labels.errors.consentRequired : '';

  const isStep3Valid = Boolean(
    !nameError && !phoneError && !emailError && !ageError && !consentError
  );

  const handleConfirmSubmit = async () => {
    if (submitting || !isStep1Valid || !isStep2Valid || !isStep3Valid) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          doctorId: resolvedDoctor.id,
          date,
          timeSlot,
          patientName: patientName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          age: ageNum,
          gender,
          reason: reason.trim(),
          source: 'web',
          consent: Boolean(consent),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'SLOT_TAKEN') {
          setSubmitError(labels.errors.slotTaken);
          await loadSlots();
          setStep(2);
        } else if (data.code === 'RATE_LIMITED') {
          setSubmitError(labels.errors.rateLimit);
        } else {
          setSubmitError(data.error || 'Booking failed.');
        }
        setSubmitting(false);
        return;
      }

      setConfirmedBooking({
        reference: data.appointment.reference,
        serviceTitle: localizeField(selectedService, 'title', locale),
        doctorName: localizeField(resolvedDoctor, 'name', locale),
        date,
        timeSlot,
        patientName: data.appointment.patientName,
        phone: data.appointment.phone,
        fee: resolvedDoctor.fee,
      });
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!confirmedBooking) return;
    const { start, end } = parseSlotTo24Hour(
      confirmedBooking.date,
      confirmedBooking.timeSlot
    );
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MediCare Hub//Appointment//EN',
      'BEGIN:VEVENT',
      `UID:${confirmedBooking.reference}@medicarehub.pk`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:Doctor Appointment - ${confirmedBooking.doctorName} (${clinicConfig.name})`,
      `DESCRIPTION:Booking Reference: ${confirmedBooking.reference}\\nService: ${confirmedBooking.serviceTitle}\\nPatient: ${confirmedBooking.patientName}\\nPhone: ${clinicConfig.phone}`,
      `LOCATION:${clinicConfig.address.en}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${confirmedBooking.reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Next 5 quick dates for easy 1-tap mobile selection (Asia/Karachi timezone)
  const quickDates = Array.from({ length: 5 }, (_, idx) => {
    const iso = getKarachiDateString(idx);
    const [y, m, day] = iso.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
    const dayShort = d.toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    });
    const monthDay = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    return { iso, dayShort, monthDay, isToday: idx === 0 };
  });

  // Render Success Screen if booking is confirmed (Section 7 Page 5)
  if (confirmedBooking) {
    const waText = `Assalam-o-Alaikum! I have booked an appointment at ${clinicConfig.name}.\n• Reference: ${confirmedBooking.reference}\n• Doctor: ${confirmedBooking.doctorName}\n• Service: ${confirmedBooking.serviceTitle}\n• Date & Time: ${confirmedBooking.date} at ${confirmedBooking.timeSlot}\n• Patient: ${confirmedBooking.patientName} (${confirmedBooking.phone})`;

    return (
      <div className="max-w-2xl mx-auto card-clinic p-8 lg:p-10 text-center border-t-4 border-t-success">
        <div className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto mb-5 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="heading-h2 text-secondary mb-2">{labels.successTitle}</h2>
        <p className="text-text-secondary mb-6">{labels.successSub}</p>

        <div className="bg-surface-soft border-2 border-dashed border-primary/40 rounded-2xl p-5 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1">
            {labels.referenceLabel}
          </span>
          <span
            dir="ltr"
            className="text-2xl lg:text-3xl font-extrabold text-primary tracking-wider"
          >
            {confirmedBooking.reference}
          </span>
        </div>

        <div className="bg-surface-soft rounded-xl p-5 text-start space-y-2.5 text-sm border border-surface-border mb-8">
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">{labels.serviceLabel}:</span>
            <span className="font-bold text-secondary">
              {confirmedBooking.serviceTitle}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">{labels.doctorLabel}:</span>
            <span className="font-bold text-secondary">
              {confirmedBooking.doctorName}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">{labels.dateTimeLabel}:</span>
            <span dir="ltr" className="font-bold text-primary">
              {confirmedBooking.date} • {confirmedBooking.timeSlot}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">{labels.patientInfoLabel}:</span>
            <span className="font-bold text-secondary">
              {confirmedBooking.patientName} ({confirmedBooking.phone})
            </span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-surface-border">
            <span className="text-text-secondary">{labels.feeSummaryLabel}:</span>
            <span dir="ltr" className="font-bold text-secondary">
              {formatPKR(confirmedBooking.fee)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="btn-outline w-full sm:w-auto"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{labels.addToCalendar}</span>
          </button>

          <a
            href={getWhatsAppUrl(locale, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto px-6 rounded-btn bg-whatsapp text-white font-semibold hover:opacity-95 transition-opacity"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>{labels.sendOnWhatsApp}</span>
          </a>

          <Link href={`/${locale}`} className="btn-primary w-full sm:w-auto">
            <Home className="w-4 h-4 shrink-0" />
            <span>{labels.backToHome}</span>
          </Link>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: labels.step1 },
    { num: 2, title: labels.step2 },
    { num: 3, title: labels.step3 },
    { num: 4, title: labels.step4 },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        {stepsList.map((s) => {
          const isCurrent = step === s.num;
          const isDone = step > s.num;
          return (
            <div
              key={s.num}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
                isCurrent
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : isDone
                  ? 'bg-success/10 text-success border-success/30'
                  : 'bg-surface-soft text-text-secondary border-surface-border'
              }`}
            >
              <span
                dir="ltr"
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-white text-primary'
                    : isDone
                    ? 'bg-success text-white'
                    : 'bg-white text-text-secondary border border-surface-border'
                }`}
              >
                {isDone ? '✓' : s.num}
              </span>
              <span className="truncate">{s.title}</span>
            </div>
          );
        })}
      </div>

      {submitError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-error/10 border border-error text-error flex items-start gap-3 text-sm font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="card-clinic p-6 sm:p-8 lg:p-10">
        {/* STEP 1: Service & Doctor */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="booking-service"
                className="block text-sm font-bold text-secondary mb-2"
              >
                {labels.selectService}
              </label>
              <select
                id="booking-service"
                value={serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="input-clinic"
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {localizeField(srv, 'title', locale)} — From PKR {srv.feeFrom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="booking-doctor"
                className="block text-sm font-bold text-secondary mb-2"
              >
                {labels.selectDoctor}
              </label>
              <select
                id="booking-doctor"
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setTimeSlot('');
                }}
                className="input-clinic mb-4"
              >
                <option value="ANY">{labels.anyAvailableDoctor}</option>
                {availableDoctorsList.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {localizeField(doc, 'name', locale)} (
                    {localizeField(doc, 'specialty', locale)}) — PKR {doc.fee}
                  </option>
                ))}
              </select>

              {/* Selected Doctor Preview Card */}
              {resolvedDoctor && (
                <div className="p-4 rounded-xl bg-surface-soft border border-surface-border flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-surface-border shrink-0">
                    <Image
                      src={resolvedDoctor.photo}
                      alt={localizeField(resolvedDoctor, 'name', locale)}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-secondary text-base truncate">
                      {localizeField(resolvedDoctor, 'name', locale)}
                    </p>
                    <p className="text-xs text-primary font-semibold truncate">
                      {localizeField(resolvedDoctor, 'specialty', locale)}
                    </p>
                    <p dir="ltr" className="text-xs text-text-secondary mt-0.5">
                      {resolvedDoctor.qualification} •{' '}
                      <strong className="text-secondary">
                        {formatPKR(resolvedDoctor.fee)}
                      </strong>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="btn-primary w-full sm:w-auto"
              >
                <span>{labels.next}</span>
                <ArrowRight className="w-4 h-4 rtl-flip" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Date & Time Slot Chips */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="booking-date"
                className="block text-sm font-bold text-secondary mb-2"
              >
                {labels.selectDate}
              </label>

              {/* Quick 1-Tap Date Chips for Mobile Speed */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3" dir="ltr">
                {quickDates.map((qd) => {
                  const active = date === qd.iso;
                  return (
                    <button
                      key={qd.iso}
                      type="button"
                      onClick={() => {
                        setDate(qd.iso);
                        setTimeSlot('');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        active
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface-soft text-text-primary border-surface-border hover:border-primary'
                      }`}
                    >
                      <span className="block text-[11px] uppercase opacity-80">
                        {qd.isToday ? 'Today' : qd.dayShort}
                      </span>
                      <span className="block text-sm font-bold">{qd.monthDay}</span>
                    </button>
                  );
                })}
              </div>

              <input
                id="booking-date"
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTimeSlot('');
                }}
                dir="ltr"
                className="input-clinic"
              />
              <p className="text-xs text-text-secondary mt-1.5">
                {labels.selectDateHint}
              </p>
            </div>

            {/* 30-Minute Time-Slot Chips (Section 7 Page 5) */}
            <div>
              <span className="block text-sm font-bold text-secondary mb-3">
                {labels.selectTimeSlot}
              </span>

              {loadingSlots ? (
                <div className="py-10 flex items-center justify-center gap-2 text-primary font-medium">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{labels.loading}</span>
                </div>
              ) : allSlots.length === 0 ? (
                <div className="p-6 rounded-xl bg-warning/10 border border-warning/30 text-secondary text-sm text-center">
                  {labels.noSlotsAvailable}
                </div>
              ) : (
                <div
                  role="radiogroup"
                  aria-label={labels.selectTimeSlot}
                  dir="ltr"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                >
                  {allSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = timeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setTimeSlot(slot)}
                        aria-pressed={isSelected}
                        className={`min-h-[46px] px-3 py-2 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center ${
                          isBooked
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/30'
                            : 'bg-white text-secondary border-surface-border hover:border-primary hover:bg-primary-light/50'
                        }`}
                      >
                        <span>{slot}</span>
                        {isBooked && (
                          <span className="text-[10px] font-normal no-underline">
                            ({labels.bookedLabel})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline"
              >
                <ArrowLeft className="w-4 h-4 rtl-flip" />
                <span>{labels.back}</span>
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className="btn-primary"
              >
                <span>{labels.next}</span>
                <ArrowRight className="w-4 h-4 rtl-flip" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Patient Details */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="patient-name"
                className="block text-sm font-bold text-secondary mb-1.5"
              >
                {labels.patientName}
              </label>
              <input
                id="patient-name"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                placeholder={labels.patientNamePlaceholder}
                aria-invalid={Boolean(touched.name && nameError)}
                className="input-clinic"
              />
              {touched.name && nameError && (
                <p role="alert" className="text-xs text-error font-medium mt-1">
                  {nameError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="patient-phone"
                className="block text-sm font-bold text-secondary mb-1.5"
              >
                {labels.phone}
              </label>
              <input
                id="patient-phone"
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                placeholder={labels.phonePlaceholder}
                aria-invalid={Boolean(touched.phone && phoneError)}
                className="input-clinic"
              />
              <p className="text-xs text-text-secondary mt-1">{labels.phoneHint}</p>
              {touched.phone && phoneError && (
                <p role="alert" className="text-xs text-error font-medium mt-1">
                  {phoneError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label
                  htmlFor="patient-age"
                  className="block text-sm font-bold text-secondary mb-1.5"
                >
                  {labels.age}
                </label>
                <input
                  id="patient-age"
                  type="number"
                  min={1}
                  max={120}
                  dir="ltr"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, age: true }))}
                  placeholder={labels.agePlaceholder}
                  aria-invalid={Boolean((touched.age || age.length > 0) && ageError)}
                  className="input-clinic"
                />
                {(touched.age || age.length > 0) && ageError && (
                  <p role="alert" className="text-xs text-error font-medium mt-1">
                    {ageError}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label
                  htmlFor="patient-gender"
                  className="block text-sm font-bold text-secondary mb-1.5"
                >
                  {labels.gender}
                </label>
                <select
                  id="patient-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-clinic"
                >
                  <option value="Male">{labels.genderMale}</option>
                  <option value="Female">{labels.genderFemale}</option>
                  <option value="Other">{labels.genderOther}</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label
                  htmlFor="patient-email"
                  className="block text-sm font-bold text-secondary mb-1.5"
                >
                  {labels.email}
                </label>
                <input
                  id="patient-email"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  placeholder={labels.emailPlaceholder}
                  aria-invalid={Boolean(touched.email && emailError)}
                  className="input-clinic"
                />
                {touched.email && emailError && (
                  <p role="alert" className="text-xs text-error font-medium mt-1">
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="patient-reason"
                className="block text-sm font-bold text-secondary mb-1.5"
              >
                {labels.reason}
              </label>
              <textarea
                id="patient-reason"
                rows={3}
                maxLength={300}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={labels.reasonPlaceholder}
                className="input-clinic"
              />
              <span
                dir="ltr"
                className="block text-end text-xs text-text-secondary mt-1"
              >
                {reason.length}/300
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-soft border border-surface-border">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setTouched((p) => ({ ...p, consent: true }));
                  }}
                  aria-invalid={Boolean(touched.consent && consentError)}
                  className="mt-1 w-5 h-5 rounded accent-primary shrink-0"
                />
                <span className="text-sm text-text-primary font-medium">
                  {labels.consentLabel}
                </span>
              </label>
              {touched.consent && consentError && (
                <p role="alert" className="text-xs text-error font-medium mt-1.5">
                  {consentError}
                </p>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-outline"
              >
                <ArrowLeft className="w-4 h-4 rtl-flip" />
                <span>{labels.back}</span>
              </button>
              <button
                type="button"
                disabled={!isStep3Valid}
                onClick={() => setStep(4)}
                className="btn-primary"
              >
                <span>{labels.next}</span>
                <ArrowRight className="w-4 h-4 rtl-flip" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="heading-h3 text-secondary">{labels.reviewTitle}</h2>

            <div className="space-y-4">
              {/* Section 1 Summary */}
              <div className="p-4 rounded-xl bg-surface-soft border border-surface-border flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-text-secondary">{labels.serviceLabel} & {labels.doctorLabel}</p>
                    <p className="font-bold text-secondary">
                      {localizeField(selectedService, 'title', locale)}
                    </p>
                    <p className="text-sm text-primary font-semibold">
                      {localizeField(resolvedDoctor, 'name', locale)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{labels.editSection}</span>
                </button>
              </div>

              {/* Section 2 Summary */}
              <div className="p-4 rounded-xl bg-surface-soft border border-surface-border flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-text-secondary">{labels.dateTimeLabel}</p>
                    <p dir="ltr" className="font-bold text-secondary">
                      {date} • {timeSlot}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{labels.editSection}</span>
                </button>
              </div>

              {/* Section 3 Summary */}
              <div className="p-4 rounded-xl bg-surface-soft border border-surface-border flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-text-secondary">
                      {labels.patientInfoLabel}
                    </p>
                    <p className="font-bold text-secondary">{patientName}</p>
                    <p dir="ltr" className="text-sm text-text-secondary">
                      {phone} {age ? `• ${age} yrs` : ''} {gender ? `• ${gender}` : ''}
                    </p>
                    {reason && (
                      <p className="text-xs text-text-secondary mt-1 italic">
                        &ldquo;{reason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{labels.editSection}</span>
                </button>
              </div>

              {/* Fee Summary */}
              <div className="p-4 rounded-xl bg-primary-light border border-primary/25 flex items-center justify-between">
                <span className="font-semibold text-secondary text-sm">
                  {labels.feeSummaryLabel}
                </span>
                <span dir="ltr" className="text-xl font-extrabold text-primary">
                  {formatPKR(resolvedDoctor.fee)}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep(3)}
                className="btn-outline w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 rtl-flip" />
                <span>{labels.back}</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmSubmit}
                className="btn-accent w-full sm:w-auto !px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{labels.submitting}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{labels.confirmButton}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
