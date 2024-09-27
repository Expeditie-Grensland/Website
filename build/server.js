import { build, context } from "esbuild";
import { globby } from "globby";

const opts = ["dev", "dist"];
const dir = process.argv[2];

if (!opts.includes(dir))
  throw new Error(`Invalid choice ${dir} (choose from: ${opts.join(", ")}})`);

const isProd = dir === "dist";

const files = await globby(["src/server/**/*.ts", "!src/server/**/*.d.ts"]);

const options = {
  entryPoints: files,
  outdir: `${dir}/server/`,
  platform: "node",
  target: "node22",
  logLevel: "info",
};

if (isProd) {
  await build({ ...options });
} else {
  const ctx = await context({ ...options, sourcemap: true });
  await ctx.watch();
}
