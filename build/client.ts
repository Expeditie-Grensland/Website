import { glob, mkdir, writeFile } from "node:fs/promises";
import { analyzeMetafile, type BuildOptions, build, context } from "esbuild";
import { getArgvOption } from "./common/options";

const dir = getArgvOption("dev", "dist");

const isProd = dir === "dist";

const scriptEntries = await Array.fromAsync(
  glob("*.ts", { cwd: "src/client" })
);

const styleEntries = await Array.fromAsync(
  glob("*.css", { cwd: "src/styles" })
);

const entryPoints: BuildOptions["entryPoints"] = [
  ...scriptEntries.map((entry) => ({
    in: `src/client/${entry}`,
    out: `scripts/${entry.replace(/\.ts$/, "")}`,
  })),

  ...styleEntries.map((entry) => ({
    in: `src/styles/${entry}`,
    out: `styles/${entry.replace(/\.css$/, "")}`,
  })),
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
