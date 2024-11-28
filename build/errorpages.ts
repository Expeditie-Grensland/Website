import { mkdir, writeFile } from "fs/promises";
import { renderErrorPage } from "../src/server/components/pages/public/error.js";
import { httpErrors } from "../src/server/helpers/http-errors.js";

await mkdir("dist/static/errorpages/", { recursive: true });

await Promise.all(
  Object.entries(httpErrors).map(([code, description]) =>
    writeFile(
      `dist/static/errorpages/${code}.html`,
      "<!DOCTYPE html>" +
        renderErrorPage({ code, description, staticRender: true })
    )
  )
);

console.log(`Generated ${Object.keys(httpErrors).length} error pages`);
