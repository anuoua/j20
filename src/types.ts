export interface GlobalState {
  signalImported: boolean;
  createVarCount: number;
}

export interface Config {
  polyfill?: boolean;
  state?: string;
  computed?: string;
  identifierSignalDeclaration?: boolean;
  patternSignalDeclaration?: boolean;
  identifierSignalRead?: boolean;
  functionAutoSignal?: boolean;
  jsxAutoSignal?: boolean;
  identifierSignalAssign?: boolean;
}
