const getFormStr = (formData: FormData, key: string) => {
  const item = formData.get(key);

  if (typeof item === "string") return item;

  return null;
};

const getReqFormStr = (formData: FormData, key: string) => {
  const item = getFormStr(formData, key);

  if (!item) throw `Missing required parameter: "${key}"`;

  return item;
};

const getFormInt = (formData: FormData, key: string) => {
  const item = parseInt(getFormStr(formData, key) || "");

  return item || null;
};

const getReqFormInt = (formData: FormData, key: string) => {
  const item = getFormInt(formData, key);

  if (!item) throw `Missing required parameter: "${key}"`;

  return item;
};

const getFormStrArr = (formData: FormData, key: string) => {
  const items = formData
    .getAll(key)
    .filter((item) => item && typeof item === "string") as string[];

  return items;
};

export { getFormStr, getReqFormStr, getFormInt, getReqFormInt, getFormStrArr };
