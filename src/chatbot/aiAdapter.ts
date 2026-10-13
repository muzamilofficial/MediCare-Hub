/**
 * AI ADAPTER FOR MEDICARE HUB CHATBOT
 * =====================================
 * By default, the MediCare Hub Assistant runs 100% locally using deterministic
 * rule-based flows and multilingual keyword matching (English, Urdu, Sindhi, Roman Urdu)
 * in `src/chatbot/flows.ts`, requiring NO paid API keys.
 *
 * When you are ready to connect an LLM (Anthropic Claude or Google Gemini) for
 * open-ended natural language questions, implement `queryAIModel` below and set
 * `AI_API_KEY` in your `.env` file.
 */

import { clinicConfig } from '@/config/clinic';
import type { Locale } from '@/i18n/routing';

export interface AIAdapterInput {
  userMessage: string;
  locale: Locale;
  conversationHistory: Array<{ role: 'user' | 'bot'; text: string }>;
}

export interface AIAdapterOutput {
  handled: boolean;
  replyText?: string;
}

export const SYSTEM_SAFETY_PROMPT = `
You are the official virtual receptionist for ${clinicConfig.name} in ${clinicConfig.city.en}.
Address: ${clinicConfig.address.en}
Phone: ${clinicConfig.phone}, WhatsApp: ${clinicConfig.whatsapp}
Timings: ${clinicConfig.timings.summary.en}

STRICT MEDICAL SAFETY RULES:
1. NEVER provide a medical diagnosis, treatment plan, or medication dosage.
2. If a user describes medical symptoms, express empathy briefly, advise consulting a doctor at ${clinicConfig.name}, and offer to book an appointment.
3. If the user mentions any emergency (chest pain, difficulty breathing, heavy bleeding, unconsciousness, stroke, accident, seizure), immediately instruct them to call ${clinicConfig.emergencyPhone} or Rescue ${clinicConfig.emergencyRescue} or visit the nearest hospital emergency department.
4. Reply in the user's selected language (English, Urdu, or Sindhi) using simple, polite, spoken-style language and Western digits for all numbers, dates, and fees.
`.trim();

export async function queryAIAdapter(_input: AIAdapterInput): Promise<AIAdapterOutput> {
  // Plug in Claude / Gemini API call here when desired:
  // Example:
  // if (!process.env.AI_API_KEY) return { handled: false };
  // const response = await fetch('https://generativelanguage.googleapis.com/...', ...);
  return {
    handled: false,
  };
}
