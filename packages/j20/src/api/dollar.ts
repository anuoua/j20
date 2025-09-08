import { SignalLike } from "./types";

export const $ = <T>(val: T) =>
  val as unknown as T extends SignalLike
    ? (typeof val)["value"]
    : SignalLike<T>;
