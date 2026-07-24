import { effect } from "../api/effect";
import { getCurrentInstance } from "./instance";

export const exist = (val: any) => val !== undefined;

export const isEvent = (eventName: string) => eventName.startsWith("on");

export const isNativeEvent = (eventName: string) =>
  eventName.startsWith("onNative");

export const getNativeEventName = (eventName: string) =>
  eventName.slice(8).toLowerCase();

export const getEventName = (eventName: string) =>
  eventName.slice(2).toLowerCase();

export const getChildren = (propChildren: any[]) => {
  const arr: any[] = [];
  for (let i = 0; i < propChildren.length; i++) {
    const child = propChildren[i];
    if (typeof child === "function") {
      let textNode: Text | undefined;
      let current: Node | undefined;
      const effectInstance = effect(() => {
        const el = child();
        if (typeof el === "number" || typeof el === "string") {
          if (textNode) {
            textNode.nodeValue = el + "";
          } else {
            textNode = document.createTextNode(el + "");
            if (current?.parentNode) {
              current.parentNode.replaceChild(textNode, current);
            } else {
              arr.push(textNode);
            }
          }
          current = textNode;
        } else if (el != null) {
          if (current?.parentNode) {
            current.parentNode.replaceChild(el, current);
          } else {
            arr.push(el);
          }
          current = el;
          textNode = undefined;
        }
      });
      if (!textNode) {
        effectInstance.dispose();
      }
    } else if (child != undefined) {
      arr.push(child);
    }
  }
  return arr;
};

let count = 0;
export const generateId = () => (++count).toString(32);

export const styleObjectToString = (style: Record<string, string | number>) => {
  let styleString = "";
  for (const key in style) {
    const value = style[key];
    styleString += `${key}: ${value}; `;
  }
  return styleString.trim();
};

export const update = (
  node: HTMLElement | SVGElement,
  key: string,
  oldValue: any,
  newValue: any
) => {
  if (isNativeEvent(key)) {
    node.removeEventListener(getNativeEventName(key), oldValue.handleEvent, {
      capture: !!oldValue.capture,
    });
    const { handleEvent, ...restValues } = newValue;
    node.addEventListener(getNativeEventName(key), handleEvent, restValues);
  } else if (isEvent(key)) {
    node.removeEventListener(getEventName(key), oldValue);
    node.addEventListener(getEventName(key), newValue);
  } else {
    if (newValue === false || newValue == null) {
      node.removeAttribute(key);
    } else {
      const value =
        key === "style" && typeof newValue === "object"
          ? styleObjectToString(newValue)
          : newValue === true
            ? ""
            : newValue;
      node.setAttribute(key, value);
    }
  }
};

export const unset = (
  node: HTMLElement | SVGElement,
  key: string,
  oldValue: any
) => {
  if (isNativeEvent(key)) {
    node.removeEventListener(getNativeEventName(key), oldValue.handleEvent, {
      capture: !!oldValue.capture,
    });
  } else if (isEvent(key)) {
    node.removeEventListener(getEventName(key), oldValue);
  } else if (key === "ref") {
    oldValue.current = null;
  } else {
    node.removeAttribute(key);
  }
};

export const add = (
  node: HTMLElement | SVGElement,
  key: string,
  newValue: any
) => {
  if (isNativeEvent(key)) {
    const { handleEvent, ...restValues } = newValue;
    node.addEventListener(getNativeEventName(key), handleEvent, restValues);
  } else if (isEvent(key)) {
    node.addEventListener(getEventName(key), newValue);
  } else if (key === "ref") {
    const instance = getCurrentInstance();
    if (instance) {
      if (!instance.disposes) instance.disposes = [];
      instance.disposes.push(() => {
        newValue.current = null;
      });
    }
    newValue.current = node;
  } else {
    if (newValue !== false && newValue != null) {
      const value =
        key === "style" && typeof newValue === "object"
          ? styleObjectToString(newValue)
          : newValue === true
            ? ""
            : newValue;
      node.setAttribute(key, value);
    }
  }
};

export const nodeAttributesEffect = (
  node: HTMLElement | SVGElement,
  propsFn: () => any
) => {
  const propsObj = propsFn();

  if (!propsObj) return;

  const keys = Object.keys(propsObj);

  // When every property is an accessor (the common case from the JSX
  // compiler — each prop is a reactive getter), create one effect per key
  // so a change to one prop never re-evaluates the others.
  //
  // If any property is a plain value (e.g. from a spread like {...rest}),
  // fall back to a single coarse-grained effect that re-reads propsFn() to
  // handle potentially dynamic keys correctly.
  const allGetters = keys.every((key) => {
    const desc = Object.getOwnPropertyDescriptor(propsObj, key);
    return !!desc?.get;
  });

  if (!allGetters) {
    let oldProps: any = {};

    effect(() => {
      const newProps = { ...propsFn() };

      const allKeys = new Set([
        ...Object.keys(newProps),
        ...Object.keys(oldProps),
      ]);

      for (const key of allKeys) {
        const oldValue = oldProps[key];
        const newValue = newProps[key];

        exist(oldValue)
          ? exist(newValue)
            ? Object.is(oldValue, newValue)
              ? null
              : update(node, key, oldValue, newValue)
            : unset(node, key, oldValue)
          : exist(newValue)
            ? add(node, key, newValue)
            : null;
      }

      oldProps = newProps;
    });
    return;
  }

  // Fine-grained: one effect per prop key
  const oldValues: Record<string, any> = {};
  for (const key of keys) {
    effect(() => {
      const newValue = propsObj[key];
      const oldValue = oldValues[key];

      exist(oldValue)
        ? exist(newValue)
          ? Object.is(oldValue, newValue)
            ? null
            : update(node, key, oldValue, newValue)
          : unset(node, key, oldValue)
        : exist(newValue)
          ? add(node, key, newValue)
          : null;

      oldValues[key] = newValue;
    });
  }
};
