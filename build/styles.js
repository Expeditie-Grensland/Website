import { build, context } from "esbuild";

const opts = ["dev", "dist"];
const dir = process.argv[2];

if (!opts.includes(dir))
  throw new Error(`Invalid choice ${dir} (choose from: ${opts.join(", ")}})`);

const isProd = dir === "dist";

const files = {
  public: "src/styles/public.css",
  members: "src/styles/members.css",
  "expeditie-map": "src/styles/expeditie-map.css",
};

const options = {
  entryPoints: files,
  outdir: `${dir}/static/styles/`,
  bundle: true,
  logLevel: "info",
  external: ["/static/*"],
};

if (isProd) {
  await build({ ...options, minify: true });
} else {
  const ctx = await context({ ...options, sourcemap: true });
  await ctx.watch();
}
