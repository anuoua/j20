import { defineConfig } from 'vite'
import { signalCompilerRollup } from 'signal-compiler/rollup'

export default defineConfig({
    esbuild: {
        jsx: 'preserve'
    },
    plugins: [signalCompilerRollup({
        include: "example/**/*.{js,jsx,ts,tsx}",
        config: {
            state: "signal",
            computed: "computed",
            polyfill: false,
            identifierSignalDeclaration: true,
            patternSignalDeclaration: true,
            identifierSignalRead: true,
            functionAutoSignal: true,
            jsxAutoSignal: true,
            identifierSignalAssign: true
        },
        jsx: {
            importSource: "../src"
        }
    })]
})