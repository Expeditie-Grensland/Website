type Falsy = false | 0 | 0n | "" | null | undefined;
export type ClassArray = string | Falsy | ClassArray[];

const cx = (...classes: ClassArray[]) =>
  classes
    .flat(Infinity)
    .filter((c) => c)
    .join(" ");

export default cx;
