import { defineConfig } from "vite";
import { j20 } from "@j20org/vite-plugin";
import { stylec } from "@stylec/vite";

export default defineConfig({
  plugins: [
    j20(),
    stylec({
      format: "prettier --write {path}",
    }),
  ],
});
