import { mkdir, writeFile } from "fs/promises";
import { ErrorPage } from "../src/server/components/pages/public/error.js";
import { httpErrors } from "../src/server/helpers/http-errors.js";
import { renderComponent } from "../src/server/helpers/render.js";
import { endBuildScript, startBuildScript } from "./common/build-script.js";

startBuildScript();

await mkdir("dist/static/errorpages/", { recursive: true });

for (const code in httpErrors) {
  await writeFile(
    `dist/static/errorpages/${code}.html`,
    await renderComponent(ErrorPage, {
      code,
      description: httpErrors[code],
      staticRender: true,
    })
  );

  console.info(`errorpages/${code}.html: ${httpErrors[code]}`);
}

await Promise.all(
  Object.entries(httpErrors).map(
    async ([code, description]) =>
      await writeFile(
        `dist/static/errorpages/${code}.html`,
        await renderComponent(ErrorPage, {
          code,
          description,
          staticRender: true,
        })
      )
  )
);

endBuildScript();
