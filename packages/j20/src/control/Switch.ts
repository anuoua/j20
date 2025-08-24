import { computed } from "../api/computed";
import { createComponent } from "../h/createComponent";
import { For } from "./For";
import { untrackedReturn } from "../api/untracked-return";
import { generateId } from "../h/utils";
import { FC } from "../types";

export interface SwitchProps {
  children: JSX.Element[];
}

interface MatchChildrenInner {
  valid: boolean;
  id: string;
  children: JSX.Element;
}

export const Switch = ((propsGetter: undefined, childrenGetter: () => any) => {
  const children = childrenGetter() as unknown as MatchChildrenInner[];
  const res = computed(() => children.filter((i) => i.valid)[0]);

  return createComponent(
    For as (p: any) => any,
    () => ({
      of: res.value ? [res.value] : [],
      trait: (item: any) => item.id,
    }),
    () => (item: any) => item.value.children
  );
}) as unknown as FC<SwitchProps>;

Switch.isLogic = true;

export interface CaseProps {
  of: any;
  children: JSX.Element;
}

export const Case = ((
  propsGetter: () => Omit<CaseProps, "children">,
  childrenGetter: () => any
) => {
  const props = propsGetter();

  const id = generateId();

  return {
    id,
    get valid() {
      return props.of;
    },
    get children() {
      return childrenGetter();
    },
  } as unknown as JSX.Element;
}) as unknown as FC<CaseProps>;

Case.isLogic = true;

export const Default = ((propsGetter: undefined, childrenGetter: () => any) => {
  const id = generateId();

  const data = {
    id,
    get valid() {
      return true;
    },
    get children() {
      return childrenGetter();
    },
  };

  return data as unknown as JSX.Element;
}) as unknown as FC<Omit<CaseProps, "of">>;

Default.isLogic = true;
