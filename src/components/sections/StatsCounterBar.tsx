'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Award, Users, Stethoscope, Star } from 'lucide-react';
import { clinicConfig } from '@/config/clinic';

interface StatsCounterBarProps {
  labels: {
    years: string;
    patients: string;
    doctors: string;
    rating: string;
  };
}

function AnimatedNumber({
  target,
  suffix = '',
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(prefersReducedMotion ? target : 0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 900;
          const startTime = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const current = progress * target;
            setValue(current);
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setValue(target);
            }
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, hasAnimated, prefersReducedMotion]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('en-US');

  return (
    <span ref={ref} dir="ltr" className="inline-block">
      {formatted}
      {suffix}
    </span>
  );
}

export function StatsCounterBar({ labels }: StatsCounterBarProps) {
  const items = [
    {
      icon: Award,
      target: clinicConfig.stats.yearsExperience,
      suffix: '+',
      decimals: 0,
      label: labels.years,
    },
    {
      icon: Users,
      target: clinicConfig.stats.happyPatients,
      suffix: '+',
      decimals: 0,
      label: labels.patients,
    },
    {
      icon: Stethoscope,
      target: clinicConfig.stats.specialistDoctors,
      suffix: '',
      decimals: 0,
      label: labels.doctors,
    },
    {
      icon: Star,
      target: clinicConfig.stats.patientRating,
      suffix: '/5',
      decimals: 1,
      label: labels.rating,
    },
  ];

  return (
    <section className="bg-primary text-white py-12 lg:py-16">
      <div className="container-clinic">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 border border-white/15"
              >
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold tracking-tight mb-1">
                  <AnimatedNumber
                    target={item.target}
                    suffix={item.suffix}
                    decimals={item.decimals}
                  />
                </div>
                <p className="text-sm lg:text-base text-white/90 font-medium">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
