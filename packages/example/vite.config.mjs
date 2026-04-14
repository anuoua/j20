import { defineConfig } from "vite";
import { j20 } from "@j20org/vite-plugin";

export default defineConfig({
  plugins: [
    j20(),
  ],
});
