import { BRAND } from "../brand";

export const isSignal = (a: any) => a?.brand === Symbol.for(BRAND);
