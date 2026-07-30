export interface Config {
  autoImport?: boolean;
  importSource: string;
}

export interface PluginState {
  jsxVarName: string;
  jsxsVarName: string;
  fragmentVarName: string;
  templateVarName: string;
  templateCount: number;
  templateMap: Record<string, number>;
}
