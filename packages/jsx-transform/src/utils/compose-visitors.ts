import type { Visitor } from "@babel/core";

export const composeVisitors = (visitors: Visitor[]) => {
  const visitorStore: {
    [K in keyof Visitor]: Visitor[K][];
  } = {};

  visitors.forEach((v) => {
    Object.keys(v).forEach((k) => {
      const key = k as keyof Visitor;
      if (key in visitorStore) {
        // @ts-expect-error
        visitorStore[key].push(v[key]);
      } else {
        // @ts-expect-error
        visitorStore[key] = [v[key]];
      }
    });
  });

  const visitor: Visitor = {};

  Object.keys(visitorStore).forEach((k) => {
    const key = k as keyof Visitor;
    // @ts-expect-error
    visitor[key] = {
      // @ts-expect-error
      enter: (...args) =>
        visitorStore[key]?.forEach((i: any) =>
          i.enter
            ? i.enter(...args)
            : typeof i === "function"
              ? i(...args)
              : null
        ),
      // @ts-expect-error
      exit: (...args) =>
        visitorStore[key]?.forEach((i: any) =>
          i.exit ? i.exit(...args) : null
        ),
    };
  });

  return visitor;
};
