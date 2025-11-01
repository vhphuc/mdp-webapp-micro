/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  prefix: 'tw-',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#164a66',
        'primary-light': '#2f6987',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}

