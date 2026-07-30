import type { Visitor } from "@babel/core";

type VisitFn = (path: any, state: any) => void;

interface NodeHandlers {
  enter?: VisitFn[];
  exit?: VisitFn[];
}

const pushEnter = (handlers: NodeHandlers, fn: VisitFn): void => {
  (handlers.enter ??= []).push(fn);
};

export const composeVisitors = (visitors: Visitor[]): Visitor => {
  const buckets = new Map<string, NodeHandlers>();

  for (const visitor of visitors) {
    for (const key in visitor) {
      const handler = (visitor as Record<string, any>)[key];
      if (!handler) continue;

      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {};
        buckets.set(key, bucket);
      }

      if (typeof handler === "function") {
        pushEnter(bucket, handler);
      } else {
        if (handler.enter) pushEnter(bucket, handler.enter);
        if (handler.exit) {
          (bucket.exit ??= []).push(handler.exit);
        }
      }
    }
  }

  const merged: Record<
    string,
    { enter: VisitFn; exit: VisitFn }
  > = {};

  for (const [key, { enter, exit }] of buckets) {
    merged[key] = {
      enter: (path, state) => enter?.forEach((fn) => fn.call(state, path, state)),
      exit: (path, state) => exit?.forEach((fn) => fn.call(state, path, state)),
    };
  }

  return merged as unknown as Visitor;
};
