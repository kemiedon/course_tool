/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Coffee 主題色彩 (轉換自 DaisyUI Coffee Theme)
        base: {
          100: '#3d2f2f', // oklch(24% 0.023 329.708)
          200: '#322626', // oklch(21% 0.021 329.708)
          300: '#251e1e', // oklch(16% 0.019 329.708)
          content: '#d4a574', // oklch(72.354% 0.092 79.129)
        },
        primary: {
          DEFAULT: '#d4a574', // oklch(71.996% 0.123 62.756)
          content: '#221a15', // oklch(14.399% 0.024 62.756)
          50: '#fef9f3',
          100: '#fdf2e3',
          200: '#fae4c7',
          300: '#f7d5a4',
          400: '#e9bd7a',
          500: '#d4a574', // 主色
          600: '#b88a5d',
          700: '#8f6a46',
          800: '#6b4f35',
          900: '#4a3625',
        },
        secondary: {
          DEFAULT: '#3e5a5e', // oklch(34.465% 0.029 199.194)
          content: '#dfe3e3', // oklch(86.893% 0.005 199.194)
        },
        accent: {
          DEFAULT: '#4a6fa5', // oklch(42.621% 0.074 224.389)
          content: '#e3e9f0', // oklch(88.524% 0.014 224.389)
        },
        neutral: {
          DEFAULT: '#251e1e', // oklch(16.51% 0.015 326.261)
          content: '#d4d1d1', // oklch(83.302% 0.003 326.261)
        },
        info: {
          DEFAULT: '#7dd3fc', // oklch(79.49% 0.063 184.558)
          content: '#1e3a42', // oklch(15.898% 0.012 184.558)
        },
        success: {
          DEFAULT: '#84cc16', // oklch(74.722% 0.072 131.116)
          content: '#1c2e15', // oklch(14.944% 0.014 131.116)
        },
        warning: {
          DEFAULT: '#fbbf24', // oklch(88.15% 0.14 87.722)
          content: '#2e2516', // oklch(17.63% 0.028 87.722)
        },
        error: {
          DEFAULT: '#fb7185', // oklch(77.318% 0.128 31.871)
          content: '#271819', // oklch(15.463% 0.025 31.871)
        },
      },
      borderRadius: {
        'selector': '1rem',
        'field': '0.5rem',
        'box': '1rem',
      },
    },
  },
  plugins: [],
}
