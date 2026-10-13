'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Minus,
  Send,
  Bot,
  Phone,
  MessageCircle,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { clinicConfig, getClinicName, getWhatsAppUrl } from '@/config/clinic';
import { isRtlLocale, type Locale } from '@/i18n/routing';
import { CHATBOT_COPY, matchUserIntent, type QuickReplyOption } from '@/chatbot/flows';
import { isValidPakPhone, isValidPersonName, normalizePakPhone } from '@/lib/security';
import { getKarachiDateString, localizeField } from '@/lib/utils';

export interface ChatbotDoctorSummary {
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
  fee: number;
}

export interface ChatbotServiceSummary {
  id: string;
  slug: string;
  title: string;
  titleUr: string;
  titleSd: string;
  description: string;
  descriptionUr: string;
  descriptionSd: string;
  feeFrom: number;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isEmergency?: boolean;
  options?: QuickReplyOption[];
  externalActions?: Array<{
    type: 'call' | 'whatsapp' | 'map';
    label: string;
    href: string;
  }>;
}

type FlowStage =
  | 'IDLE'
  | 'BOOK_SERVICE'
  | 'BOOK_DOCTOR'
  | 'BOOK_DATE'
  | 'BOOK_DATE_CUSTOM'
  | 'BOOK_SLOT'
  | 'BOOK_NAME'
  | 'BOOK_PHONE'
  | 'BOOK_CONFIRM'
  | 'LAB_NAME'
  | 'LAB_PHONE'
  | 'LAB_TEST'
  | 'CALLBACK_NAME'
  | 'CALLBACK_PHONE';

interface BookingDraft {
  serviceId: string;
  serviceTitle: string;
  serviceSlug: string;
  doctorId: string;
  doctorName: string;
  doctorFee: number;
  date: string;
  timeSlot: string;
  patientName: string;
  phone: string;
}

interface ChatbotWidgetProps {
  initialLocale: Locale;
  doctors: ChatbotDoctorSummary[];
  services: ChatbotServiceSummary[];
  tooltipText: string;
}

const SESSION_STORAGE_KEY = 'medicare_chatbot_session_v1';
const TOOLTIP_SHOWN_KEY = 'medicare_chatbot_tooltip_shown';

export function ChatbotWidget({
  initialLocale,
  doctors,
  services,
  tooltipText,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatLocale, setChatLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [stage, setStage] = useState<FlowStage>('IDLE');
  const [failedAttempts, setFailedAttempts] = useState(0);

  const [bookingDraft, setBookingDraft] = useState<BookingDraft>({
    serviceId: '',
    serviceTitle: '',
    serviceSlug: '',
    doctorId: '',
    doctorName: '',
    doctorFee: 1500,
    date: '',
    timeSlot: '',
    patientName: '',
    phone: '',
  });

  const [leadDraft, setLeadDraft] = useState<{
    name: string;
    phone: string;
    testName: string;
  }>({ name: '', phone: '', testName: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPageRtl = isRtlLocale(initialLocale);
  const isChatRtl = isRtlLocale(chatLocale);
  const copy = CHATBOT_COPY[chatLocale];

  // Show "Chat with us" tooltip after 5 seconds, once per session (Section 6)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(TOOLTIP_SHOWN_KEY)) return;
    } catch {
      // ignore
    }
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
        try {
          sessionStorage.setItem(TOOLTIP_SHOWN_KEY, '1');
        } catch {
          // ignore
        }
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Restore chat history from sessionStorage or initialize greeting
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          if (parsed.chatLocale) setChatLocale(parsed.chatLocale);
          return;
        }
      }
    } catch {
      // ignore
    }
    // First message: language choice buttons [English] [اردو] [سنڌي] (Section 9)
    const initialMsg: ChatMessage = {
      id: 'init-lang',
      sender: 'bot',
      text: CHATBOT_COPY[initialLocale].greetingChooseLang,
      options: [
        { id: 'lang-en', label: 'English', action: 'SET_LANG', payload: 'en' },
        { id: 'lang-ur', label: 'اردو', action: 'SET_LANG', payload: 'ur' },
        { id: 'lang-sd', label: 'سنڌي', action: 'SET_LANG', payload: 'sd' },
      ],
    };
    setMessages([initialMsg]);
  }, [initialLocale]);

  // Persist messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ messages, chatLocale })
        );
      } catch {
        // ignore
      }
    }
  }, [messages, chatLocale]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const getMainMenuOptions = (loc: Locale): QuickReplyOption[] => {
    const c = CHATBOT_COPY[loc];
    return [
      { id: 'm-book', label: c.menu.book, action: 'MENU_BOOK' },
      { id: 'm-doctors', label: c.menu.doctors, action: 'MENU_DOCTORS' },
      { id: 'm-services', label: c.menu.services, action: 'MENU_SERVICES' },
      { id: 'm-location', label: c.menu.location, action: 'MENU_LOCATION' },
      { id: 'm-lab', label: c.menu.lab, action: 'MENU_LAB' },
      { id: 'm-reception', label: c.menu.reception, action: 'MENU_RECEPTION' },
    ];
  };

  const getBackCancelOptions = (loc: Locale, backAction: string): QuickReplyOption[] => {
    const c = CHATBOT_COPY[loc];
    return [
      { id: 'nav-back', label: c.backButton, action: backAction },
      { id: 'nav-cancel', label: c.cancelButton, action: 'CANCEL_FLOW' },
    ];
  };

  const appendBotReply = (reply: Omit<ChatMessage, 'id' | 'sender'>) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          ...reply,
          id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: 'bot',
        },
      ]);
    }, 600); // 600ms typing indicator delay as specified in Section 9
  };

  const appendUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: 'user',
        text,
      },
    ]);
  };

  const handleLanguageChange = (newLoc: Locale, announceInChat: boolean = true) => {
    setChatLocale(newLoc);
    setStage('IDLE');
    if (announceInChat) {
      const c = CHATBOT_COPY[newLoc];
      appendBotReply({
        text: c.welcomeMenu,
        options: getMainMenuOptions(newLoc),
      });
    }
  };

  const triggerEmergencyAlert = (loc: Locale) => {
    const c = CHATBOT_COPY[loc];
    setStage('IDLE'); // Do not continue booking flow (Section 9)
    appendBotReply({
      text: c.emergencyAlert,
      isEmergency: true,
      externalActions: [
        {
          type: 'call',
          label: c.callNowButton,
          href: `tel:${clinicConfig.phoneClean}`,
        },
      ],
      options: [{ id: 'em-menu', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' }],
    });
  };

  const startBookServiceStep = (loc: Locale) => {
    const c = CHATBOT_COPY[loc];
    setStage('BOOK_SERVICE');
    const srvOptions: QuickReplyOption[] = services.map((s) => ({
      id: `srv-${s.id}`,
      label: localizeField(s, 'title', loc),
      action: 'SELECT_BOOK_SERVICE',
      payload: s.id,
    }));
    srvOptions.push({ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' });
    appendBotReply({
      text: c.booking.askService,
      options: srvOptions,
    });
  };

  const startBookDoctorStep = (loc: Locale, serviceId: string, serviceSlug: string) => {
    const c = CHATBOT_COPY[loc];
    setStage('BOOK_DOCTOR');
    const matchingDocs = doctors.filter((d) => d.serviceSlug === serviceSlug);
    const listToUse = matchingDocs.length > 0 ? matchingDocs : doctors;

    const docOptions: QuickReplyOption[] = [
      {
        id: 'doc-any',
        label: c.booking.anyDoctor,
        action: 'SELECT_BOOK_DOCTOR',
        payload: listToUse[0]?.id || doctors[0]?.id,
      },
      ...listToUse.map((d) => ({
        id: `doc-${d.id}`,
        label: `${localizeField(d, 'name', loc)} (PKR ${d.fee})`,
        action: 'SELECT_BOOK_DOCTOR',
        payload: d.id,
      })),
      ...getBackCancelOptions(loc, 'BACK_TO_BOOK_SERVICE'),
    ];

    appendBotReply({
      text: c.booking.askDoctor,
      options: docOptions,
    });
  };

  const startBookDateStep = (loc: Locale) => {
    const c = CHATBOT_COPY[loc];
    setStage('BOOK_DATE');
    const todayStr = getKarachiDateString(0);
    const tomorrowStr = getKarachiDateString(1);
    const dayAfterStr = getKarachiDateString(2);

    appendBotReply({
      text: c.booking.askDate,
      options: [
        {
          id: 'date-today',
          label: `${c.booking.today} (${todayStr})`,
          action: 'SELECT_BOOK_DATE',
          payload: todayStr,
        },
        {
          id: 'date-tomorrow',
          label: `${c.booking.tomorrow} (${tomorrowStr})`,
          action: 'SELECT_BOOK_DATE',
          payload: tomorrowStr,
        },
        {
          id: 'date-dayafter',
          label: dayAfterStr,
          action: 'SELECT_BOOK_DATE',
          payload: dayAfterStr,
        },
        {
          id: 'date-custom',
          label: '📅 Pick Date (YYYY-MM-DD)',
          action: 'ASK_CUSTOM_DATE',
        },
        ...getBackCancelOptions(loc, 'BACK_TO_BOOK_DOCTOR'),
      ],
    });
  };

  const fetchAndShowSlots = async (loc: Locale, doctorId: string, dateStr: string) => {
    const c = CHATBOT_COPY[loc];
    setStage('BOOK_SLOT');
    setIsTyping(true);
    try {
      const res = await fetch(
        `/api/appointments/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(dateStr)}`
      );
      const data = await res.json();
      const availableSlots: string[] = (data.availableSlots || []).slice(0, 8);

      setIsTyping(false);
      if (availableSlots.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: c.booking.noSlots,
            options: getBackCancelOptions(loc, 'BACK_TO_BOOK_DATE'),
          },
        ]);
        return;
      }

      const slotOptions: QuickReplyOption[] = [
        ...availableSlots.map((slot) => ({
          id: `slot-${slot}`,
          label: slot,
          action: 'SELECT_BOOK_SLOT',
          payload: slot,
        })),
        ...getBackCancelOptions(loc, 'BACK_TO_BOOK_DATE'),
      ];

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: c.booking.askSlot,
          options: slotOptions,
        },
      ]);
    } catch {
      setIsTyping(false);
      appendBotReply({
        text: c.booking.bookingError,
        options: getMainMenuOptions(loc),
      });
    }
  };

  const handleQuickReply = async (opt: QuickReplyOption) => {
    appendUserMessage(opt.label);
    const c = CHATBOT_COPY[chatLocale];

    switch (opt.action) {
      case 'SET_LANG': {
        const targetLoc = (opt.payload as Locale) || 'en';
        handleLanguageChange(targetLoc, true);
        break;
      }
      case 'SHOW_MAIN_MENU': {
        setStage('IDLE');
        appendBotReply({
          text: c.welcomeMenu,
          options: getMainMenuOptions(chatLocale),
        });
        break;
      }
      case 'CANCEL_FLOW': {
        setStage('IDLE');
        appendBotReply({
          text: c.booking.cancelled,
          options: getMainMenuOptions(chatLocale),
        });
        break;
      }
      case 'MENU_BOOK':
      case 'BACK_TO_BOOK_SERVICE': {
        startBookServiceStep(chatLocale);
        break;
      }
      case 'SELECT_BOOK_SERVICE': {
        const srv = services.find((s) => s.id === opt.payload) || services[0];
        if (!srv) return;
        setBookingDraft((prev) => ({
          ...prev,
          serviceId: srv.id,
          serviceSlug: srv.slug,
          serviceTitle: localizeField(srv, 'title', chatLocale),
        }));
        startBookDoctorStep(chatLocale, srv.id, srv.slug);
        break;
      }
      case 'BACK_TO_BOOK_DOCTOR': {
        startBookDoctorStep(chatLocale, bookingDraft.serviceId, bookingDraft.serviceSlug);
        break;
      }
      case 'SELECT_BOOK_DOCTOR': {
        const doc = doctors.find((d) => d.id === opt.payload) || doctors[0];
        if (!doc) return;
        const matchingSrv =
          services.find((s) => s.slug === doc.serviceSlug) || services[0];
        setBookingDraft((prev) => ({
          ...prev,
          serviceId: prev.serviceId || matchingSrv.id,
          serviceSlug: prev.serviceSlug || matchingSrv.slug,
          serviceTitle:
            prev.serviceTitle || localizeField(matchingSrv, 'title', chatLocale),
          doctorId: doc.id,
          doctorName: localizeField(doc, 'name', chatLocale),
          doctorFee: doc.fee,
        }));
        startBookDateStep(chatLocale);
        break;
      }
      case 'BACK_TO_BOOK_DATE': {
        startBookDateStep(chatLocale);
        break;
      }
      case 'ASK_CUSTOM_DATE': {
        setStage('BOOK_DATE_CUSTOM');
        appendBotReply({
          text: c.booking.pickDatePrompt,
          options: getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_DATE'),
        });
        break;
      }
      case 'SELECT_BOOK_DATE': {
        const chosenDate = opt.payload || getKarachiDateString(0);
        setBookingDraft((prev) => ({ ...prev, date: chosenDate }));
        await fetchAndShowSlots(chatLocale, bookingDraft.doctorId, chosenDate);
        break;
      }
      case 'BACK_TO_BOOK_SLOT': {
        await fetchAndShowSlots(chatLocale, bookingDraft.doctorId, bookingDraft.date);
        break;
      }
      case 'SELECT_BOOK_SLOT': {
        const slot = opt.payload || '10:00 AM';
        setBookingDraft((prev) => ({ ...prev, timeSlot: slot }));
        setStage('BOOK_NAME');
        appendBotReply({
          text: c.booking.askName,
          options: getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_SLOT'),
        });
        break;
      }
      case 'BACK_TO_BOOK_NAME': {
        setStage('BOOK_NAME');
        appendBotReply({
          text: c.booking.askName,
          options: getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_SLOT'),
        });
        break;
      }
      case 'BACK_TO_BOOK_PHONE': {
        setStage('BOOK_PHONE');
        appendBotReply({
          text: c.booking.askPhone,
          options: getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_NAME'),
        });
        break;
      }
      case 'CONFIRM_BOOKING_SUBMIT': {
        setIsTyping(true);
        try {
          const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: bookingDraft.serviceId,
              doctorId: bookingDraft.doctorId,
              date: bookingDraft.date,
              timeSlot: bookingDraft.timeSlot,
              patientName: bookingDraft.patientName,
              phone: bookingDraft.phone,
              source: 'chatbot',
              consent: true,
            }),
          });
          const data = await res.json();
          setIsTyping(false);

          if (!res.ok || !data.appointment) {
            appendBotReply({
              text: data.error || c.booking.bookingError,
              options: getMainMenuOptions(chatLocale),
            });
            setStage('IDLE');
            return;
          }

          const refNum = data.appointment.reference;
          const waConfirmMsg = `Assalam-o-Alaikum! I booked an appointment at ${clinicConfig.name}.\nReference: ${refNum}\nDoctor: ${bookingDraft.doctorName}\nDate: ${bookingDraft.date} at ${bookingDraft.timeSlot}\nPatient: ${bookingDraft.patientName}`;
          setStage('IDLE');
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: c.booking.bookingSuccess(refNum),
              externalActions: [
                {
                  type: 'whatsapp',
                  label: c.whatsappButton,
                  href: getWhatsAppUrl(chatLocale, waConfirmMsg),
                },
              ],
              options: [
                { id: 'done-menu', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' },
              ],
            },
          ]);
        } catch {
          setIsTyping(false);
          setStage('IDLE');
          appendBotReply({
            text: c.booking.bookingError,
            options: getMainMenuOptions(chatLocale),
          });
        }
        break;
      }
      case 'MENU_DOCTORS': {
        setStage('IDLE');
        appendBotReply({
          text: c.doctorsFlow.selectDoctorPrompt,
          options: [
            ...doctors.map((d) => ({
              id: `info-doc-${d.id}`,
              label: localizeField(d, 'name', chatLocale),
              action: 'SHOW_DOCTOR_INFO',
              payload: d.id,
            })),
            { id: 'back-main', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' },
          ],
        });
        break;
      }
      case 'SHOW_DOCTOR_INFO': {
        const doc = doctors.find((d) => d.id === opt.payload) || doctors[0];
        if (!doc) return;
        appendBotReply({
          text: c.doctorsFlow.doctorDetails({
            name: localizeField(doc, 'name', chatLocale),
            specialty: localizeField(doc, 'specialty', chatLocale),
            qualification: doc.qualification,
            fee: doc.fee,
            timings: clinicConfig.timings.summary[chatLocale],
          }),
          options: [
            {
              id: `book-doc-${doc.id}`,
              label: c.doctorsFlow.bookWithThisDoctor,
              action: 'SELECT_BOOK_DOCTOR',
              payload: doc.id,
            },
            { id: 'other-docs', label: c.menu.doctors, action: 'MENU_DOCTORS' },
            { id: 'back-main', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' },
          ],
        });
        break;
      }
      case 'MENU_SERVICES': {
        setStage('IDLE');
        appendBotReply({
          text: c.servicesFlow.selectServicePrompt,
          options: [
            ...services.map((s) => ({
              id: `info-srv-${s.id}`,
              label: localizeField(s, 'title', chatLocale),
              action: 'SHOW_SERVICE_INFO',
              payload: s.id,
            })),
            { id: 'back-main', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' },
          ],
        });
        break;
      }
      case 'SHOW_SERVICE_INFO': {
        const srv = services.find((s) => s.id === opt.payload) || services[0];
        if (!srv) return;
        appendBotReply({
          text: c.servicesFlow.serviceDetails({
            title: localizeField(srv, 'title', chatLocale),
            description: localizeField(srv, 'description', chatLocale),
            feeFrom: srv.feeFrom,
          }),
          options: [
            {
              id: `book-srv-${srv.id}`,
              label: c.servicesFlow.bookThisService,
              action: 'SELECT_BOOK_SERVICE',
              payload: srv.id,
            },
            { id: 'other-srvs', label: c.menu.services, action: 'MENU_SERVICES' },
            { id: 'back-main', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' },
          ],
        });
        break;
      }
      case 'MENU_LOCATION': {
        setStage('IDLE');
        appendBotReply({
          text: c.locationFlow.details,
          externalActions: [
            {
              type: 'call',
              label: c.callNowButton,
              href: `tel:${clinicConfig.phoneClean}`,
            },
            {
              type: 'whatsapp',
              label: c.whatsappButton,
              href: getWhatsAppUrl(chatLocale),
            },
            {
              type: 'map',
              label: c.mapDirectionsButton,
              href: clinicConfig.map.directionsUrl,
            },
          ],
          options: [{ id: 'back-main', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' }],
        });
        break;
      }
      case 'MENU_LAB': {
        setStage('LAB_NAME');
        appendBotReply({
          text: c.labFlow.intro,
          options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
        });
        break;
      }
      case 'MENU_RECEPTION': {
        setStage('IDLE');
        appendBotReply({
          text: c.receptionFlow.intro,
          externalActions: [
            {
              type: 'call',
              label: c.callNowButton,
              href: `tel:${clinicConfig.phoneClean}`,
            },
            {
              type: 'whatsapp',
              label: c.whatsappButton,
              href: getWhatsAppUrl(chatLocale),
            },
          ],
          options: [
            {
              id: 'leave-num',
              label: c.receptionFlow.leaveNumberBtn,
              action: 'START_CALLBACK_LEAD',
            },
            { id: 'back-main', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' },
          ],
        });
        break;
      }
      case 'START_CALLBACK_LEAD': {
        setStage('CALLBACK_NAME');
        appendBotReply({
          text: c.receptionFlow.askName,
          options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
        });
        break;
      }
      default:
        break;
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputValue.trim().slice(0, 500);
    if (!raw || isTyping) return;
    setInputValue('');
    appendUserMessage(raw);

    const c = CHATBOT_COPY[chatLocale];

    // Mandatory Safety Check 1: Always check Emergency words first, even inside a flow!
    const intent = matchUserIntent(raw);
    if (intent === 'EMERGENCY') {
      triggerEmergencyAlert(chatLocale);
      return;
    }

    // Handle active multi-step form inputs
    if (stage === 'BOOK_DATE_CUSTOM') {
      const dateMatch = raw.match(/^\d{4}-\d{2}-\d{2}$/);
      const todayStr = getKarachiDateString(0);
      if (!dateMatch || raw < todayStr) {
        appendBotReply({
          text: c.booking.pickDatePrompt,
          options: getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_DATE'),
        });
        return;
      }
      setBookingDraft((prev) => ({ ...prev, date: raw }));
      await fetchAndShowSlots(chatLocale, bookingDraft.doctorId, raw);
      return;
    }

    if (stage === 'BOOK_NAME') {
      if (!isValidPersonName(raw)) {
        appendBotReply({
          text: c.booking.askName,
          options: getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_SLOT'),
        });
        return;
      }
      setBookingDraft((prev) => ({ ...prev, patientName: raw }));
      setStage('BOOK_PHONE');
      appendBotReply({
        text: c.booking.askPhone,
        options: getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_NAME'),
      });
      return;
    }

    if (stage === 'BOOK_PHONE') {
      if (!isValidPakPhone(raw)) {
        appendBotReply({
          text: c.booking.invalidPhone,
          options: getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_NAME'),
        });
        return;
      }
      const normalizedPhone = normalizePakPhone(raw);
      const updatedDraft = { ...bookingDraft, phone: normalizedPhone };
      setBookingDraft(updatedDraft);
      setStage('BOOK_CONFIRM');
      appendBotReply({
        text: c.booking.confirmPrompt({
          service: updatedDraft.serviceTitle,
          doctor: updatedDraft.doctorName,
          date: updatedDraft.date,
          slot: updatedDraft.timeSlot,
          name: updatedDraft.patientName,
          phone: updatedDraft.phone,
          fee: updatedDraft.doctorFee,
        }),
        options: [
          {
            id: 'confirm-yes',
            label: c.booking.confirmYes,
            action: 'CONFIRM_BOOKING_SUBMIT',
          },
          ...getBackCancelOptions(chatLocale, 'BACK_TO_BOOK_PHONE'),
        ],
      });
      return;
    }

    if (stage === 'LAB_NAME') {
      if (!isValidPersonName(raw)) {
        appendBotReply({
          text: c.labFlow.askName,
          options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
        });
        return;
      }
      setLeadDraft((prev) => ({ ...prev, name: raw }));
      setStage('LAB_PHONE');
      appendBotReply({
        text: c.labFlow.askPhone,
        options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
      });
      return;
    }

    if (stage === 'LAB_PHONE') {
      if (!isValidPakPhone(raw)) {
        appendBotReply({
          text: c.booking.invalidPhone,
          options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
        });
        return;
      }
      setLeadDraft((prev) => ({ ...prev, phone: normalizePakPhone(raw) }));
      setStage('LAB_TEST');
      appendBotReply({
        text: c.labFlow.askTestName,
        options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
      });
      return;
    }

    if (stage === 'LAB_TEST') {
      const testName = raw.slice(0, 120);
      setStage('IDLE');
      fetch('/api/chat-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadDraft.name,
          phone: leadDraft.phone,
          type: 'lab_report',
          details: `Test: ${testName}`,
          locale: chatLocale,
        }),
      }).catch(() => {});
      appendBotReply({
        text: c.labFlow.savedSuccess,
        options: getMainMenuOptions(chatLocale),
      });
      return;
    }

    if (stage === 'CALLBACK_NAME') {
      if (!isValidPersonName(raw)) {
        appendBotReply({
          text: c.receptionFlow.askName,
          options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
        });
        return;
      }
      setLeadDraft((prev) => ({ ...prev, name: raw }));
      setStage('CALLBACK_PHONE');
      appendBotReply({
        text: c.receptionFlow.askPhone,
        options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
      });
      return;
    }

    if (stage === 'CALLBACK_PHONE') {
      if (!isValidPakPhone(raw)) {
        appendBotReply({
          text: c.booking.invalidPhone,
          options: [{ id: 'cancel', label: c.cancelButton, action: 'CANCEL_FLOW' }],
        });
        return;
      }
      const normPhone = normalizePakPhone(raw);
      setStage('IDLE');
      fetch('/api/chat-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadDraft.name,
          phone: normPhone,
          type: 'callback',
          details: 'Requested reception callback via Chatbot',
          locale: chatLocale,
        }),
      }).catch(() => {});
      appendBotReply({
        text: c.receptionFlow.savedCallback,
        options: getMainMenuOptions(chatLocale),
      });
      return;
    }

    // Free-text Intent Matching when IDLE
    if (intent === 'SYMPTOM_SAFETY') {
      appendBotReply({
        text: c.symptomSafeReply,
        options: [
          { id: 'sym-book', label: c.menu.book, action: 'MENU_BOOK' },
          { id: 'sym-rec', label: c.menu.reception, action: 'MENU_RECEPTION' },
          { id: 'sym-menu', label: c.mainMenuButton, action: 'SHOW_MAIN_MENU' },
        ],
      });
      return;
    }

    if (intent === 'BOOK_APPOINTMENT') {
      setFailedAttempts(0);
      startBookServiceStep(chatLocale);
      return;
    }

    if (intent === 'DOCTORS_TIMINGS') {
      setFailedAttempts(0);
      handleQuickReply({ id: 'kw-doc', label: raw, action: 'MENU_DOCTORS' });
      return;
    }

    if (intent === 'SERVICES_FEES') {
      setFailedAttempts(0);
      handleQuickReply({ id: 'kw-srv', label: raw, action: 'MENU_SERVICES' });
      return;
    }

    if (intent === 'LOCATION_CONTACT') {
      setFailedAttempts(0);
      handleQuickReply({ id: 'kw-loc', label: raw, action: 'MENU_LOCATION' });
      return;
    }

    if (intent === 'LAB_REPORTS') {
      setFailedAttempts(0);
      handleQuickReply({ id: 'kw-lab', label: raw, action: 'MENU_LAB' });
      return;
    }

    if (intent === 'TALK_RECEPTION') {
      setFailedAttempts(0);
      handleQuickReply({ id: 'kw-rec', label: raw, action: 'MENU_RECEPTION' });
      return;
    }

    if (intent === 'GREETING') {
      setFailedAttempts(0);
      appendBotReply({
        text: c.welcomeMenu,
        options: getMainMenuOptions(chatLocale),
      });
      return;
    }

    // Fallback handling: after 2 failed attempts, offer reception contact (Section 9)
    const nextFailed = failedAttempts + 1;
    setFailedAttempts(nextFailed);

    if (nextFailed >= 2) {
      appendBotReply({
        text: c.fallback.secondTry,
        externalActions: [
          {
            type: 'call',
            label: c.callNowButton,
            href: `tel:${clinicConfig.phoneClean}`,
          },
          {
            type: 'whatsapp',
            label: c.whatsappButton,
            href: getWhatsAppUrl(chatLocale),
          },
        ],
        options: [
          {
            id: 'fb-callback',
            label: c.receptionFlow.leaveNumberBtn,
            action: 'START_CALLBACK_LEAD',
          },
          ...getMainMenuOptions(chatLocale),
        ],
      });
    } else {
      appendBotReply({
        text: c.fallback.firstTry,
        options: getMainMenuOptions(chatLocale),
      });
    }
  };

  return (
    <>
      {/* Floating Chatbot Launcher: bottom-right in LTR, bottom-left in RTL (Section 6 & 9) */}
      <div
        className={`fixed bottom-[76px] lg:bottom-6 ${
          isPageRtl ? 'left-4 lg:left-6' : 'right-4 lg:right-6'
        } z-40 flex items-center gap-3`}
      >
        {showTooltip && !isOpen && (
          <div className="bg-white text-secondary border border-surface-border shadow-card px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <span>{tooltipText}</span>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              aria-label="Close tooltip"
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setShowTooltip(false);
          }}
          aria-label={`${getClinicName(initialLocale)} Assistant`}
          aria-expanded={isOpen}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover hover:scale-105 transition-all flex items-center justify-center relative"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          <span
            className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-white"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Chat Window: 380x560px desktop; full screen on mobile (Section 9) */}
      {isOpen && (
        <div
          dir={isChatRtl ? 'rtl' : 'ltr'}
          role="dialog"
          aria-label={`${getClinicName(chatLocale)} Assistant`}
          className={`fixed inset-0 lg:inset-auto lg:bottom-24 ${
            isPageRtl ? 'lg:left-6' : 'lg:right-6'
          } lg:w-[380px] lg:h-[560px] z-50 bg-white lg:rounded-2xl shadow-2xl border border-surface-border flex flex-col overflow-hidden`}
        >
          {/* Chat Header */}
          <div className="bg-secondary text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">
                  {getClinicName(chatLocale)}{' '}
                  {chatLocale === 'ur' ? 'اسسٹنٹ' : chatLocale === 'sd' ? 'اسسٽنٽ' : 'Assistant'}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-white/85">
                  <span className="w-2 h-2 rounded-full bg-success inline-block" />
                  <span>{copy.onlineStatus}</span>
                </div>
              </div>
            </div>

            {/* Language Selector + Minimize/Close Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                aria-label="Chat Language"
                value={chatLocale}
                onChange={(e) => handleLanguageChange(e.target.value as Locale, true)}
                className="bg-white/15 text-white text-xs font-semibold rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none"
              >
                <option value="en" className="text-text-primary">
                  EN
                </option>
                <option value="ur" className="text-text-primary">
                  اردو
                </option>
                <option value="sd" className="text-text-primary">
                  سنڌي
                </option>
              </select>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Privacy Notice Banner (Section 9) */}
          <div className="bg-surface-soft border-b border-surface-border px-3 py-1.5 text-[11px] text-text-secondary text-center shrink-0">
            🔒 {copy.privacyNotice}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FCFD]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line shadow-xs ${
                    msg.isEmergency
                      ? 'bg-error text-white font-semibold border-2 border-red-700'
                      : msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-xs'
                      : 'bg-[#E6F3F5] text-text-primary rounded-bl-xs'
                  }`}
                >
                  {msg.isEmergency && (
                    <div className="flex items-center gap-1.5 mb-1 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>EMERGENCY ALERT</span>
                    </div>
                  )}
                  {msg.text}
                </div>

                {/* External Actions (Call / WhatsApp / Map) */}
                {msg.externalActions && msg.externalActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                    {msg.externalActions.map((act, idx) => (
                      <a
                        key={idx}
                        href={act.href}
                        target={act.type === 'call' ? undefined : '_blank'}
                        rel={act.type === 'call' ? undefined : 'noopener noreferrer'}
                        dir="ltr"
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 ${
                          act.type === 'call'
                            ? msg.isEmergency
                              ? 'bg-error text-white ring-2 ring-error/40'
                              : 'bg-secondary text-white'
                            : act.type === 'whatsapp'
                            ? 'bg-whatsapp text-white'
                            : 'bg-primary text-white'
                        }`}
                      >
                        {act.type === 'call' && <Phone className="w-3.5 h-3.5" />}
                        {act.type === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5" />}
                        {act.type === 'map' && <MapPin className="w-3.5 h-3.5" />}
                        <span>{act.label}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Quick Reply Buttons */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[94%]">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleQuickReply(opt)}
                        disabled={isTyping}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-primary/40 text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 3-Dot Typing Indicator (Section 9) */}
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-[#E6F3F5] text-primary rounded-2xl px-4 py-3 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleTextSubmit}
            className="p-3 bg-white border-t border-surface-border flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              maxLength={500}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={copy.inputPlaceholder}
              className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
              className="w-11 h-11 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-40 flex items-center justify-center shrink-0 transition-colors"
            >
              <Send className="w-4 h-4 rtl-flip" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
