import { computed } from "../api/computed";
import { createComponent } from "../h/createComponent";
import { For } from "./For";
import { generateId } from "../h/utils";
import { FC } from "../types";

export interface SwitchProps {
  children: JSX.Element[];
}

interface SwitchPropsInner {
  value: SwitchProps;
}

interface MatchChildrenInner {
  valid: boolean;
  id: string;
  children: JSX.Element;
}

export const Switch: FC<SwitchProps> = (p) => {
  const props = p as unknown as SwitchPropsInner;
  const children = props.value.children as unknown as MatchChildrenInner[];
  const res = computed(() => children.filter((i) => i.valid)[0]);

  return createComponent(For as (p: any) => any, () => ({
    of: res.value ? [res.value] : [],
    trait: (item: any) => item.id,
    get children() {
      return (item: any) => item.children;
    },
  }));
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

export interface DefaultProps {
  children: JSX.Element;
}

interface DefaultPropsInner {
  value: DefaultProps;
}

export const Default: FC<DefaultProps> = (p) => {
  const props = p as unknown as DefaultPropsInner;

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
