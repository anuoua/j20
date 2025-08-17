import { effect } from "../api/effect";
import { untrackedReturn } from "../api/untracked-return";
import { isJSignal } from "../api/utils";
export const getChildren = (propChildren: any[]) => {
  if (propChildren == null) return [];
  const arr: any[] = [];
  for (let i = 0; i < propChildren.length; i++) {
    const child = propChildren[i];
    if (isJSignal(child)) {
      const el = untrackedReturn(() => child.value);

      if (typeof el === 'number' || typeof el === 'string') {
        let textNode = document.createTextNode(el + '');
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
