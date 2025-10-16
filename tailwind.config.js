/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'lime-yellow': 'var(--lime-yellow)',
        'electric-blue': 'var(--electric-blue)',
        graphite: 'var(--graphite)',
        smoke: 'var(--smoke)',
        'light-grey': 'var(--light-grey)',
        'dark-grey': 'var(--dark-grey)',
        blue: 'var(--blue)',
        brown: 'var(--brown)',
        'dark-electric-blue': 'var(--dark-electric-blue)',
        
        'blue-shade': {
          25: 'var(--electric-blue-25)',
          50: 'var(--electric-blue-50)',
          100: 'var(--electric-blue-100)',
          200: 'var(--electric-blue-200)',
          300: 'var(--electric-blue-300)',
          400: 'var(--electric-blue-400)',
          500: 'var(--electric-blue-500)',
          600: 'var(--electric-blue-600)',
          700: 'var(--electric-blue-700)',
          800: 'var(--electric-blue-800)',
          900: 'var(--electric-blue-900)',
      },
      'yellow-shade': {
          50: 'var(--lime-yellow-50)',
          400: 'var(--lime-yellow-400)',
          600: 'var(--lime-yellow-600)',
          700: 'var(--lime-yellow-700)',
          800: 'var(--lime-yellow-800)',
        },
      'smoke-shade': {
          25: 'var(--smoke-25)',
          50: 'var(--smoke-50)',
          300: 'var(--smoke-300)',
          400: 'var(--smoke-400)',
          600: 'var(--smoke-600)',
        },
       'graphite-shade': {
          25: 'var(--graphite-25)',
          50: 'var(--graphite-50)',
          200: 'var(--graphite-200)',
          300: 'var(--graphite-300)',
          600: 'var(--graphite-600)',
        },
      },

      screens: {     
        // '2xl': '1700px', // Adjust this to a larger width
        '3xl': '1400px',
        "4xl": '1520px',
        "5xl": "1620px",
        "7xl": "2300px",
        "9xl": "3000px"
      },

    },
  },
  plugins: [require("tailgrids/plugin")],
};
