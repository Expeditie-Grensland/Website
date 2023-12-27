import { spawn } from "node:child_process";

type ArgList = (string | string[])[];

export const runProcess = async (command: string, args: ArgList) =>
  new Promise<void>((resolve, reject) => {
    const cmd = spawn(command, args.flat(2), { stdio: "ignore" });

    cmd.on("error", (err) => reject(err));

    cmd.on("exit", (code, signal) => {
      if (code)
        reject(new Error(`Process ended unsuccessfully (exit code ${code})`));
      if (signal)
        reject(new Error(`Process ended unsuccessfully (signal ${signal})`));

      resolve();
    });
  });
