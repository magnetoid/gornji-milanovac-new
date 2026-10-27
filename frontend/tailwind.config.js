/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ink - near-black text, header rule, footer
        ink: {
          DEFAULT: '#1B1A17',
          soft: '#34312B',
        },
        // Paper - warm off-white page and card surfaces
        paper: {
          DEFAULT: '#F4F1EA',
          card: '#FBF9F4',
          deep: '#EEEAE0',
        },
        // Pine green - links, eyebrows, primary actions
        primary: {
          DEFAULT: '#2F5D46',
          light: '#3B7257',
          dark: '#24493A',
          50: '#E3E9DF',
          100: '#C9D5C3',
          200: '#A9BDA5',
          300: '#86A283',
          400: '#5F8463',
          500: '#447154',
          600: '#3B6A4F',
          700: '#2F5D46',
          800: '#24493A',
          900: '#1A362B',
        },
        // Terracotta - shop and notices
        accent: {
          DEFAULT: '#C8553D',
          light: '#D9735D',
          dark: '#A8432E',
          50: '#F8EEEA',
          100: '#F1E6DE',
          200: '#EBDDD3',
          300: '#E2B5A6',
          400: '#D9735D',
          500: '#CF6249',
          600: '#C8553D',
          700: '#B04A35',
          800: '#943E2C',
          900: '#7A3324',
        },
        // Red for errors / urgent
        red: {
          DEFAULT: '#B3412C',
          light: '#D9735D',
          dark: '#8F3322',
        },
        surface: {
          DEFAULT: '#FBF9F4',
          warm: '#F4F1EA',
          muted: '#EEEAE0',
        },
        border: {
          DEFAULT: '#DDD7CA',
          dark: '#CFC8B9',
        },
        text: {
          DEFAULT: '#1B1A17',
          secondary: '#4A463E',
          muted: '#5C574D',
          light: '#7A7468',
        },
        // Legacy support
        dark: '#1B1A17',
        secondary: {
          DEFAULT: '#C8553D',
          50: '#F8EEEA',
          100: '#F1E6DE',
          200: '#EBDDD3',
          300: '#E2B5A6',
          400: '#D9735D',
          500: '#CF6249',
          600: '#C8553D',
          700: '#B04A35',
          800: '#943E2C',
          900: '#7A3324',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        site: '1240px',
      },
    },
  },
  plugins: [],
};
