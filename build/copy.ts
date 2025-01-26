import { watch } from "node:fs";
import { cp } from "node:fs/promises";
import { endBuildScript, startBuildScript } from "./common/build-script";
import { getArgvOption } from "./common/options";

const dir = getArgvOption("dev", "dist");

startBuildScript();

const copyStatic = async () => {
  await cp(`src/static`, `${dir}/static`, { recursive: true });
  console.info(`src/static/ => ${dir}/static/`);
};

await copyStatic();
if (dir == "dev") {
  watch("src/static", { recursive: true }, () => copyStatic());
}

endBuildScript();
