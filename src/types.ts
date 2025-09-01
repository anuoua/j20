export interface GlobalState {
  signalImported: boolean;
  createVarCount: number;
}

export interface Config {
  autoImport?: boolean;
  importSource?: string;
  identifierSignalDeclaration?: boolean;
  patternSignalDeclaration?: boolean;
  identifierSignalRead?: boolean;
  functionAutoSignal?: boolean;
  identifierSignalAssign?: boolean;
}
