import { Prop, defineComponent, getCurrentInstance } from "./component";
import { EffectScope, Ref, computed, effect, ref } from "@vue/reactivity";
import { prop } from "./utils";

export const For = defineComponent(
  {},
  <T>(p: {
    list: Prop<T[]>;
    children: (item: T, index: Ref<number>) => HTMLElement;
  }) => {
    const ins = getCurrentInstance()!;
    const propList = prop(p.list);

    const createItem = (get: () => HTMLElement, indexRef: Ref<number>) => {
      const effectScope = new EffectScope();
      let el: HTMLElement = undefined!;

      effectScope.run(() => {
        el = get();
      });

      return {
        indexRef,
        el,
        effectScope,
      };
    };

    let list: any[] = [];
    let items: {
      el: HTMLElement;
      effectScope: EffectScope;
      indexRef: Ref<number>;
    }[] = [];

    effect(() => {
      if (!ins.el.isConnected) {
        items = propList().map((item, index) => {
          const indexRef = ref(index);
          return createItem(() => p.children(item, indexRef), indexRef);
        });
        list = [...propList()];
      } else {
        const visitMap = new Map<any, number>();

        for (let i = 0; i < propList().length; i++) {
          const walkData = propList()[i];

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
            if (list[j] === walkData) {
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
            (items[i - 1]?.el ?? ins.el).after(items[oldIndex].el);
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
            (items[i - 1]?.el ?? ins.el).after(newItem.el);
            items.splice(i, 0, newItem);
            list.splice(i, 0, walkData);
          }
          // update index
          items[i].indexRef.value = i;
        }

        visitMap.clear();

        // remove rest
        if (list.length > propList().length) {
          list.splice(propList().length);
          const removeItems = items.splice(propList().length);
          removeItems.forEach((i) => {
            i.effectScope.stop();
            i.el.remove();
          });
        }
      }
    });

    return items.map((i) => i.el);
  }
);

export const If = (p: { when: Prop<boolean>; children: () => HTMLElement }) => {
  const propWhen = prop(p.when);
  const list = computed(() => (propWhen() ? [true] : []));
  return For({
    list,
    children: () => p.children(),
  });
};
