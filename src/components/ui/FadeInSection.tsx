'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeInSection({ children, className = '', delay = 0 }: FadeInSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
