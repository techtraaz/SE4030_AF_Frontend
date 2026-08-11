import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
      container: {
          center: true,
          padding: "2rem",
          screens: {
              "2xl": "1400px",
          },
      },
      extend: {
          colors: {
              brand: {
                  white: '#FFFFFF',
                  ivory: '#F7F6F2',
                  dark: '#0A0A0A',
                  blue: '#197FE6',
                  'blue-deep': '#0066FF',
                  'blue-light': '#4C99E6',
                  'blue-pale': '#137FEC',
                  gray: '#6B7280',
                  'gray-dark': '#475569',
                  'gray-mid': '#64748B',
                  'gray-soft': '#94A3B8',
                  'gray-mist': '#F1F5F9',
                  'gray-ghost': '#F8FAFC',
                  'gray-faint': '#F6F7F8',
                  navy: '#0F172A',
                  'navy-mid': '#1E293B',
                  'navy-light': '#334155',
                  mist: '#E2E8F0',
                  'mist-dark': '#F5F5F9',
                  green: '#10B981'
              },
              background: 'hsl(var(--background))',
              foreground: 'hsl(var(--foreground))',
              card: {
                  DEFAULT: 'hsl(var(--card))',
                  foreground: 'hsl(var(--card-foreground))'
              },
              popover: {
                  DEFAULT: 'hsl(var(--popover))',
                  foreground: 'hsl(var(--popover-foreground))'
              },
              primary: {
                  DEFAULT: 'hsl(var(--primary))',
                  foreground: 'hsl(var(--primary-foreground))'
              },
              secondary: {
                  DEFAULT: 'hsl(var(--secondary))',
                  foreground: 'hsl(var(--secondary-foreground))'
              },
              muted: {
                  DEFAULT: 'hsl(var(--muted))',
                  foreground: 'hsl(var(--muted-foreground))'
              },
              accent: {
                  DEFAULT: 'hsl(var(--accent))',
                  foreground: 'hsl(var(--accent-foreground))'
              },
              destructive: {
                  DEFAULT: 'hsl(var(--destructive))',
                  foreground: 'hsl(var(--destructive-foreground))'
              },
              border: 'hsl(var(--border))',
              input: 'hsl(var(--input))',
              ring: 'hsl(var(--ring))',
              chart: {
                  '1': 'hsl(var(--chart-1))',
                  '2': 'hsl(var(--chart-2))',
                  '3': 'hsl(var(--chart-3))',
                  '4': 'hsl(var(--chart-4))',
                  '5': 'hsl(var(--chart-5))'
              }
          },
          borderRadius: {
              brand: '0.75rem',
              lg: 'var(--radius)',
              md: 'calc(var(--radius) - 2px)',
              sm: 'calc(var(--radius) - 4px)'
          }
      }
  },
  plugins: [tailwindcssAnimate],
}