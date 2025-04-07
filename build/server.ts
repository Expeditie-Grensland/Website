import { build, BuildOptions, context } from "esbuild";
import { glob } from "node:fs/promises";
import { getArgvOption } from "./common/options";

const dir = getArgvOption("dev", "dist");

const isProd = dir === "dist";

const entryPoints = await Array.fromAsync(
  glob(["src/server/**/*.ts", "src/server/**/*.tsx"], {
    exclude: ["**/*.d.ts"],
  })
);

const options: BuildOptions = {
  entryPoints,
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
