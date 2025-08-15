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
            if (!path.scope.getBinding("computed")) {
                const id = addNamed(path, 'computed', config.importSource, {
                    nameHint: 'computed',
                });
                path.scope.setData("computedVarName", id.name);
            } else {
                path.scope.setData("computedVarName", "computed");
            }

            if (!path.scope.getBinding('jsx')) {
                const id = addNamed(path, 'jsx', config.importSource, {
                    nameHint: 'jsx',
                });
                path.scope.setData("jsxVarName", id.name);
            } else {
                path.scope.setData("jsxVarName", "jsx");
            }

            if (!path.scope.getBinding('jsxs')) {
                const id = addNamed(path, 'jsxs', config.importSource, {
                    nameHint: 'jsxs',
                });
                path.scope.setData("jsxsVarName", id.name);
            } else {
                path.scope.setData("jsxsVarName", "jsxs");
            }

            if (!path.scope.getBinding('Fragment')) {
                const id = addNamed(path, 'Fragment', config.importSource, {
                    nameHint: 'Fragment',
                });
                path.scope.setData("fragmentVarName", id.name);
            } else {
                path.scope.setData("fragmentVarName", "Fragment");
            }

            if (!path.scope.getBinding("template")) {
                const id = addNamed(path, 'template', config.importSource, {
                    nameHint: 'template',
                });
                path.scope.setData("templateVarName", id.name);
            } else {
                path.scope.setData("templateVarName", "template");
            }
        }
    };
};
