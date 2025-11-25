import { createRoot } from "j20";
import { App } from "./Todo";

// 用creatRoot创建应用根节点
const root = createRoot(() => <App></App>);

// 将根节点添加到DOM中
document.querySelector("#root")!.append(root.element);
