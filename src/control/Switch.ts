import { computed } from "../api/computed";
import { createComponent } from "../h/createComponent";
import { For } from "./For";
import { untrackedReturn } from "../api/untracked-return";
import { generateId } from "../h/utils";
import { FC } from "../types";

export interface MatchProps {
  children: JSX.Element[];
}

interface MatchChildrenInner {
  valid: boolean;
  id: string;
  children: JSX.Element;
}

interface MatchPropsInner {
  value: MatchProps;
}

export const Switch: FC<MatchProps> = (p) => {
  const props = p as unknown as MatchPropsInner;
  const children = untrackedReturn(
    () => props.value.children as unknown as MatchChildrenInner[]
  );
  const res = computed(() => children.filter((i) => i.valid)[0]);

  return createComponent(
    For as (p: any) => any,
    () => ({
      of: res.value ? [res.value] : [],
      trait: (item: any) => item.id,
    }),
    () => (item: any) => item.value.children
  );
};

Switch.isLogic = true;

export interface CaseProps {
  of: any;
  children: JSX.Element;
}

interface CasePropsInner {
  value: CaseProps;
}

export const Case: FC<CaseProps> = (p) => {
  const props = p as unknown as CasePropsInner;

  const id = generateId();

  return {
    id,
    get valid() {
      return props.value.of;
    },
    get children() {
      return props.value.children;
    },
  } as unknown as JSX.Element;
};

Case.isLogic = true;

export const Default: FC<Omit<CaseProps, "of">> = (p) => {
  const props = p as unknown as CasePropsInner;

  const id = generateId();

  const data = {
    id,
    get valid() {
      return true;
    },
    get children() {
      return props.value.children;
    },
  };

  return data as unknown as JSX.Element;
};

Default.isLogic = true;
