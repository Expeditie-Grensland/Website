const formsPlugin = require("@tailwindcss/forms");

module.exports = {
  content: ["./app/**/*.{jsx,tsx}"],
  theme: {
    screens: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
    },
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "2rem",
        lg: "2rem",
        xl: "3rem",
      },
    },
    fontFamily: {
      sans: '"Open Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
    extend: {
      colors: {
        p: {
          back: "#333",
          text: "#fafafa",
          lgray: "#c7c7c7",
          gray: "#a1a1a1",
        },
        m: {
          back: "#fff",
          text: "#111",
          lgray: "#aaa",
          gray: "#6a6a6a",
          dgray: "#444",
        },
      },
      boxShadow: {
        important: "0 0 30px -10px #000",
        "important-hover": "0 0 30px -5px #000",
      },
      brightness: {
        80: ".8",
      },
    },
  },
  plugins: [formsPlugin],
};
