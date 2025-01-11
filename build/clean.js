import { rm } from "node:fs/promises";

const opts = ["dev", "dist"];
const dir = process.argv[2];

if (!opts.includes(dir))
  throw new Error(`Invalid choice ${dir} (choose from: ${opts.join(", ")}})`);

switch (dir) {
  case "dev":
    await rm("dev/", { recursive: true, force: true });
    console.info("Deleted dev/");
    break;

  case "dist":
    await rm("dist/", { recursive: true, force: true });
    console.info("Deleted dist/");
    await rm("meta/", { recursive: true, force: true });
    console.info("Deleted meta/");
    break;
}
