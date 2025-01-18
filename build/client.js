import { build, context } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";

const opts = ["dev", "dist"];
const dir = process.argv[2];

if (!opts.includes(dir))
  throw new Error(`Invalid choice ${dir} (choose from: ${opts.join(", ")}})`);

const isProd = dir === "dist";

const files = {
  all: "src/client/all.ts",
  public: "src/client/public.ts",
  members: "src/client/members.ts",
  expeditie: "src/client/expeditie.ts",
  "expeditie-map": "src/client/expeditie-map.ts",
  worker: "src/client/worker/index.ts",
};

const options = {
  entryPoints: files,
  outdir: `${dir}/static/scripts/`,
  bundle: true,
  target: "es2015",
  logLevel: "info",
  metafile: dir == "dist",
};

if (isProd) {
  const result = await build({ ...options, minify: true });

  if (result.metafile) {
    await mkdir("meta/", { recursive: true });
    await writeFile(
      "meta/esbuild-scripts.json",
      JSON.stringify(result.metafile)
    );
  }
} else {
  const ctx = await context({ ...options, sourcemap: true });
  await ctx.watch();
}
