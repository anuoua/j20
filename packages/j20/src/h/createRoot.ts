import { instanceCreate } from "./instance";

export const createRoot = (boot: () => JSX.Element) => {
  let [instance, fragment] = instanceCreate(() => boot());

  return {
    element: fragment,
    instance,
  };
};
