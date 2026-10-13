'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-3.5">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const contentId = `faq-answer-${idx}`;
        const buttonId = `faq-question-${idx}`;
        return (
          <div
            key={idx}
            className="card-clinic overflow-hidden border border-surface-border"
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-6 py-4 text-start flex items-center justify-between gap-4 font-semibold text-secondary hover:bg-surface-soft transition-colors"
              >
                <span className="text-base lg:text-lg">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </h3>
            {isOpen && (
              <div
                id={contentId}
                role="region"
                aria-labelledby={buttonId}
                className="px-6 pb-5 pt-1 text-text-secondary text-[16px] leading-relaxed border-t border-surface-border/60"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
