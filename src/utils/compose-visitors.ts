import type { Visitor } from "@babel/core";

export const composeVisitors = (enterVisitors: Visitor[], exitVisitors: Visitor[]) => {
  const enterVisitorStore: {
    [K in keyof Visitor]: Visitor[K][];
  } = {};

  enterVisitors.forEach((v) => {
    Object.keys(v).forEach((k) => {
      const key = k as keyof Visitor;
      if (key in enterVisitorStore) {
        // @ts-expect-error
        enterVisitorStore[key].push(v[key]);
      } else {
        // @ts-expect-error
        enterVisitorStore[key] = [v[key]];
      }
    });
  });

  const exitVisitorStore: {
    [K in keyof Visitor]: Visitor[K][];
  } = {};

  exitVisitors.forEach((v) => {
    Object.keys(v).forEach((k) => {
      const key = k as keyof Visitor;
      if (key in exitVisitorStore) {
        // @ts-expect-error
        exitVisitorStore[key].push(v[key]);
      } else {
        // @ts-expect-error
        exitVisitorStore[key] = [v[key]];
      }
    });
  });

  const visitor: Visitor = {};

  Object.keys(enterVisitorStore).forEach((k) => {
    const key = k as keyof Visitor;
    // @ts-expect-error
    visitor[key] = {
      // @ts-expect-error
      enter: (...args) => enterVisitorStore[key].forEach((i) => i(...args))
    };
  });

  Object.keys(exitVisitorStore).forEach((k) => {
    const key = k as keyof Visitor;

    if (visitor[key]) {
      // @ts-expect-error
      visitor[key].exit = (...args) => exitVisitorStore[key].forEach((i) => i(...args));
    } else {
      visitor[key] = {
        // @ts-expect-error
        exit: (...args) => exitVisitorStore[key].forEach((i) => i(...args))
      };
    }
  });

  return visitor;
};
