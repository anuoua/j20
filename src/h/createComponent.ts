import { instanceCreate } from "./instance";

export const createComponent = (tag: FC, props: Props) => {
  let [, fragment] = instanceCreate(() => tag(props));
  return fragment;
};
