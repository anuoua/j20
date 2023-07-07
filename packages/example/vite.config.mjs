import { defineConfig } from "vite";
import j20Preset from "@j20org/vite-plugin";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  esbuild: {
    jsx: "preserve",
  },
  plugins: [
    tailwindcss(),
    ...j20Preset()
  ],
});
