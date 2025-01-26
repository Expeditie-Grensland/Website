import { analyzeMetafile, build, BuildOptions, context } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { getArgvOption } from "./common/options";

const dir = getArgvOption("dev", "dist");

const isProd = dir === "dist";

const entryPoints: BuildOptions["entryPoints"] = [
  { in: "src/client/members.ts", out: "scripts/members" },
  { in: "src/client/expeditie.ts", out: "scripts/expeditie" },
  { in: "src/client/expeditie-map.ts", out: "scripts/expeditie-map" },

  { in: "src/styles/public.css", out: "styles/public" },
  { in: "src/styles/members.css", out: "styles/members" },
  { in: "src/styles/expeditie-map.css", out: "styles/expeditie-map" },
];

const options: BuildOptions = {
  entryPoints,
  outdir: `${dir}/static/`,
  bundle: true,
  target: "es2020",
  logLevel: "info",
  external: ["/static/*"],
  color: true,
};

if (isProd) {
  const { metafile } = await build({
    ...options,
    metafile: true,
    minify: true,
  });

  console.info(await analyzeMetafile(metafile, { color: true }));
  await mkdir("meta/", { recursive: true });
  await writeFile("meta/esbuild-client.json", JSON.stringify(metafile));
} else {
  const ctx = await context({ ...options, sourcemap: "linked" });
  await ctx.watch();
}
