import { Prop, defineComponent, getCurrentInstance } from "./component";
import {
  EffectScope,
  Ref,
  computed,
  effect,
  isRef,
  ref,
  toRef,
} from "@vue/reactivity";
import { isPrimitive } from "./utils";

export interface Item {
  indexRef: Ref<number>;
  els: HTMLElement[];
  effectScope: EffectScope;
}

const createItem = (
  get: () => HTMLElement | HTMLElement[],
  indexRef: Ref<number>
): Item => {
  const effectScope = new EffectScope();
  let els: HTMLElement[] = [];

  effectScope.run(() => {
    els = [get()].flat();
  });

  return {
    indexRef,
    els,
    effectScope,
  };
};

const findPreEl = (items: Item[], start: number) => {
  for (let i = start; i >= 0; i--) {
    const els = getItemEls(items[i]);
    if (els.length > 0) {
      return els[els.length - 1];
    }
  }
};

const getFragmentEls = (anchor: HTMLElement): HTMLElement[] => {
  const results: HTMLElement[] = [anchor];
  let i: any = anchor;
  let flag = 1;
  while ((i = i.nextSibling)) {
    results.push(i);
    if (i.__isStartIndex) flag++;
    if (i.__isEndIndex) flag--;
    if (i.__isEndIndex && flag === 0) {
      return results;
    }
  }
  return results;
};

const getItemEls = (item: Item) => {
  const results = item.els
    .map((el) => {
      // @ts-ignore
      if (el.__isStartIndex) {
        return getFragmentEls(el);
      } else {
        return el;
      }
    })
    .flat();
  item.els = results;
  return results;
};

const isSame = (key: string | undefined, a: any, b: any) => {
  return a === b;
  // if (
  //   (!key && a === b) ||
  //   (!isPrimitive(a) &&
  //     !isPrimitive(b) &&
  //     key &&
  //     a?.[key] === b[key])
  // ) {
  //   return true;
  // }
  // return false
}

export const For = defineComponent(
  {},
  <T>(p: {
    key?: Prop<string>;
    list: Prop<T[]>;
    children: (item: T, index: Ref<number>) => HTMLElement | HTMLElement[];
  }) => {
    const ins = getCurrentInstance()!;
    const propList = computed(() => (isRef(p.list) ? p.list.value : p.list));
    const key = computed(() => (isRef(p.key) ? p.key.value : p.key));

    let list: any[] = [];
    let items: Item[] = [];

    effect(() => {
      if (!ins.indexStart?.isConnected) {
        items = propList.value.map((item, index) => {
          const indexRef = ref(index);
          return createItem(() => p.children(item, indexRef), indexRef);
        });
        list = [...propList.value];
      } else {
        const visitMap = new Map<any, number>();

        for (let i = 0; i < propList.value.length; i++) {
          const walkData = propList.value[i];

          if (list.includes(walkData)) {
            const exist = visitMap.get(walkData);
            exist !== undefined && visitMap.set(walkData, exist + 1);
          }

          // find old place
          let oldIndex = -1;
          for (
            let j = 0, k = visitMap.get(walkData) ?? 0;
            j < list.length;
            j++
          ) {
            if (
              isSame(key.value, list[j], walkData)
            ) {
              if (k > 0) {
                k--;
                continue;
              } else {
                oldIndex = j;
                break;
              }
            }
          }

          if (oldIndex !== -1) {
            // insert
            if (i === oldIndex || i > oldIndex) continue;

            const preEl = findPreEl(items, i - 1) ?? ins.indexStart;
            preEl.after(...getItemEls(items[oldIndex]));

            const [d1] = items.splice(oldIndex, 1);
            items.splice(i, 0, d1);
            const [d2] = list.splice(oldIndex, 1);
            list.splice(i, 0, d2);
          } else {
            // create
            const indexRef = ref(i);
            const newItem = createItem(
              () => p.children(walkData, indexRef),
              indexRef
            );

            const preEl = findPreEl(items, i - 1) ?? ins.indexStart;

            preEl.after(...newItem.els);

            items.splice(i, 0, newItem);
            list.splice(i, 0, walkData);
          }
          // update index
          items[i].indexRef.value = i;
        }

        visitMap.clear();

        // remove rest
        if (list.length > propList.value.length) {
          list.splice(propList.value.length);
          const removeItems = items.splice(propList.value.length);
          removeItems.forEach((i) => {
            i.effectScope.stop();
            getItemEls(i).forEach((el) => el.remove());
          });
        }
      }
    });

    return items.reduce((pre, cur) => pre.concat(cur.els), [] as HTMLElement[]);
  }
);

export const If = (p: {
  when: Prop<boolean>;
  children: () => HTMLElement | HTMLElement[];
  else: () => HTMLElement | HTMLElement[];
}) => {
  const propWhen = toRef(p.when);
  const list = computed(() => (propWhen.value ? [p.children] : [p.else]));
  return For({
    list,
    children: (item) => item(),
  });
};

export const Switch = ({ children }: { children: MatchProp[] }) => {
  const list = computed(() => {
    const results = children.filter((item) =>
      isRef(item.when) ? item.when.value : item.when
    );
    return results.length ? results.slice(0, 1) : [];
  });

  return For({
    list,
    children: (item) => item.children(),
  });
};

interface MatchProp {
  when: Prop<boolean>;
  children: () => HTMLElement | HTMLElement[];
}

export const Match = ({ when, children }: MatchProp) => {
  return {
    when,
    children,
  };
};
