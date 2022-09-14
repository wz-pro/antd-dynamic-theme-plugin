import { LoaderContext } from './index';
export declare function setCacheData(loaderContext: LoaderContext, key: string, value: any): void;
export declare const loaderAPI: (source: string) => string;
export declare const themeVarLoader: (this: LoaderContext) => '' | undefined;
