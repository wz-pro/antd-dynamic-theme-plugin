import path from 'path';
import webpack, {
  Compilation,
  RuleSetRule,
  RuleSetUseItem,
  sources,
  WebpackOptionsNormalized,
} from 'webpack';
import lessToJS from './less-vars';

export interface ThemePluginOptions {
  root: string;
  themeDir: string;
  darkFileName: string;
  lightFileName: string;
  themeClassPre: string;
  initTheme: 'dark' | 'less';
}

const defaultOptions: ThemePluginOptions = {
  root: process.cwd(),
  themeClassPre: 'antd-theme',
  themeDir: 'src/theme',
  darkFileName: 'dark.less',
  lightFileName: 'light.less',
  initTheme: 'dark',
};

export type CompilerOptions = WebpackOptionsNormalized & {
  antdThemeCache?: { dark?: any; light?: any; [key: string]: any };
};

export interface Compiler extends webpack.Compiler {
  options: CompilerOptions;
}

export interface LoaderContext extends webpack.LoaderContext<ThemePluginOptions> {
  _compiler: Compiler;
}

export default class AntdDynamicThemePlugin {
  private readonly pluginName = 'AntdDynamicThemePlugin';
  private readonly options: ThemePluginOptions;

  constructor(userOptions?: Partial<ThemePluginOptions>) {
    this.options = { ...defaultOptions, ...userOptions };
  }

  private async getThemeVars() {
    const { themeDir, darkFileName, lightFileName, root } = this.options;
    const basePath = path.resolve(root, themeDir);
    const [dark, light] = await Promise.all([
      lessToJS(path.resolve(basePath, darkFileName)),
      lessToJS(path.resolve(basePath, lightFileName)),
    ]);
    return { light, dark };
  }

  private async getLessVariables() {
    const { light, dark } = await this.getThemeVars();
    const { themeClassPre } = this.options;
    return Object.keys({ ...light, ...dark }).map((key) => [
      key,
      `~'var(--${themeClassPre}-${key})'`,
    ]);
  }

  private async lessDefaultAddictionData() {
    const variables = await this.getLessVariables();
    return variables.reduce((pre: string, [key, value]) => {
      return `${pre}@${key}:${value};`;
    }, '');
  }

  private getLessAddictionData(
    originData: string | ((content: string, context: LoaderContext) => Promise<string>),
  ) {
    const isFunc = typeof originData === 'function';
    return async (content: string, context: LoaderContext) => {
      const vars = await this.lessDefaultAddictionData();
      const newContent = isFunc ? await originData(content, context) : `${originData}${content}`;
      if (/@import/.test(newContent)) {
        return newContent.replace(/(@import.*;)/g, `$1${vars}`);
      }
      return `${vars}${newContent}`;
    };
  }

  private formatLessLoader(loadInfo: any) {
    if (/less-loader$/.test(loadInfo as string)) {
      return {
        loader: require.resolve('less-loader'),
        options: {
          additionalData: this.lessDefaultAddictionData,
        },
      };
    }
    if (typeof loadInfo === 'string' || typeof loadInfo === 'function') return loadInfo;
    const userAdditionalData = loadInfo?.options?.additionalData || '';
    return {
      loader: loadInfo.loader,
      options: {
        ...(loadInfo.options as object),
        additionalData: this.getLessAddictionData(userAdditionalData),
      },
    };
  }

  apply(compiler: Compiler) {
    compiler.hooks.environment.tap(this.pluginName, () => {
      const allRules = compiler.options.module.rules as RuleSetRule[];
      const lessRules = allRules.filter((item) => {
        if (Object.prototype.toString.call(item.test) !== '[object RegExp]') return false;
        return (item.test as RegExp)?.test('index.less');
      });
      const loaderPath = path.resolve(__dirname, 'theme-var-loader.cjs');
      const loader = { loader: loaderPath, options: this.options };
      (lessRules as RuleSetRule[]).forEach((ruleItem) => {
        if (ruleItem.use === 'string' && /less-loader/.test(ruleItem.use as string)) {
          ruleItem.use = [loader, this.formatLessLoader(ruleItem.use)];
          return null;
        }
        if (!Array.isArray(ruleItem.use)) return null;
        if (
          ruleItem.use.find((item: RuleSetUseItem) => {
            typeof item !== 'string' &&
              typeof item !== 'function' &&
              /theme-var-loader/.test(item?.loader || '');
          })
        ) {
          return null;
        }
        const lessLoaderIndex = ruleItem.use.length - 1;
        ruleItem.use[lessLoaderIndex] = this.formatLessLoader(ruleItem.use[lessLoaderIndex]);
        ruleItem.use.splice(lessLoaderIndex, 0, loader);
      });
    });
    compiler.hooks.thisCompilation.tap(this.pluginName, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: this.pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets, callback) => {
          let themeCache = compiler.options.antdThemeCache;
          if (!themeCache) {
            themeCache = this.getThemeVars();
            compiler.options.antdThemeCache = themeCache;
          }
          const entryName = Object.keys(compiler.options.entry)[0];
          const chunkItem = [...compilation.chunks].find((item) => item.name === entryName);
          if (!chunkItem) {
            throw new Error('entry file not found');
          }
          const assetsName = [...chunkItem.files].find((item) => item.endsWith('js'));
          if (!assetsName) return null;
          const entryContent = assets[assetsName].source() as string;
          const preName = `${this.options.themeClassPre}-`;
          const scriptContent = `
          (function(){
             const el = document.getElementsByTagName('body');
             window.THEMEVARS = ${JSON.stringify(themeCache)};
             window.changeGlobalTheme = function(isDark){
               if (el && el.length) {
                 if(isDark) el[0].setAttribute('class', '${preName}dark')
                 else el[0].setAttribute('class', '${preName}light')
               }
             };
             if(el) changeGlobalTheme(${this.options.initTheme === 'dark' ? 'true' : 'false'}); 
          })()
        `;
          const newEntry = entryContent.replace(/(\(\s*\(\s*\)\s*=>\s*\{)/, `$1${scriptContent}`);
          compilation.updateAsset(assetsName, new sources.RawSource(newEntry));
          return callback();
        },
      );
    });
  }
}
