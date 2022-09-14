import webpack, { WebpackOptionsNormalized } from 'webpack';
export interface ThemePluginOptions {
  root: string;
  themeDir: string;
  darkFileName: string;
  lightFileName: string;
  themeClassPre: string;
  initTheme: 'dark' | 'less';
}
export declare type CompilerOptions = WebpackOptionsNormalized & {
  antdThemeCache?: {
    dark?: any;
    light?: any;
    [key: string]: any;
  };
};
export interface Compiler extends webpack.Compiler {
  options: CompilerOptions;
}
export interface LoaderContext extends webpack.LoaderContext<ThemePluginOptions> {
  _compiler: Compiler;
}
export default class AntdDynamicThemePlugin {
  private readonly pluginName;
  private readonly options;
  constructor(userOptions?: Partial<ThemePluginOptions>);
  private getThemeVars;
  private getLessVariables;
  private lessDefaultAddictionData;
  private getLessAddictionData;
  private formatLessLoader;
  apply(compiler: Compiler): void;
}
