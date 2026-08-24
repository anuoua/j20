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

## effect 内调用“读+写同一信号”的函数会导致死循环

effect 执行期间会搜集**所有读取到的信号**，包括 effect 内调用的函数体内读取的信号。如果某个函数“先读后写”同一个信号（典型的注册类函数 `$list = [...$list, x]`），effect 就会依赖上自己写入的信号：写入触发 effect 重跑 → 重跑又写入 → 无限循环，页面事件循环卡死。

```tsx
let $messages: string[] = [];
const register = (id) => {
  $messages = [...$messages, id]; // 读 $messages（被 effect 追踪）→ 写 $messages → 自触发
};

effect(() => {
  if ($valid) register("err"); // ← 发散式自写，死循环
});
```

解决方式：用 `untrack` 包住注册函数体内的读写，让它们不被当前 effect 搜集为依赖：

```tsx
import { untrack } from "j20";

const register = (id) => {
  untrack(() => {
    $messages = [...$messages, id];
  });
};
```

注意：

- `untrack` 只影响**当前 effect 的依赖搜集**，不影响信号变更对其他 effect / 视图的通知，注册结果依然正常触发界面更新。
- 收敛式自写（effect 内读+写同一信号、但能自然收敛，如计数器到阈值停止）是受支持的行为，不要用 untrack 破坏它；`untrack` 只用于**发散式**的注册/回填类读写。
