import { build, context } from "esbuild";
import { writeFile } from "fs/promises";

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
  expeditieMap: "src/client/expeditieMap.ts",
  expeditieMapWorker: "src/client/expeditieMapWorker.ts",
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
  await writeFile(
    `${dir}/static/scripts/esbuild-meta.json`,
    JSON.stringify(result.metafile)
  );
} else {
  const ctx = await context({ ...options, sourcemap: true });
  await ctx.watch();
}
