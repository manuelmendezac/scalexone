import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neurolink: {
          background: '#0a0a23',
          cyberBlue: '#00c2ff',
          matrixGreen: '#00ff90',
          deepPurple: '#7f00ff',
          coldWhite: '#f0faff',
          neonPink: '#ff00e5',
        },
      },
      fontFamily: {
        futuristic: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config; 