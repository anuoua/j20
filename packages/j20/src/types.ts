export type CustomElement = {
  tag: string;
  shadow: "none" | "open" | "closed";
  style?: string;
  props?: Record<
    string,
    {
      type?: "string" | "number" | "boolean";
      attribute?: string;
    }
  >;
  extend?: (customElementConstructor: any) => CustomElement;
};

// const data = {
//   tag: "custom-element",
//   shadow: "none",
//   props: {
//     name: { reflect: true, type: "Number", attribute: "element-index" },
//   },
//   extend: (customElementConstructor) => {
//     // Extend the class so we can let it participate in HTML forms
//     return class extends customElementConstructor {
//       static formAssociated = true;

//       constructor() {
//         super();
//         this.attachedInternals = this.attachInternals();
//       }

//       // Add the function here, not below in the component so that
//       // it's always available, not just when the inner Svelte component
//       // is mounted
//       randomIndex() {
//         this.elementIndex = Math.random();
//       }
//     };
//   },
// };

export type FC<P extends Record<string, any> = {}> = {
  isLogic?: boolean;
} & ((props: P) => JSX.Element);

export type WCFC<P extends Record<string, any> = {}> = {
  customElement?: CustomElement;
} & ((props: P) => JSX.Element);
