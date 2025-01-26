import { mkdir, writeFile } from "fs/promises";
import { renderErrorPage } from "../src/server/components/pages/public/error.js";
import { httpErrors } from "../src/server/helpers/http-errors.js";
import { endBuildScript, startBuildScript } from "./common/build-script.js";

startBuildScript();

await mkdir("dist/static/errorpages/", { recursive: true });

for (const code in httpErrors) {
  await writeFile(
    `dist/static/errorpages/${code}.html`,
    "<!DOCTYPE html>" +
      renderErrorPage({
        code,
        description: httpErrors[code],
        staticRender: true,
      })
  );

  console.info(`errorpages/${code}.html: ${httpErrors[code]}`);
}

await Promise.all(
  Object.entries(httpErrors).map(([code, description]) =>
    writeFile(
      `dist/static/errorpages/${code}.html`,
      "<!DOCTYPE html>" +
        renderErrorPage({ code, description, staticRender: true })
    )
  )
);

endBuildScript();
