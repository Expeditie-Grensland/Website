import { build, BuildOptions, context } from "esbuild";
import { globby } from "globby";
import { getArgvOption } from "./common/options";

const dir = getArgvOption("dev", "dist");

const isProd = dir === "dist";

const files = await globby([
  "src/server/**/*.{ts,tsx}",
  "!src/server/**/*.d.ts",
]);

const options: BuildOptions = {
  entryPoints: files,
  outdir: `${dir}/server/`,
  platform: "node",
  target: "node22",
  logLevel: "info",
  color: true,
};

if (isProd) {
  await build({ ...options });
  console.info();
} else {
  const ctx = await context({ ...options, sourcemap: "linked" });
  await ctx.watch();
}
