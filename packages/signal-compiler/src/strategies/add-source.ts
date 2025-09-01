import * as babelCore from "@babel/core";
import { addNamed } from '@babel/helper-module-imports'
import { Config } from "../types";

export const autoImport = (
    babel: typeof babelCore,
    config: Config
): babelCore.Visitor => {
    const { types: t, template } = babel;

    return {
        Program(path) {
            path.state = {};

            if (!path.scope.getBinding("signal")) {
                const id = addNamed(path, 'signal', config.importSource, {
                    nameHint: 'signal',
                });
                path.state.signalVarName = id.name;
            } else {
                path.state.signalVarName = "signal";
            }

            if (!path.scope.getBinding("computed")) {
                const id = addNamed(path, 'computed', config.importSource, {
                    nameHint: 'computed',
                });
                path.state.computedVarName = id.name;
            } else {
                path.state.computedVarName = "computed";
            }

        }
    };
};
