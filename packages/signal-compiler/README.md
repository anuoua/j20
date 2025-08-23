# Signal Compiler

A presets of signal compile strategies.

## Install

```shell
npm i signal-compiler
```

## Config

babel.config.js

```javascript
import { signalCompiler } from 'signal-compiler'

{
    plugins: [
      [
        signalCompiler,
        {
          // state: "signal",
          // computed: "computed",
          // polyfill: true, (default)
          // identifierSignalDeclaration: true, (default)
          // patternSignalDeclaration: true, (default)
          // identifierSignalRead: true, (default)
          // functionAutoSignal: true, (default)
          // jsxAutoSignal: true, (default)
        },
      ],
    ],
}
```
