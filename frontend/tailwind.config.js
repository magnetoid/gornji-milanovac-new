/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep forest green - Šumadija
        primary: {
          DEFAULT: '#1B5E20',
          light: '#2E7D32',
          dark: '#0a2e0d',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        // Warm amber/gold - harvest colors
        accent: {
          DEFAULT: '#F57F17',
          light: '#FFB300',
          dark: '#E65100',
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFC107',
          600: '#FFB300',
          700: '#FFA000',
          800: '#FF8F00',
          900: '#F57F17',
        },
        // Red for breaking news / urgent
        red: {
          DEFAULT: '#C62828',
          light: '#EF5350',
          dark: '#B71C1C',
        },
        // Surfaces - warm whites
        surface: {
          DEFAULT: '#FFFFFF',
          warm: '#FAFAF7',
          muted: '#F4F3EF',
        },
        // Warm border
        border: {
          DEFAULT: '#E8E5DF',
          dark: '#D1CEC7',
        },
        // Text colors
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#4A4A4A',
          muted: '#7A7A7A',
        },
        // Legacy support
        dark: '#0a2e0d',
        secondary: {
          DEFAULT: '#F57F17',
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFC107',
          600: '#FFB300',
          700: '#FFA000',
          800: '#FF8F00',
          900: '#F57F17',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
      },
      animation: {
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
