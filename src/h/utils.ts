import { effect } from "../api/effect";
import { isJSignal } from "../api/utils";

export const getProp = (prop: Record<string, any>) => {
  return Object.keys(prop).reduce((pre, cur) => {
    if (cur === "children") {
      pre[cur] = prop[cur];
    } else {
      pre[cur] = prop[cur].value;
    }
    return pre;
  }, {} as Record<string, any>);
};

export const getProps = (props: Props) => {
  if (Array.isArray(props)) {
    const ps: Record<string, any>[] = [];
    for (let p of props) {
      if (isJSignal(p)) {
        ps.push(p.value);
      } else {
        const r = getProp(p);
        ps.push(r);
      }
    }
    return Object.assign({}, ...ps);
  } else {
    return getProp(props);
  }
};

export const getChildren = (propChildren: any) => {
  if (propChildren == null) return [];
  const arr: any[] = [];
  const arrayChildren: any[] = [].concat(propChildren);
  for (const child of arrayChildren) {
    const el = isJSignal(child) ? child.value : child; // unwatch
    if (typeof el === "string") {
      let textNode = document.createTextNode("");
      effect(() => {
        textNode.nodeValue = isJSignal(child) ? child.value : child;
      });
      arr.push(textNode);
    } else {
      arr.push(el);
    }
  }
  return arr;
};
