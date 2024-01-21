import { parseArgs } from "node:util";

export default async (func: () => Promise<unknown>) => {
  const envFile = parseArgs({
    options: { env: { type: "string", short: "e" } },
  }).values.env;

  if (envFile) {
    const dotenv = await import("dotenv");
    dotenv.config({ path: envFile });
  }

  await func();
};
