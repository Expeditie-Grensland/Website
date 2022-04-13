const tailwind = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

module.exports = {
  plugins: [
    tailwind,
    autoprefixer,
    ...(process.env.NODE_ENV === "production" ? [cssnano] : []),
  ],
};
