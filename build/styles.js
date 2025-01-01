import { purgeCSSPlugin } from "@fullhuman/postcss-purgecss";
import autoprefixer from "autoprefixer";
import { build, context } from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import postcss from "postcss";

const opts = ["dev", "dist"];
const dir = process.argv[2];

if (!opts.includes(dir))
  throw new Error(`Invalid choice ${dir} (choose from: ${opts.join(", ")}})`);

const isProd = dir === "dist";

const files = {
  expeditieMap: "src/styles/expeditieMap.sass",
  members: "src/styles/members.sass",
  public: "src/styles/public.sass",
};

const postcssProcessor = postcss([
  purgeCSSPlugin({
    content: ["./src/server/components/**/*.tsx", "./src/client/story/**/*.ts"],
    variables: true,
    safelist: {
      deep: [/^mapboxgl/, /^mapicon-/],
    },
  }),
  autoprefixer({ env: "> 1% in NL, not dead", cascade: false }),
]);

const options = {
  entryPoints: files,
  outdir: `${dir}/static/styles/`,
  bundle: true,
  logLevel: "info",
  external: ["/static/*"],
  plugins: [
    sassPlugin({
      cssImports: true,
      embedded: true,
      quietDeps: true,
      transform: async (source) =>
        (await postcssProcessor.process(source, { from: undefined })).css,
    }),
  ],
};

if (isProd) {
  await build({ ...options, minify: true });
} else {
  const ctx = await context({ ...options, sourcemap: true });
  await ctx.watch();
}
