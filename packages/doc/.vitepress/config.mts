import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "src",
  base: "/j20/",

  title: "J20",
  description: "Document for j20",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "文档", link: "/guide/" },
    ],

    sidebar: [
      {
        text: "指南",
        items: [
          { text: "导航", link: "/guide/" },
          { text: "介绍", link: "/guide/introduction" },
          { text: "安装", link: "/guide/install" },
          { text: "状态管理", link: "/guide/state" },
          { text: "组件 Props", link: "/guide/props" },
          { text: "条件渲染", link: "/guide/conditional" },
          { text: "列表渲染", link: "/guide/list" },
          { text: "动态渲染", link: "/guide/replace" },
          { text: "Web Component", link: "/guide/web-component" },
          { text: "生命周期", link: "/guide/lifecycle" },
          { text: "JSX 语法", link: "/guide/jsx" },
          { text: "常见问题", link: "/guide/faq" },
        ],
      },
      {
        text: "示例",
        items: [{ text: "API 参考", link: "/guide/api" }],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/anuoua/j20" }],
  },
});
