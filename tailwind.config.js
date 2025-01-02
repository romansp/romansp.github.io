import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "80ch",
          },
        },
      },
    },
  },
  plugins: [typography],
};
