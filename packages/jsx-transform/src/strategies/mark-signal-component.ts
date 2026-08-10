import * as babelCore from "@babel/core";
import type { types as T, NodePath } from "@babel/core";
import { hasSignalInPattern, SIGNAL_COMPONENT_MARKER } from "signal-compiler";

const { types: t } = babelCore;

/**
 * 行内组件（render prop）标记策略。
 *
 * 行内组件是匿名函数（如 `<Comp Title={({ msg: $msg }) => ...} />`），没有名字
 * 可依，signal-compiler 无法自动识别为组件。约定由 JSX 转换插件在函数节点上
 * 附加 `@signal-component` 块注释标记，signal-compiler 检测到标记后按组件编译。
 *
 * 判定规则（三条件同时满足）：
 * 1. 属性名大写开头（组件式 render prop 命名约定）；
 * 2. 属性值是无名函数（箭头函数或无 id 的函数表达式）；
 * 3. 解构参数中含 `$` 绑定（复用 signal-compiler 的 hasSignalInPattern）。
 *
 * 注意：标记必须是块注释（`/* @signal-component *​/`），不能用行注释——行内组件
 * 常落在 `return` 表达式位置，行注释会触发 ASI 损坏代码。
 */
export const markSignalComponent = (): babelCore.Visitor => {
  return {
    JSXAttribute(path: NodePath<T.JSXAttribute>) {
      const { node } = path;

      // 1. 属性名必须是普通标识符且大写开头
      if (node.name.type !== "JSXIdentifier") return;
      if (!/^[A-Z]/.test(node.name.name)) return;

      // 2. 属性值必须是表达式容器里的匿名函数
      const value = node.value;
      if (!value || value.type !== "JSXExpressionContainer") return;
      const expr = value.expression;
      const isAnonymousFn =
        t.isArrowFunctionExpression(expr) ||
        (t.isFunctionExpression(expr) && !expr.id);
      if (!isAnonymousFn) return;
      const fn = expr as T.ArrowFunctionExpression | T.FunctionExpression;

      // 3. 解构参数里含 `$` 绑定
      const hasSignalParam = fn.params.some(
        (param) =>
          (t.isObjectPattern(param) || t.isArrayPattern(param)) &&
          hasSignalInPattern(param)
      );
      if (!hasSignalParam) return;

      // 打块注释标记（addComment 默认生成块注释）
      t.addComment(fn, "leading", ` ${SIGNAL_COMPONENT_MARKER} `);
    },
  };
};
