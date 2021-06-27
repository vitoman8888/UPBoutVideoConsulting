module.exports = {
  purge: ['./**/*.html'],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI",Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        header: ['Major Mono Display', 'monospace'],
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
