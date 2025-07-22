import { JComputed } from "./computed";
import { JState } from "./state";

export const isJComputed = (a: any) => a instanceof JComputed;

export const isJState = (a: any) => a instanceof JState;

export const isJSignal = (a: any) => isJComputed(a) || isJState(a);
