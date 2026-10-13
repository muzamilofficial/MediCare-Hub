'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { Locale } from '@/i18n/routing';

export interface GalleryItem {
  id: number;
  src: string;
  category: 'Clinic' | 'Equipment' | 'Events';
  title: Record<Locale, string>;
}

interface GalleryMasonryLightboxProps {
  locale: Locale;
  items: GalleryItem[];
  labels: {
    catAll: string;
    catClinic: string;
    catEquipment: string;
    catEvents: string;
    closeLightbox: string;
    prevImage: string;
    nextImage: string;
  };
}

export function GalleryMasonryLightbox({
  locale,
  items,
  labels,
}: GalleryMasonryLightboxProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category === activeCategory);

  const handleNext = useCallback(() => {
    if (lightboxIdx === null || filtered.length === 0) return;
    setLightboxIdx((lightboxIdx + 1) % filtered.length);
  }, [lightboxIdx, filtered.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIdx === null || filtered.length === 0) return;
    setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length);
  }, [lightboxIdx, filtered.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, handleNext, handlePrev]);

  const tabs = [
    { key: 'All', label: labels.catAll },
    { key: 'Clinic', label: labels.catClinic },
    { key: 'Equipment', label: labels.catEquipment },
    { key: 'Events', label: labels.catEvents },
  ];

  const currentItem = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  return (
    <div>
      {/* Category Tabs */}
      <div
        role="tablist"
        aria-label="Gallery Categories"
        className="flex flex-wrap items-center justify-center gap-2.5 mb-10"
      >
        {tabs.map((t) => {
          const active = activeCategory === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveCategory(t.key);
                setLightboxIdx(null);
              }}
              className={`min-h-[44px] px-5 py-2 rounded-chip text-sm font-semibold transition-all ${
                active
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-soft text-text-secondary border border-surface-border hover:border-primary hover:text-primary'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 12-Image Masonry / Responsive Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filtered.map((item, idx) => {
          const caption = item.title[locale] || item.title.en;
          return (
            <div
              key={item.id}
              className="break-inside-avoid card-clinic overflow-hidden group cursor-pointer"
              onClick={() => setLightboxIdx(idx)}
            >
              <button
                type="button"
                aria-label={caption}
                className="w-full text-start focus:outline-none"
              >
                <div
                  className={`relative w-full bg-surface-soft overflow-hidden ${
                    idx % 2 === 0 ? 'aspect-4/3' : 'aspect-16/10'
                  }`}
                >
                  <Image
                    src={item.src}
                    alt={caption}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/35 transition-colors flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between gap-2">
                  <span className="font-semibold text-secondary text-sm">
                    {caption}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-chip bg-primary-light text-primary shrink-0">
                    {item.category}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Keyboard-Accessible Lightbox Modal */}
      {currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentItem.title[locale]}
          className="fixed inset-0 z-50 bg-secondary/90 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            aria-label={labels.closeLightbox}
            className="fixed top-5 right-5 z-50 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label={labels.prevImage}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label={labels.nextImage}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/10 w-full bg-surface-soft">
              <Image
                src={currentItem.src}
                alt={currentItem.title[locale]}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <div className="p-5 flex items-center justify-between gap-4 bg-white">
              <h3 className="font-bold text-secondary text-lg">
                {currentItem.title[locale]}
              </h3>
              <span dir="ltr" className="text-xs font-semibold text-text-secondary">
                {(lightboxIdx ?? 0) + 1} / {filtered.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
