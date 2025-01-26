import { EOL } from "os";

const timeLabel = "⚡ Duration";

export const startBuildScript = () => {
  process.stdout.write(EOL);
  console.group();
  console.time(timeLabel);
};

export const endBuildScript = () => {
  process.stdout.write(EOL);
  console.groupEnd();
  console.timeEnd(timeLabel);
  process.stdout.write(EOL);
};
