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
    colors: {
      "white": "#fff",
      "white-ish": "#fafafa",
      "light-gray": "#c7c7c7",
      "normal-gray": "#a1a1a1",
      "back-gray": "#333",
      "black-ish": "#111",
      overlay: "rgba(0, 0, 0, .45)",
    },
    fontFamily: {
      sans: '"Open Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
    extend: {
      boxShadow: {
        important: "0 0 30px -10px #000",
        "important-hover": "0 0 30px -5px #000",
      },
      brightness: {
        80: ".8",
      },
    },
  },
  plugins: [],
};

