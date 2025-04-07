import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { glob, rename } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { chdir } from "node:process";
import { endBuildScript, startBuildScript } from "./common/build-script";

startBuildScript();

chdir("dist/static");

const getNewName = (file: string) => {
  const fileContents = readFileSync(file);
  const hash = createHash("md5")
    .update(fileContents)
    .digest("hex")
    .slice(0, 10);
  const extI = file.indexOf(".");
  return file.slice(0, extI + 1) + hash + file.slice(extI);
};

const filesToRev = await Array.fromAsync(
  glob("**/*.*", { exclude: ["errorpages/**", "favicons/**"] })
);

const renames = filesToRev.map((file) => [file, getNewName(file)]);

for (const [oldName, newName] of renames) {
  console.info(
    `${dirname(oldName)}/{${basename(oldName)} => ${basename(newName)}}`
  );
  rename(oldName, newName);
}

const filesToRewrite = glob([
  "../server/components/**/*.js",
  "errorpages/*.html",
  "styles/*.css",
  "scripts/*.css",
]);

for await (const file of filesToRewrite) {
  let contents = readFileSync(file, "utf8");

  for (const [oldName, newName] of renames)
    contents = contents.replaceAll(oldName, newName);

  writeFileSync(file, contents, "utf-8");
}

endBuildScript();
