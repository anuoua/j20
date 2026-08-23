import { effect } from "../api/effect";
import { untrack } from "../api/untrack";
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

  // 归一化为节点序列：文本/数字 → 文本节点，数组递归展开（支持 {$children} 这类
  // 组件 children prop），null/undefined 忽略。
  const flatten = (el: any): Node[] => {
    if (typeof el === "number" || typeof el === "string") {
      return [document.createTextNode(el + "")];
    }
    if (Array.isArray(el)) {
      const nodes: Node[] = [];
      for (const sub of el) {
        if (sub == null) continue;
        nodes.push(...flatten(sub));
      }
      return nodes;
    }
    return el != null ? [el] : [];
  };

  for (let i = 0; i < propChildren.length; i++) {
    const child = propChildren[i];
    if (typeof child === "function") {
      // 函数 child：文本保持响应式（原地更新）；元素/数组为静态（渲染一次）。
      // 组件 body 由这里的 effect 承载，因此元素分支必须 dispose —— 否则
      // body 在无实例上下文的 signal 变化时重跑，会破坏 context/生命周期。
      let textNode: Text | undefined;
      let current: Node | undefined;
      const effectInstance = effect(() => {
        let el = child();
        if (typeof el === "function") {
          // children thunk（isLogic）：当作逻辑组件创建，untrack 一次性调用
          // （静态内容约定）。嵌套 children thunk（组件把 children 再传给子
          // 组件）会逐层解包。其他函数结果继续在 effect 里追踪调用。
          if (el.isLogic) {
            while (typeof el === "function") el = untrack(() => el());
          } else {
            el = el();
          }
        }
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
        } else {
          const nodes = flatten(el);
          if (current?.parentNode) {
            const parent = current.parentNode;
            const after = current.nextSibling;
            for (const node of nodes) parent.insertBefore(node, after ?? null);
            parent.removeChild(current);
          } else {
            arr.push(...nodes);
          }
          current = nodes[nodes.length - 1];
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

const toKebab = (key: string): string =>
  key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

export const styleObjectToString = (style: Record<string, string | number>) => {
  let styleString = "";
  for (const key in style) {
    const value = style[key];
    styleString += `${toKebab(key)}: ${value}; `;
  }
  return styleString.trim();
};

// aria-*/data-* 属性需要字面量 "true"/"false"，而非 HTML 布尔语义（存在/移除）。
const isAriaData = (key: string) =>
  key.startsWith("aria-") || key.startsWith("data-");

// 序列化属性值；返回 null 表示该值应移除属性。
export const attrValue = (key: string, v: any): string | null => {
  if (key === "style" && typeof v === "object") return styleObjectToString(v);
  if (isAriaData(key) && (v === true || v === false))
    return v ? "true" : "false";
  if (v === true) return "";
  if (v === false || v == null) return null;
  return v;
};

// 表单控件的 value/checked/selected 必须通过 DOM 属性（IDL attribute）设置：
// 对应的 content 属性只表示"默认值"，用户一旦输入（dirty value flag 置位），
// setAttribute 便无法再更新实际值。这也是 React 对受控组件设置 property 的原因。
const isControlledProp = (key: string) =>
  key === "value" || key === "checked" || key === "selected";

const setPropOrAttr = (
  node: HTMLElement | SVGElement,
  key: string,
  value: any
) => {
  if (isControlledProp(key) && key in node) {
    (node as any)[key] = value ?? "";
  } else {
    const attr = attrValue(key, value);
    if (attr === null) {
      node.removeAttribute(key);
    } else {
      node.setAttribute(key, attr);
    }
  }
};

const unsetPropOrAttr = (node: HTMLElement | SVGElement, key: string) => {
  if (isControlledProp(key) && key in node) {
    (node as any)[key] = "";
  } else {
    node.removeAttribute(key);
  }
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
    setPropOrAttr(node, key, newValue);
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
    unsetPropOrAttr(node, key);
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
    setPropOrAttr(node, key, newValue);
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
