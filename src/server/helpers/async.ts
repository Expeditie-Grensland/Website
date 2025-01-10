export const promiseAllProps = async <Obj extends object>(
  obj: Obj
): Promise<{ [Key in keyof Obj]: Awaited<Obj[Key]> }> =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(obj).map(async ([key, value]) => [key, await value])
    )
  );
