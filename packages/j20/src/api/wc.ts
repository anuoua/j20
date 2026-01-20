import { getCurrentHost } from "../h/createWebComponent";

export const wc = () => {
  const host = getCurrentHost();

  if (!host) {
    throw new Error("host not found, please use `wc` in web component");
  }

  const emit = (name: string, detail: any) => {
    host.dispatchEvent(
      new CustomEvent(name, {
        detail,
      })
    );
  };

  const onConnectedCallback = (callback: () => void) => {
    (host as any).addConnectedCallback(callback);
  };

  const onDisconnectedCallback = (callback: () => void) => {
    (host as any).addDisconnectedCallback(callback);
  };

  return {
    host,
    emit,
    onConnectedCallback,
    onDisconnectedCallback,
  };
};
