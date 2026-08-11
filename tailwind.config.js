/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: {
          50: '#182030',
          100: '#141C2B',
          200: '#0F1724',
          300: '#0B0F17',
          border: '#1E293B',
          hover: '#1E2B42',
        },
        industrial: {
          green: '#10B981', // Healthy status
          amber: '#F59E0B', // Warning status
          red: '#EF4444',   // Critical fault
          blue: '#3B82F6',  // Info / Active status
          cyan: '#06B6D4',  // Sensor stream
          purple: '#8B5CF6' // AI engine
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 15px -3px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 15px -3px rgba(245, 158, 11, 0.4)',
        'glow-red': '0 0 15px -3px rgba(239, 68, 68, 0.4)',
        'glow-blue': '0 0 15px -3px rgba(59, 130, 246, 0.4)',
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
};
