export type FC<P extends Record<string, any> = {}> = {
  isLogic?: boolean;
} & ((props: P) => JSX.Element);

export type AttrValueType = string | number | boolean;

export type CustomElement<P extends Record<string, any> = {}> = {
  tag: string;
  mode?: "open" | "closed";
  style?: string | CSSStyleSheet;
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
};

export type WC<
  P extends Record<string, string | boolean | number> = {},
  E extends Record<string, any> = {},
> = {
  customElement: CustomElement<P>;
} & ((
  props: JSX.HTMLAttributes<HTMLElement> & {
    children?: JSX.Element;
  } & P & {
      [K in keyof E as `on${Capitalize<K & string>}`]: (e: E[K]) => void;
    }
) => JSX.Element);

export type ExtractClasses<T extends string> =
  T extends `${string}.${infer Name} {${infer Body}${infer _Brace}${infer Rest}`
    ? Name | ExtractClasses<Body> | ExtractClasses<Rest>
    : T extends `${string}\n${infer Rest}`
      ? ExtractClasses<Rest>
      : never;
