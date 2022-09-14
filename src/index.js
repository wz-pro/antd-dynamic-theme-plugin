'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { 'default': mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const path_1 = __importDefault(require('path'));
const webpack_1 = require('webpack');
const less_vars_1 = __importDefault(require('./less-vars'));
const defaultOptions = {
  root: process.cwd(),
  themeClassPre: 'antd-theme',
  themeDir: 'src/theme',
  darkFileName: 'dark.less',
  lightFileName: 'light.less',
  initTheme: 'dark',
};
class AntdDynamicThemePlugin {
  constructor(userOptions) {
    this.pluginName = 'AntdDynamicThemePlugin';
    this.options = Object.assign(Object.assign({}, defaultOptions), userOptions);
  }
  getThemeVars() {
    return __awaiter(this, void 0, void 0, function* () {
      const { themeDir, darkFileName, lightFileName, root } = this.options;
      const basePath = path_1.default.resolve(root, themeDir);
      const [dark, light] = yield Promise.all([
        (0, less_vars_1.default)(path_1.default.resolve(basePath, darkFileName)),
        (0, less_vars_1.default)(path_1.default.resolve(basePath, lightFileName)),
      ]);
      return { light, dark };
    });
  }
  getLessVariables() {
    return __awaiter(this, void 0, void 0, function* () {
      const { light, dark } = yield this.getThemeVars();
      const { themeClassPre } = this.options;
      return Object.keys(Object.assign(Object.assign({}, light), dark)).map((key) => [
        key,
        `~'var(--${themeClassPre}-${key})'`,
      ]);
    });
  }
  lessDefaultAddictionData() {
    return __awaiter(this, void 0, void 0, function* () {
      const variables = yield this.getLessVariables();
      return variables.reduce((pre, [key, value]) => {
        return `${pre}@${key}:${value};`;
      }, '');
    });
  }
  getLessAddictionData(originData) {
    const isFunc = typeof originData === 'function';
    return (content, context) =>
      __awaiter(this, void 0, void 0, function* () {
        const vars = yield this.lessDefaultAddictionData();
        const newContent = isFunc ? yield originData(content, context) : `${originData}${content}`;
        if (/@import/.test(newContent)) {
          return newContent.replace(/(@import.*;)/g, `$1${vars}`);
        }
        return `${vars}${newContent}`;
      });
  }
  formatLessLoader(loadInfo) {
    var _a;
    if (/less-loader$/.test(loadInfo)) {
      return {
        loader: require.resolve('less-loader'),
        options: {
          additionalData: this.lessDefaultAddictionData,
        },
      };
    }
    if (typeof loadInfo === 'string' || typeof loadInfo === 'function') return loadInfo;
    const userAdditionalData =
      ((_a = loadInfo === null || loadInfo === void 0 ? void 0 : loadInfo.options) === null ||
      _a === void 0
        ? void 0
        : _a.additionalData) || '';
    return {
      loader: loadInfo.loader,
      options: Object.assign(Object.assign({}, loadInfo.options), {
        additionalData: this.getLessAddictionData(userAdditionalData),
      }),
    };
  }
  apply(compiler) {
    compiler.hooks.environment.tap(this.pluginName, () => {
      const allRules = compiler.options.module.rules;
      const lessRules = allRules.filter((item) => {
        var _a;
        if (Object.prototype.toString.call(item.test) !== '[object RegExp]') return false;
        return (_a = item.test) === null || _a === void 0 ? void 0 : _a.test('index.less');
      });
      const loaderPath = path_1.default.resolve(__dirname, 'theme-var-loader.cjs');
      const loader = { loader: loaderPath, options: this.options };
      lessRules.forEach((ruleItem) => {
        if (ruleItem.use === 'string' && /less-loader/.test(ruleItem.use)) {
          ruleItem.use = [loader, this.formatLessLoader(ruleItem.use)];
          return null;
        }
        if (!Array.isArray(ruleItem.use)) return null;
        if (
          ruleItem.use.find((item) => {
            typeof item !== 'string' &&
              typeof item !== 'function' &&
              /theme-var-loader/.test(
                (item === null || item === void 0 ? void 0 : item.loader) || '',
              );
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
          stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
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
          const entryContent = assets[assetsName].source();
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
          compilation.updateAsset(assetsName, new webpack_1.sources.RawSource(newEntry));
          return callback();
        },
      );
    });
  }
}
exports.default = AntdDynamicThemePlugin;
