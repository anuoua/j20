import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";
import { copyOrDownloadAsMarkdownButtons } from "vitepress-plugin-llms";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "src",
  base: "/j20/",

  title: "J20",
  description: "Document for j20",
  vite: {
    plugins: [llmstxt() as any],
  },
  markdown: {
    config(md) {
      md.use(copyOrDownloadAsMarkdownButtons);
    },
  },
  locales: {
    root: {
      label: "Chinese",
      lang: "zh",
    },
    en: {
      label: "English",
      lang: "en",
      themeConfig: {
        logo: "/logo.png",

        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: "Home", link: "/en/" },
          { text: "Guide", link: "/en/guide/introduction" },
        ],

        sidebar: [
          {
            text: "Guide",
            items: [
              { text: "Introduction", link: "/en/guide/introduction" },
              { text: "LLMs", link: "/en/guide/llms" },
              { text: "Installation", link: "/en/guide/install" },
              { text: "Getting Started", link: "/en/guide/start" },
              { text: "JSX Syntax", link: "/en/guide/jsx" },
              { text: "Components", link: "/en/guide/component" },
              { text: "Conditional Rendering", link: "/en/guide/conditional" },
              { text: "List Rendering", link: "/en/guide/list" },
              { text: "Dynamic Rendering", link: "/en/guide/replace" },
              { text: "Web Component", link: "/en/guide/web-component" },
              { text: "Lifecycle", link: "/en/guide/lifecycle" },
              { text: "Best Practices", link: "/en/guide/best-practice" },
              { text: "FAQ", link: "/en/guide/faq" },
            ],
          },
          {
            text: "Reference",
            items: [{ text: "API Reference", link: "/en/guide/api" }],
          },
        ],

        socialLinks: [
          { icon: "github", link: "https://github.com/anuoua/j20" },
        ],
      },
    },
  },
  themeConfig: {
    logo: "/logo.png",

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "文档", link: "/guide/introduction" },
    ],

    sidebar: [
      {
        text: "指南",
        items: [
          { text: "介绍", link: "/guide/introduction" },
          { text: "LLMs", link: "/guide/llms" },
          { text: "安装", link: "/guide/install" },
          { text: "开始", link: "/guide/start" },
          { text: "JSX", link: "/guide/jsx" },
          { text: "组件", link: "/guide/component" },
          { text: "条件渲染", link: "/guide/conditional" },
          { text: "列表渲染", link: "/guide/list" },
          { text: "动态渲染", link: "/guide/replace" },
          { text: "Web Component", link: "/guide/web-component" },
          { text: "生命周期", link: "/guide/lifecycle" },
          { text: "最佳实践", link: "/guide/best-practice" },
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
