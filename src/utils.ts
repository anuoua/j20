export const isPrimitive = (value: any) =>
  (typeof value !== "object" && typeof value !== "function") || value === null;
