import { computed } from "../api/computed";
import { createComponent } from "./createComponent";
import { instanceCreate } from "./instance";

export const creatRoot = (boot: () => JSX.Element) => {
  let [instance, fragment] = instanceCreate(() => boot());

  return {
    element: fragment,
    instance,
  };
};
