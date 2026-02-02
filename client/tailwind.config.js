/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fuse type colors
        'fuse-mcb': '#3B82F6',
        'fuse-rcbo': '#8B5CF6',
        'fuse-rcd': '#EC4899',
        'fuse-main': '#EF4444',
        'fuse-spd': '#F59E0B',
        'fuse-din': '#6B7280',
        // Load status colors
        'load-safe': '#22C55E',
        'load-warning': '#EAB308',
        'load-danger': '#EF4444',
      },
    },
  },
  plugins: [],
};
