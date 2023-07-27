const getEnv = (varName: string, defaultValue?: string): string => {
  const value = process.env[varName] || defaultValue;

  if (value === undefined)
    throw new Error(`Environment variable '${varName}' must be defined`);

  return value;
};

const getEnvLdapScope = (varName: string): "base" | "one" | "sub" => {
  const value = getEnv(varName);

  if (value !== "base" && value !== "one" && value !== "sub")
    throw new Error(
      `Environment variable '${varName} must be 'base', 'one', or 'sub'`
    );

  return value;
};

export const config = {
  port: getEnv("EG_PORT"),

  files: {
    baseUrl: getEnv("EG_FILES_BASE_URL"),
  },

  mongo: {
    url: getEnv("EG_MONGO_URL"),
  },

  ldap: {
    url: getEnv("EG_LDAP_URL"),
    bindDN: getEnv("EG_LDAP_BIND_DN"),
    bindCredentials: getEnv("EG_LDAP_BIND_CREDENTIALS"),
    searchBase: getEnv("EG_LDAP_SEARCH_BASE"),
    searchScope: getEnvLdapScope("EG_LDAP_SEARCH_SCOPE"),
    searchFilter: getEnv("EG_LDAP_SEARCH_FILTER"),
    idField: getEnv("EG_LDAP_ID_FIELD"),
  },

  redis: {
    url: getEnv("EG_REDIS_URL", ""),
    prefix: getEnv("EG_REDIS_PREFIX", "expeditie-grensland:"),
  },

  session: {
    secret: getEnv("EG_SESSION_SECRET"),
  },
};
