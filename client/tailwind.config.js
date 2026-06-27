/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pm: {
          bg: { app: '#F4F6F9', surface: '#FFFFFF', subtle: '#EEF1F6', muted: '#F8FAFC' },
          brand: {
            DEFAULT: '#7C6BF0',
            hover: '#6A58E8',
            active: '#5B4AD9',
            subtle: '#F0EDFE',
            muted: '#C4B8F9',
          },
          text: { primary: '#2E3A4A', secondary: '#6B7C93', tertiary: '#9AA5B5', inverse: '#FFFFFF' },
          border: { DEFAULT: '#E2E8F0', strong: '#CBD5E1', focus: '#7C6BF0' },
          status: {
            active: '#22C55E', activeBg: '#ECFDF5',
            paused: '#F59E0B', pausedBg: '#FFFBEB',
            done: '#94A3B8', doneBg: '#F1F5F9',
            backlog: '#6366F1', backlogBg: '#EEF2FF',
          },
          priority: {
            today: '#EF4444', todayBg: '#FEF2F2',
            high: '#F97316', highBg: '#FFF7ED',
            normal: '#6B7C93', normalBg: '#F1F5F9',
            low: '#94A3B8', lowBg: '#F8FAFC',
          },
          feedback: { success: '#22C55E', warning: '#F59E0B', error: '#EF4444', info: '#7C6BF0' },
          chart: { 1: '#7C6BF0', 2: '#22D3EE', 3: '#F472B6', 4: '#FB923C', 5: '#509EE3' },
        },
      },
      borderRadius: {
        'pm-sm': '6px',
        'pm-md': '10px',
        'pm-lg': '14px',
        'pm-xl': '18px',
        'pm-2xl': '22px',
      },
      boxShadow: {
        'pm-sm': '0 1px 2px rgba(16,24,40,0.05)',
        'pm-md': '0 4px 12px rgba(16,24,40,0.08)',
        'pm-lg': '0 12px 32px rgba(16,24,40,0.12)',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'system-ui', 'sans-serif'],
        mono: ['"Vazirmatn FD"', '"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        // Named PM type tokens (UI Kit §2.3)
        display: ['28px', { lineHeight: '1.3', fontWeight: '700' }],
        'title-lg': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        title: ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        body: ['14px', { lineHeight: '1.6' }],
        'body-sm': ['13px', { lineHeight: '1.6' }],
        label: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        caption: ['11px', { lineHeight: '1.4', fontWeight: '500' }],
        metric: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'metric-sm': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
      },
      transitionDuration: {
        fast: '120ms',
        normal: '180ms',
      },
      maxWidth: {
        content: '1280px',
      },
      height: {
        sidebar: '260px',
        'sidebar-collapsed': '64px',
        header: '56px',
      },
    },
  },
  plugins: [],
};
