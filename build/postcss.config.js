import purgecss from "@fullhuman/postcss-purgecss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [
    purgecss({
      content: ["src/views/**/*.pug", "src/client/story/**/*.ts"],
      variables: true,
      safelist: {
        standard: ["satellite-icon"],
        deep: [/^mapboxgl/],
      },
    }),
    autoprefixer({ env: "> 1% in NL, not dead", cascade: false }),
  ],
};
