import fs from 'fs';
import less from 'less';
import path from 'path';
import lessToJS from './less-vars';

import { LoaderContext } from './index';

const postcss = require('postcss');
const selectorNamespace = require('postcss-selector-namespace');

const solveKeyValue = (classPre: string, key: string, value: string): string => {
  return `--${classPre}-${key}: ${value};
 `;
};

function solveLessVars(classPre: string, preName: string, lessVars: any, output: string) {
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

export function setCacheData(loaderContext: LoaderContext, key: string, value: any) {
  const options = loaderContext._compiler.options;
  if (!options.antdThemeCache) {
    options.antdThemeCache = {};
  }
  options.antdThemeCache[key] = value;
}

export const loaderAPI = function (source: string) {
  return source;
};

export const themeVarLoader = function (this: LoaderContext) {
  if (/antd\/.*style\/.*\.less$/.test(this.resourcePath)) {
    return '';
  }
  const { themeDir, darkFileName, lightFileName, themeClassPre, root, antdVersion } =
    this.getOptions();
  const darkPath = path.resolve(root, themeDir, darkFileName);
  const lightPath = path.resolve(root, themeDir, lightFileName);

  if (![darkPath, lightPath].includes(this.resourcePath)) return undefined;
  const callback = this.async();
  this.addDependency(this.resourcePath);
  const isDark = darkPath === this.resourcePath;
  const name = isDark ? 'dark' : 'light';
  const preName = `.${themeClassPre}-${name}`;
  if (antdVersion && antdVersion >= 5) {
    (async () => {
      const lessVars = await lessToJS(this.resourcePath);
      setCacheData(this, name, lessVars);
      callback(null, solveLessVars(themeClassPre, preName, lessVars, ''));
    })();
  } else {
    (async () => {
      const antLess = path.resolve(
        root,
        'node_modules',
        `antd/dist/antd${isDark ? '.dark' : ''}.less`,
      );
      const lessVars = await lessToJS(this.resourcePath);
      setCacheData(this, name, lessVars);
      const { css: antdCss } = await less.render(fs.readFileSync(antLess, 'utf-8'), {
        filename: antLess,
        javascriptEnabled: true,
        modifyVars: lessVars,
      });
      const output = postcss()
        .use(selectorNamespace({ namespace: preName }))
        .process(antdCss).css;
      callback(null, solveLessVars(themeClassPre, preName, lessVars, output));
    })();
  }
};
