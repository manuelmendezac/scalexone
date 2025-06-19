/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neurolink-background': '#0a0a0a',
        'neurolink-coldWhite': '#e0e0e0',
        'neurolink-cyan': '#00ffcc',
        'neurolink-violet': '#8a2be2',
        neurolink: {
          background: '#0A0A0F',
          cyberBlue: '#00ffff',
          matrixGreen: '#00ff00',
          sleep: {
            background: '#0e1a2b',
            accent: '#1c1f2e',
            text: '#a8b1cf',
          },
          focus: {
            background: '#1a1a1a',
            accent: '#2a2a2a',
            text: '#e0e0e0',
          },
          productivity: {
            background: '#0A0A0F',
            accent: '#1a1a2e',
            text: '#00FF00',
          },
          coldWhite: '#f0f0f0',
        },
        'neurolink-neonPink': '#ff00ff',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'energy-pulse': 'energyPulse 2s ease-in-out infinite',
        'processing-pulse': 'processingPulse 1.5s ease-in-out infinite',
        'speak-pulse': 'speakPulse 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'matrix-rain': 'matrixRain 1s linear infinite',
        'sleep-pulse': 'sleepPulse 4s ease-in-out infinite',
        'focus-fade': 'focusFade 2s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        energyPulse: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.1)' },
        },
        processingPulse: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2)', opacity: '0.4' },
          '100%': { transform: 'scale(1)', opacity: '0.8' },
        },
        speakPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.2' },
          '50%': { transform: 'scale(1.3)', opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        matrixRain: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        sleepPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        focusFade: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 }
        }
      },
    },
  },
  plugins: [],
} 