import { glob, stat } from "node:fs/promises";
import { chdir } from "node:process";
import { mdHeading, mdTable } from "./common/markdown";

chdir("dist/static");

console.info(mdHeading(2, "Static file sizes"));

const staticFiles = (
  await Array.fromAsync(
    glob("**/*.*", { exclude: ["errorpages/**", "favicons/**"] })
  )
).toSorted();

const items: { file: string; size: number; gz?: number; br?: number }[] = [];

for (const file of staticFiles) {
  const size = (await stat(file)).size;

  if (file.endsWith(".gz")) items[items.length - 1].gz = size;
  else if (file.endsWith(".br")) items[items.length - 1].br = size;
  else items.push({ file, size });
}

const sizeToStr = (size: number | undefined) =>
  !size ? "" : size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} kB`;

console.info(
  mdTable(
    [
      { label: "File", align: "l" },
      { label: "Size", align: "r" },
      { label: "Gzip", align: "r" },
      { label: "Brotli", align: "r" },
    ],

    items
      .sort((a, b) => b.size - a.size)
      .map(({ file, size, gz, br }) => [
        file,
        sizeToStr(size),
        sizeToStr(gz),
        sizeToStr(br),
      ])
  )
);
