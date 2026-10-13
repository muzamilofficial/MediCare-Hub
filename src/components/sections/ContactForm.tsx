'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { isValidPakPhone, isValidPersonName } from '@/lib/security';

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2)
    .refine((val) => isValidPersonName(val)),
  phone: z.string().refine((val) => isValidPakPhone(val)),
  email: z.string().email().optional().or(z.literal('')),
  subject: z.string().min(2),
  message: z.string().min(5).max(1500),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  labels: {
    formTitle: string;
    formSub: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    subjectLabel: string;
    subjGeneral: string;
    subjAppointment: string;
    subjLab: string;
    subjFeedback: string;
    messageLabel: string;
    sendButton: string;
    successMessage: string;
    nameRequired: string;
    phoneInvalid: string;
    emailInvalid: string;
  };
}

export function ContactForm({ labels }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      subject: labels.subjGeneral,
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setServerError('');
    setSubmitted(false);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Could not send message.');
        return;
      }
      setSubmitted(true);
      reset();
    } catch {
      setServerError('Network error. Please try again.');
    }
  };

  return (
    <div className="card-clinic p-6 sm:p-8">
      <h2 className="heading-h3 text-secondary mb-2">{labels.formTitle}</h2>
      <p className="text-sm text-text-secondary mb-6">{labels.formSub}</p>

      {submitted && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-success/10 border border-success text-success flex items-start gap-3 text-sm font-semibold"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{labels.successMessage}</span>
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-error/10 border border-error text-error flex items-start gap-3 text-sm font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-bold text-secondary mb-1.5"
          >
            {labels.nameLabel}
          </label>
          <input
            id="contact-name"
            type="text"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
            className="input-clinic"
          />
          {errors.name && (
            <p role="alert" className="text-xs text-error font-medium mt-1">
              {labels.nameRequired}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-phone"
            className="block text-sm font-bold text-secondary mb-1.5"
          >
            {labels.phoneLabel}
          </label>
          <input
            id="contact-phone"
            type="tel"
            dir="ltr"
            placeholder="0300-1234567"
            aria-invalid={Boolean(errors.phone)}
            {...register('phone')}
            className="input-clinic"
          />
          {errors.phone && (
            <p role="alert" className="text-xs text-error font-medium mt-1">
              {labels.phoneInvalid}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-bold text-secondary mb-1.5"
          >
            {labels.emailLabel}
          </label>
          <input
            id="contact-email"
            type="email"
            dir="ltr"
            placeholder="name@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
            className="input-clinic"
          />
          {errors.email && (
            <p role="alert" className="text-xs text-error font-medium mt-1">
              {labels.emailInvalid}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-subject"
            className="block text-sm font-bold text-secondary mb-1.5"
          >
            {labels.subjectLabel}
          </label>
          <select
            id="contact-subject"
            {...register('subject')}
            className="input-clinic"
          >
            <option value={labels.subjGeneral}>{labels.subjGeneral}</option>
            <option value={labels.subjAppointment}>{labels.subjAppointment}</option>
            <option value={labels.subjLab}>{labels.subjLab}</option>
            <option value={labels.subjFeedback}>{labels.subjFeedback}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="block text-sm font-bold text-secondary mb-1.5"
          >
            {labels.messageLabel}
          </label>
          <textarea
            id="contact-message"
            rows={4}
            aria-invalid={Boolean(errors.message)}
            {...register('message')}
            className="input-clinic"
          />
          {errors.message && (
            <p role="alert" className="text-xs text-error font-medium mt-1">
              Please enter your message (at least 5 characters).
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 rtl-flip" />
              <span>{labels.sendButton}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
