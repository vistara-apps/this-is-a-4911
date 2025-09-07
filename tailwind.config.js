/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220 15% 95%)',
        accent: 'hsl(30 100% 55%)',
        primary: 'hsl(220 50% 50%)',
        surface: 'hsl(0 0% 100%)',
        'text-primary': 'hsl(220 15% 15%)',
        'text-secondary': 'hsl(220 15% 35%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(220, 15%, 15%, 0.1)',
      },
      animation: {
        'slide-up': 'slideUp 0.25s cubic-bezier(0.22,1,0.36,1)',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.22,1,0.36,1)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}