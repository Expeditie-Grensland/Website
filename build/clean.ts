import { rm } from "node:fs/promises";
import { endBuildScript, startBuildScript } from "./common/build-script";
import { getArgvOption } from "./common/options";

startBuildScript();

const dir = getArgvOption("dev", "dist");

switch (dir) {
  case "dev":
    await rm("dev/", { recursive: true, force: true });
    console.info("− dev/");
    break;

  case "dist":
    await rm("dist/", { recursive: true, force: true });
    console.info("− dist/");
    await rm("meta/", { recursive: true, force: true });
    console.info("− meta/");
    break;
}

endBuildScript();
