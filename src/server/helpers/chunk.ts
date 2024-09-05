export const asyncMapInChunks = async <TIn, TOut>(
  arr: TIn[],
  length: number,
  func: (chunk: TIn[]) => Promise<TOut>
) => {
  const results: TOut[] = [];

  for (let i = 0; i < arr.length; i += length) {
    results.push(await func(arr.slice(i, i + length)));
  }

  return results;
};
