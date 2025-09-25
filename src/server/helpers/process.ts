import { spawn } from "node:child_process";

type ArgList = (string | undefined | false | ArgList)[];

const flattenArgList = (argList: ArgList): string[] =>
  argList.flatMap((arg) =>
    Array.isArray(arg)
      ? flattenArgList(arg)
      : arg === undefined || arg === false
        ? []
        : arg
  );

export const runProcess = async (
  command: string,
  args: ArgList,
  cwd?: string
) =>
  new Promise<void>((resolve, reject) => {
    const flatArgs = flattenArgList(args);

    console.info(`Running process: '${command} ${flatArgs.join(" ")}'\n`);

    const cmd = spawn(command, flattenArgList(args), {
      stdio: global.cliMode ? ["ignore", "inherit", "inherit"] : "ignore",
      cwd,
    });

    cmd.on("error", (err) => reject(err));

    cmd.on("exit", (code, signal) => {
      if (code)
        reject(new Error(`Process ended unsuccessfully (exit code ${code})`));
      if (signal)
        reject(new Error(`Process ended unsuccessfully (signal ${signal})`));

      resolve();
    });
  });
