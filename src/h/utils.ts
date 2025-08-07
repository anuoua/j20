import { effect } from "../api/effect";
import { untrackedReturn } from "../api/untracked-return";
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

export const getChildren = (propChildren: any[]) => {
  if (propChildren == null) return [];
  const arr: any[] = [];
  for (let i = 0; i < propChildren.length; i++) {
    const child = propChildren[i];
    if (isJSignal(child)) {
      const el = untrackedReturn(() => child.value);

      if (typeof el === 'number' || typeof el === 'string') {
        let textNode = document.createTextNode("");
        effect(() => {
          textNode.nodeValue = child.value;
        });
        arr.push(textNode);
      } else {
        arr.push(el);
      }

    } else if (child != undefined) {
      arr.push(child);
    }
  }
  return arr;
};
