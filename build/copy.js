import { cp } from "node:fs/promises";
import { watch } from "node:fs";

const opts = ["dev", "dist"];
const dir = process.argv[2];
const subDirs = ["static"];

if (!opts.includes(dir))
  throw new Error(`Invalid choice ${dir} (choose from: ${opts.join(", ")}})`);

const copySubDir = async (subDir) => {
  await cp(`src/${subDir}`, `${dir}/${subDir}`, { recursive: true });
  console.log(`Copied src/${subDir}/ to ${dir}/${subDir}/`);
};

await Promise.all(subDirs.map(copySubDir));

if (dir == "dev")
  subDirs.forEach((subDir) => {
    console.log(`Watching src/${subDir}/...`);
    watch(`src/${subDir}`, { recursive: true }, () => copySubDir(subDir));
  });
