import { build, context } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";

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
  metafile: dir == "dist",
};

if (isProd) {
  const result = await build({ ...options, minify: true });

  if (result.metafile) {
    await mkdir("meta/", { recursive: true });
    await writeFile(
      "meta/esbuild-styles.json",
      JSON.stringify(result.metafile)
    );
  }
} else {
  const ctx = await context({ ...options, sourcemap: true });
  await ctx.watch();
}
