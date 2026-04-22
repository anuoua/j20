---
url: /j20/guide/faq.md
---
# 常见问题

## 响应链传递

**信号必须通过 `$` 前缀的变量传递才能保持响应性**

根据 [Signal Compiler](https://github.com/anuoua/signal-compiler) 编译策略，`$` 前缀的变量才会被编译编译器识别。

以自定义 hook 为例子：

```javascript
let $msg = ""; // 声明
const $dipslay = $msg + "hello"; // 派生

const $useText = ($a) => ({
  $text: $a + "hello"
});

// 返回信号
const { $text } = $useText(
  // 入参信号
  $display
);
```

```
声明信号 -> 派生信号 -> hook(入参信号) -> hook(返回值信号) -> 派生信号/解构信号
```

这里每一步都会进行信号编译，响应才不会中断，这就是信号的响应链传递。

## 为什么要加 `$` 前缀?

第一：为了编译时将符号 `$` 前缀的变量编译成和信号相关的代码所做的标记，这个标记是明确的没有歧义的（避免极少数三方库的冲突，请自行别名处理），编译插件已经开源，具体原理可以看 [signal-compiler](https://github.com/anuoua/signal-compiler)

第二：为了避免和普通变量（非 Signal）混淆。在大型应用中**变量的数量庞大**，开发人员无法区分信号变量和普通变量，导致 debug 困难。
