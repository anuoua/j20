import { effect } from "../api/effect";

export const isEvent = (eventName: string) => {
  return eventName.startsWith("on");
};

export const getEventName = (eventName: string) => {
  return eventName.slice(2).toLowerCase();
};

export const getChildren = (propChildren: any[]) => {
  const arr: any[] = [];
  for (let i = 0; i < propChildren.length; i++) {
    const child = propChildren[i];
    if (typeof child === "function") {
      const el = child();

      if (typeof el === "number" || typeof el === "string") {
        let textNode = document.createTextNode("");
        effect(() => {
          textNode.nodeValue = child();
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

export const styleObjectToString = (style: Record<string, string | number>) => {
  let styleString = "";
  for (const key in style) {
    const value = style[key];
    styleString += `${key}: ${value}; `;
  }
  return styleString.trim();
};
