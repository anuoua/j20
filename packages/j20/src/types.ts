export type FC<P extends Record<string, any> = {}> = {
  isLogic?: boolean;
} & ((props: P) => JSX.Element);

export type AttrValueType = string | number | boolean;

export type CustomElement<P extends Record<string, any> = {}> = {
  tag: string;
  shadow: "none" | "open" | "closed";
  style?: string;
  props?: {
    [K in keyof P as P[K] extends AttrValueType ? K : never]?: {
      type: P[K] extends string
        ? "string"
        : P[K] extends number
          ? "number"
          : P[K] extends boolean
            ? "boolean"
            : never;
      attribute: string;
    };
  };
  extend?: (customElementConstructor: any) => CustomElement;
};

export type WCFC<P extends Record<string, any> = {}> = {
  customElement: CustomElement<P>;
} & ((props: P) => JSX.Element);
