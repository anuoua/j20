import { effect } from "../api/effect";
import { signal } from "../api/signal";
import {
  Instance,
  instanceCreate,
  getCurrentInstance,
  instanceGetElements,
  instanceDestroy,
} from "../h/instance";
import { untrack } from "../api/untrack";

function insertAfter(parentNode: Node, newNode: Node, targetNode: Node) {
  parentNode?.insertBefore(newNode, targetNode.nextSibling);
}

const isSame = (a: any, b: any, trait: (item: any) => any) => {
  return Object.is(trait(a), trait(b));
};

export interface ListProps<T> {
  of: T[];
  children: (i: T, index: number) => JSX.Element;
  trait?: (item: T) => any;
}

interface ListPropsInner<T> {
  value: ListProps<T>;
}

interface ListItem<T> {
  instance: Instance;
  index: { value: number };
  item: T;
}

const defaultTrait = (a: any) => a as any;

export const For = <T>(p: ListProps<T>) => {
  let initialized = false;

  const currentInstance = getCurrentInstance()!;

  let oldList: T[] = [];

  let oldListItems: ListItem<T>[] = [];

  let initElements: Element[] = [];

  effect(() => {
    const props = (p as unknown as ListPropsInner<T>).value;
    const trait = props.trait ?? defaultTrait;
    const newList = props.of;

    // @ts-expect-error
    if (import.meta.env.DEV) {
      const traitMap = new Map<any, T[]>();
      const duplicates: T[] = [];

      for (const item of newList) {
        const traitValue = trait(item);
        if (!traitMap.has(traitValue)) {
          traitMap.set(traitValue, []);
        }
        traitMap.get(traitValue)!.push(item);

        // 检查是否有重复
        if (traitMap.get(traitValue)!.length === 2) {
          duplicates.push(...traitMap.get(traitValue)!);
        }
      }

      // 输出 trait 重复警告
      if (duplicates.length > 0) {
        console.warn(
          "[j20 For] Duplicate trait values detected in list. " +
            "Each item should have a unique trait value for optimal performance. " +
            "Duplicates found:",
          duplicates
        );
      }
    }

    const newListItems: ListItem<T>[] = new Array(newList.length);

    // 实现 diff 逻辑，参考 vue3

    let i = 0;
    const l2 = newList.length;
    let e1 = oldList.length - 1; // prev ending index
    let e2 = l2 - 1; // next ending index

    // 1. sync from start
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      if (isSame(oldList[i], newList[i], trait)) {
        newListItems[i] = oldListItems[i];
        i++;
      } else {
        break;
      }
    }

    // 2. sync from end
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      if (isSame(oldList[e1], newList[e2], trait)) {
        newListItems[e2] = oldListItems[e1];
        e1--;
        e2--;
      } else {
        break;
      }
    }

    // 3. common sequence + mount
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
      if (i <= e2) {
        for (; i <= e2; i++) {
          const newIndex = signal(i);
          const [newInstance, newInstanceFragment] = instanceCreate(() => {
            const newChild = untrack(() =>
              props.children(newList[i], newIndex as unknown as number)
            );
            return newChild;
          }, currentInstance);

          if (!initialized) {
            initElements.push(newInstanceFragment);
          } else {
            if (i > 0) {
              const prev = newListItems[i - 1]?.instance;
              const prevEl = prev?.range[1] ?? currentInstance.range[0];
              insertAfter(prevEl.parentNode!, newInstanceFragment, prevEl);
            } else {
              const parentNode = currentInstance.range[0].parentNode;
              parentNode?.insertBefore(
                newInstanceFragment,
                currentInstance.range[0]
              );
            }
          }

          newListItems[i] = {
            index: newIndex,
            item: newList[i],
            instance: newInstance,
          };
        }
      }
    }

    // 4. common sequence + unmount
    else if (i > e2) {
      while (i <= e1) {
        // remove elements
        instanceGetElements(oldListItems[i].instance).forEach((el) => {
          el.parentNode?.removeChild(el);
        });
        instanceDestroy(currentInstance, oldListItems[i].instance);
        i++;
      }
    }

    // 5. unknown sequence
    else {
      // 创建一个 key -> index 的映射，用于快速查找旧列表中的项
      const s1 = i; // 旧列表开始索引
      const s2 = i; // 新列表开始索引

      // 为新的未处理项创建 key -> index 映射
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(trait(newList[i]), i);
      }

      // 需要处理的新项数量
      const toBePatched = e2 - s2 + 1;
      // 创建一个数组，存储新旧索引的映射关系
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      // 遍历旧列表中未处理的项，如果在新列表中存在则更新，否则删除
      let patched = 0;
      let moved = false;
      let maxNewIndexSoFar = 0;

      for (let i = s1; i <= e1; i++) {
        if (patched >= toBePatched) {
          // 所有新项都已处理，剩余的旧项可以直接删除
          instanceGetElements(oldListItems[i].instance).forEach((el) => {
            el.parentNode?.removeChild(el);
          });
          instanceDestroy(currentInstance, oldListItems[i].instance);
          continue;
        }

        const oldItem = oldList[i];
        const oldKey = trait(oldItem);
        const newIndex = keyToNewIndexMap.get(oldKey);

        if (newIndex === undefined) {
          // 在新列表中不存在，删除
          instanceGetElements(oldListItems[i].instance).forEach((el) => {
            el.parentNode?.removeChild(el);
          });
          instanceDestroy(currentInstance, oldListItems[i].instance);
        } else {
          // 在新列表中存在，更新映射关系
          // newIndex - s2 得到在 newIndexToOldIndexMap 中的位置
          // i + 1 避免与初始值 0 冲突
          newIndexToOldIndexMap[newIndex - s2] = i + 1;

          // 检查是否需要移动
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          // 复用实例
          newListItems[newIndex] = oldListItems[i];
          patched++;
        }
      }

      // 如果需要移动节点，使用最长递增子序列算法优化移动
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];

      // 从后向前遍历，确保插入顺序正确
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const newIndex = s2 + i;
        const newItem = newList[newIndex];

        // 确定锚点元素
        const anchor =
          newIndex + 1 < l2
            ? newListItems[newIndex + 1].instance.range[0]
            : currentInstance.range[1];

        if (newIndexToOldIndexMap[i] === 0) {
          // 创建新节点
          const newIdx = signal(newIndex);
          const [newInstance, newInstanceFragment] = instanceCreate(() => {
            const newChild = untrack(() =>
              props.children(newItem, newIdx as unknown as number)
            );
            return newChild;
          }, currentInstance);

          // 插入到 DOM
          anchor.parentNode?.insertBefore(newInstanceFragment, anchor);
          newListItems[newIndex] = {
            index: newIdx,
            item: newItem,
            instance: newInstance,
          };
        } else if (moved) {
          // 需要移动
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            // 移动节点
            const nodeToMove = newListItems[newIndex];
            const elementsToMove = instanceGetElements(nodeToMove.instance);

            // 将所有元素移动到锚点之前
            elementsToMove.forEach((el) => {
              anchor.parentNode?.insertBefore(el, anchor);
            });
          } else {
            // 不需要移动，跳过
            j--;
          }
        }
      }
    }

    oldList = newList;
    oldListItems = newListItems;
    currentInstance.children = newListItems.map((item, index) => {
      item.index.value = index;
      return item.instance;
    });
  });

  initialized = true;

  return initElements.splice(0, initElements.length);
};

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
