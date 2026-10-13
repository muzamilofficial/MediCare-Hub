'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import { clinicConfig } from '@/config/clinic';

interface CallNowButtonProps {
  label: string;
  variant?: 'primary' | 'outline' | 'outline-white' | 'accent';
  className?: string;
}

export function CallNowButton({
  label,
  variant = 'outline-white',
  className = '',
}: CallNowButtonProps) {
  const variantClasses = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    'outline-white': 'btn-outline-white',
    accent: 'btn-accent',
  }[variant];

  return (
    <div className="relative group inline-flex">
      <a
        href={`tel:${clinicConfig.phoneClean}`}
        className={`${variantClasses} ${className}`}
        aria-label={`${label} ${clinicConfig.phone}`}
      >
        <Phone className="w-5 h-5 shrink-0" />
        <span>{label}</span>
      </a>
      {/* Desktop tooltip showing phone number in Western digits (Section 8) */}
      <span
        role="tooltip"
        dir="ltr"
        className="pointer-events-none hidden lg:block absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 z-30"
      >
        {clinicConfig.phone}
      </span>
    </div>
  );
}
