/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    {
      pattern: /./,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
  daisyui: {
    styled: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: '',
    themes: [
      {
        spcfy: {
          primary: '#000000',
          secondary: '#5cffe1',
          accent: '#F6CA27',
          neutral: '#221E38',
          'base-100': '#ffffff',
          info: '#A6C7ED',
          success: '#69c936',
          warning: '#f77b00',
          error: '#eb1f13',
        },
      },
    ],
  },
}
