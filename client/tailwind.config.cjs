/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgbase: '#0a0b10',
        glass: 'rgba(18, 20, 32, 0.65)',
        glassSolid: 'rgba(18, 20, 32, 0.95)',
        glassBorder: 'rgba(255, 255, 255, 0.06)',
        glassBorderFocus: 'rgba(99, 102, 241, 0.3)',
        primaryIndigo: '#6366f1',
        primaryIndigoGlow: 'rgba(99, 102, 241, 0.4)',
        secondaryTeal: '#14b8a6',
        accentPurple: '#a855f7',
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        successGreen: '#10b981',
        successGreenBg: 'rgba(16, 185, 129, 0.1)',
        dangerRed: '#ef4444',
        dangerRedBg: 'rgba(239, 68, 68, 0.1)',
        warningGold: '#f59e0b',
        warningGoldBg: 'rgba(245, 158, 11, 0.1)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        glow: '0 0 25px 0 rgba(99, 102, 241, 0.2)'
      }
    },
  },
  plugins: [],
}
