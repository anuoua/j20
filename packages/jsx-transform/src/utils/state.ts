import type { NodePath } from "@babel/core";
import type { PluginState } from "../types";

export const getState = (path: NodePath): PluginState => path.state as PluginState;
