import { defineConfig } from "vite";
import { j20 } from "@j20org/vite-plugin";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    j20(),
    tailwindcss(),
  ],
});
