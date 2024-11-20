/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4F46E5',
          DEFAULT: '#4338CA',
          dark: '#3730A3',
        },
        accent: {
          light: '#10B981',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        background: {
          light: '#FFFFFF',
          dark: '#111827',
        },
        text: {
          light: '#1F2937',
          dark: '#F9FAFB',
        }
      },
      backgroundImage: {
        'grid-pattern': "url('/images/grid.png')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
