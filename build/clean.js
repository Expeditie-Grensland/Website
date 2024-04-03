import { rm } from "node:fs/promises";

const opts = ["dev", "dist"];
const dir = process.argv[2];

if (!opts.includes(dir))
  throw new Error(`Invalid choice ${dir} (choose from: ${opts.join(", ")}})`);

await rm(`${dir}/`, { recursive: true, force: true });
console.log(`Deleted ${dir}/`);
