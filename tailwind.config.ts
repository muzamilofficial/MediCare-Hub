import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/chatbot/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E9AA7',
          hover: '#0B7C87',
          dark: '#075E66',
          light: '#E6F6F8',
        },
        secondary: {
          DEFAULT: '#12355B',
          dark: '#0C2A3F',
        },
        accent: {
          DEFAULT: '#FF6B4A',
          hover: '#E8532F',
        },
        success: '#22A06B',
        warning: '#F5A524',
        error: '#E5484D',
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F3FAFB',
          border: '#E3EEF0',
          footer: '#0C2A3F',
        },
        text: {
          primary: '#1B2B34',
          secondary: '#5B6B73',
          dark: '#FFFFFF',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        urdu: ['var(--font-urdu)', 'serif'],
        sindhi: ['var(--font-sindhi)', 'serif'],
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
        input: '10px',
        chip: '999px',
      },
      boxShadow: {
        card: '0 6px 24px rgba(18, 53, 91, 0.08)',
        'card-hover': '0 12px 32px rgba(18, 53, 91, 0.14)',
        header: '0 4px 20px rgba(18, 53, 91, 0.07)',
      },
      backgroundImage: {
        'hero-overlay': 'linear-gradient(90deg, rgba(18,53,91,0.88), rgba(14,154,167,0.52))',
        'hero-overlay-rtl': 'linear-gradient(270deg, rgba(18,53,91,0.88), rgba(14,154,167,0.52))',
        'cta-gradient': 'linear-gradient(135deg, #12355B 0%, #0E9AA7 100%)',
      },
      screens: {
        xs: '360px',
      },
    },
  },
  plugins: [],
};

export default config;
