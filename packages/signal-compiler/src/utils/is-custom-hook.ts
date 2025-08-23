export const isCustomHook = (id: string) => {
  return id.startsWith("$use");
};
