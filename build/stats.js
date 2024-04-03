import { stat } from "fs/promises";
import { globby } from "globby";
import { EOL } from "os";
import { chdir } from "process";

chdir("dist/static");

console.log("# Statistics" + EOL);

console.log("## Static file sizes" + EOL);

const staticFiles = (await globby(["**/*.*"])).toSorted();

const printTable = (headers, tableRows) => {
  const maxes = tableRows.reduce(
    (acc, cur) => acc.map((ms, i) => (ms < cur[i].length ? cur[i].length : ms)),
    headers.map((h) => h.length)
  );

  const printRow = (row) => {
    console.log(
      "| " + row.map((cell, i) => cell.padEnd(maxes[i])).join(" | ") + " |"
    );
  };

  printRow(headers);
  printRow(maxes.map((m) => "-".repeat(m)));
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

printTable(["File", "Size", "Gzip", "Brotli"], strItems);
