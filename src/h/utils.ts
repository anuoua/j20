import { effect } from "../api/effect";
import { untrackedReturn } from "../api/untracked-return";
import { isSignal } from "../api/utils";

export const isEvent = (eventName: string) => {
  return eventName.startsWith("on");
};

export const getEventName = (eventName: string) => {
  return eventName.slice(2).toLocaleLowerCase();
};

export const getChildren = (propChildren: any[]) => {
  if (propChildren == null) return [];
  const arr: any[] = [];
  for (let i = 0; i < propChildren.length; i++) {
    const child = propChildren[i];
    if (isSignal(child)) {
      const el = untrackedReturn(() => child.value);

      if (typeof el === "number" || typeof el === "string") {
        let textNode = document.createTextNode(el + "");
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

let overflow = "";
let count = 0;

export const generateId = () => {
  if (count === Number.MAX_SAFE_INTEGER) {
    overflow += count.toString(32);
    count = 0;
  }
  return `${overflow}${(count++).toString(32)}`;
};
