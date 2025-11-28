import { effect } from "./effect";

export const onDestroy = (callback: () => void) => effect(() => callback);
