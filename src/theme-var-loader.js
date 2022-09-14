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
exports.themeVarLoader = exports.loaderAPI = exports.setCacheData = void 0;
const fs_1 = __importDefault(require('fs'));
const less_1 = __importDefault(require('less'));
const path_1 = __importDefault(require('path'));
const less_vars_1 = __importDefault(require('./less-vars'));
const postcss = require('postcss');
const selectorNamespace = require('postcss-selector-namespace');
const solveKeyValue = (classPre, key, value) => {
  return `--${classPre}-${key}: ${value};
 `;
};
function solveLessVars(classPre, preName, lessVars, output) {
  let result = '';
  Object.keys(lessVars).forEach((key) => {
    result += solveKeyValue(classPre, key, lessVars[key]);
  });
  return `${output}
    ${preName}{
      ${result}
    }
    `;
}
function setCacheData(loaderContext, key, value) {
  const options = loaderContext._compiler.options;
  if (!options.antdThemeCache) {
    options.antdThemeCache = {};
  }
  options.antdThemeCache[key] = value;
}
exports.setCacheData = setCacheData;
const loaderAPI = function (source) {
  return source;
};
exports.loaderAPI = loaderAPI;
const themeVarLoader = function () {
  if (/antd\/.*style\/.*\.less$/.test(this.resourcePath)) {
    return '';
  }
  const { themeDir, darkFileName, lightFileName, themeClassPre, root } = this.getOptions();
  const darkPath = path_1.default.resolve(root, themeDir, darkFileName);
  const lightPath = path_1.default.resolve(root, themeDir, lightFileName);
  if (![darkPath, lightPath].includes(this.resourcePath)) return undefined;
  const callback = this.async();
  this.addDependency(this.resourcePath);
  const isDark = darkPath === this.resourcePath;
  const name = isDark ? 'dark' : 'light';
  const preName = `.${themeClassPre}-${name}`;
  (() =>
    __awaiter(this, void 0, void 0, function* () {
      const antLess = path_1.default.resolve(
        root,
        'node_modules',
        `antd/dist/antd${isDark ? '.dark' : ''}.less`,
      );
      const lessVars = yield (0, less_vars_1.default)(this.resourcePath);
      setCacheData(this, name, lessVars);
      const { css: antdCss } = yield less_1.default.render(
        fs_1.default.readFileSync(antLess, 'utf-8'),
        {
          filename: antLess,
          javascriptEnabled: true,
          modifyVars: lessVars,
        },
      );
      const output = postcss()
        .use(selectorNamespace({ namespace: preName }))
        .process(antdCss).css;
      callback(null, solveLessVars(themeClassPre, preName, lessVars, output));
    }))();
};
exports.themeVarLoader = themeVarLoader;
