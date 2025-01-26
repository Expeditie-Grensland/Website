export const getArgvOption = <T extends string>(...opts: T[]): T => {
  const value = process.argv[2];

  if (!opts.includes) {
    throw new Error(
      `Invalid option ${value} (choose from: ${opts.join(", ")}})`
    );
  }
  return value as T;
};
