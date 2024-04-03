import { stat } from "fs/promises";
import { globby } from "globby";
import { EOL } from "os";
import { chdir } from "process";

chdir("dist/static");

console.log("## Static file sizes" + EOL);

const staticFiles = (
  await globby(["scripts/**/*.*", "styles/**/*.*", "images/**/*.*"])
).toSorted();

const printTable = (headers, aligns, tableRows) => {
  const maxes = tableRows.reduce(
    (acc, cur) => acc.map((ms, i) => Math.max(ms, cur[i].length)),
    headers.map((h) => Math.min(h.length, 4))
  );

  const printRow = (row) => {
    console.log(
      "| " +
        row
          .map((cell, i) =>
            aligns[i] === "r" ? cell.padStart(maxes[i]) : cell.padEnd(maxes[i])
          )
          .join(" | ") +
        " |"
    );
  };

  printRow(headers);
  printRow(
    aligns.map((a, i) =>
      a === "r"
        ? "-".repeat(maxes[i] - 1) + ":"
        : ":" + "-".repeat(maxes[i] - 1)
    )
  );
  tableRows.forEach((r) => printRow(r));
};

const items = [];

for (const file of staticFiles) {
  const size = (await stat(file)).size;

  if (file.endsWith(".gz")) items[items.length - 1][2] = size;
  else if (file.endsWith(".br")) items[items.length - 1][3] = size;
  else items.push([file, size, 0, 0]);
}

const sizeToStr = (size) =>
  size === 0
    ? ""
    : size < 1024
      ? `${size} B`
      : `${(size / 1024).toFixed(1)} kB`;

const strItems = items
  .sort((a, b) => b[1] - a[1])
  .map(([file, size, gz, br]) => [
    file,
    sizeToStr(size),
    sizeToStr(gz),
    sizeToStr(br),
  ]);

printTable(["File", "Size", "Gzip", "Brotli"], ["l", "r", "r", "r"], strItems);
