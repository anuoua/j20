import { getHost } from "../web-components";

export const wc = () => {
  const host = getHost();

  if (!host) {
    throw new Error("host not found, please use in web component");
  }

  const emit = (name: string, detail: any) => {
    host.dispatchEvent(
      new CustomEvent(name, {
        detail,
      })
    );
  };

  return {
    host,
    emit,
  };
};
