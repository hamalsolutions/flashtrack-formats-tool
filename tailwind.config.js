/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
      extend: {
        maxHeight: {
          "80vh": "80vh",
        }
      },
    },
    plugins: [],
  }