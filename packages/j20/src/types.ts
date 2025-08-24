export type CustomElement = {
  tag: string;
  shadow: "none" | "open" | "closed";
  props?: Record<
    string,
    { reflect?: boolean; type?: string; attribute?: string }
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
  customElement?: CustomElement;
} & ((props: P) => JSX.Element);

const AA: FC<{ name: string }> = ($props) => {
  return null;
};

AA.customElement = {
  tag: "aa-tag",
  shadow: "open",
};
