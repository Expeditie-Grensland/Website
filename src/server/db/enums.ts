export const allValues = Symbol("allValues");

export type EnumTextMap<Value extends string> = Record<Value, string> & {
  [allValues]: Value[];
};
