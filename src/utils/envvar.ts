export const envvar = (name: string): string | undefined => {
  return import.meta.env[name];
};

export const envvarBoolean = (name: string): boolean => {
  const value = envvar(name);
  if (value === undefined) {
    return false;
  }
  return value === "true";
};
