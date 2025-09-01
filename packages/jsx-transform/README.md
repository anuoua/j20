# Signal Compiler

A presets of signal compile strategies.

## Install

```shell
npm i @j20org/jsx-transform
```

## Config

babel.config.js

```javascript
import { signalCompiler } from '@j20org/jsx-transform'

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
