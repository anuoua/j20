import * as babelCore from "@babel/core";
import type { types as Types, NodePath } from "@babel/core";
import type { Config, GlobalState } from "../types";

const { types: t, template } = babelCore;

const buildImportSignal = template.statement(`
  import { Signal } from 'signal-polyfill'
`);

export const autoImport = (
  path: NodePath,
  config: Config,
  globalState: GlobalState
) => {
  const { scope } = path;

  if (
    config.polyfill &&
    !scope.hasGlobal("Signal") &&
    !globalState.signalImported
  ) {
    const programPath = path.findParent((p) =>
      t.isProgram(p.node)
    ) as NodePath<Types.Program | null>;

    if (!programPath.node) return;
    programPath.node.body.unshift(buildImportSignal({}));
    globalState.signalImported = true;
  }
};
