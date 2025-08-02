import createPlugin from "./create-plugin.js";

export default createPlugin({
    name: "transform-react-jsx",
    development: false,
});

export type { Options } from "./create-plugin.js";