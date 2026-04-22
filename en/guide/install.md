---
url: /j20/en/guide/install.md
---
# Installation

It is recommended to use TypeScript

```bash
npm i typescript -D
npx tsc --init
```

## Install Dependencies

```bash
npm i j20
npm i vite @j20org/vite-plugin -D
```

## TypeScript Configuration

tsconfig.json

```json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "j20", // [!code ++]
        "moduleResolution": "bundler", // [!code ++]
    }
}
```

## Vite Configuration

vite.config.mjs

```javascript
import { defineConfig } from "vite";
import { j20 } from "@j20org/vite-plugin";

export default defineConfig({
  plugins: [
    j20(),
  ],
});
```
