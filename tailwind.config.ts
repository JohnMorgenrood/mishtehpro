import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background color - soft pearl/cream
        background: '#f5f0e8',
        // Primary accent - Rich rose gold/copper (feminine & elegant)
        primary: {
          50: '#fdf6f3',
          100: '#fae8e1',
          200: '#f5d1c3',
          300: '#efb5a0',
          400: '#e89277',
          500: '#d97454',
          600: '#c85d40',
          700: '#b04a36',
          800: '#923e31',
          900: '#79362c',
          DEFAULT: '#c85d40', // Rose gold/warm copper
        },
        // Secondary accent - Deep teal with purple undertones (mystical & feminine)
        secondary: {
          50: '#f0f7f9',
          100: '#dceef3',
          200: '#bddde7',
          300: '#8ec4d5',
          400: '#5aa3bc',
          500: '#3d87a1',
          600: '#346d87',
          700: '#2f5a6f',
          800: '#2d4d5c',
          900: '#29414e',
          DEFAULT: '#2f5a6f', // Mystical teal
        },
        // Accent colors
        accent: {
          gold: '#d4af37',      // Rich gold
          rose: '#e8a5a5',      // Soft rose
          lavender: '#c8b8d8',  // Gentle lavender
          sage: '#a8b5a0',      // Soft sage green
        },
      },
      backgroundColor: {
        'page': '#f5f0e8', // Soft pearl background
      },
    },
  },
  plugins: [],
};
export default config;
