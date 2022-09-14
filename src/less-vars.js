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
const fs_1 = require('fs');
const less_1 = __importDefault(require('less'));
const path_1 = __importDefault(require('path'));
const importReg = /@import\s*['"]([^'"]+)['"]\s*;/gm;
const varReg = /@[^:@'";]+\s*:\s*[^:]+\s*;/gm;
const keyReg = /@[^:@'";]+\s*:/gm;
const cssVarReg = /--([^;]+)\s*:\s*([^;]+);/g;
const solveImportItem = (parentPath, content) => {
  importReg.lastIndex = 0;
  const match = importReg.exec(content);
  const matchFile = match[1].endsWith('.less') ? match[1] : `${match[1]}.less`;
  return {
    text: match[0],
    path: match[1].startsWith('~')
      ? require.resolve(matchFile.substring(1))
      : path_1.default.resolve(parentPath, matchFile),
  };
};
const getImports = (parentPath, fileContent) => {
  const result = fileContent.match(importReg);
  if (result) {
    console.log('hello result:', result);
    return result.map((item) => solveImportItem(parentPath, item));
  }
  return [];
};
function getLessVars(filePath) {
  const fileText = (0, fs_1.readFileSync)(filePath, 'utf-8');
  const imports = getImports(path_1.default.dirname(filePath), fileText);
  const importVars = [];
  imports.forEach((item) => {
    item && importVars.push(getLessVars(item.path));
  });
  const vars = fileText.match(varReg);
  if (vars) {
    return `${importVars.join('')}${vars.join('')}`;
  }
  return `${importVars.join('')}`;
}
function lessVars(filePath) {
  return __awaiter(this, void 0, void 0, function* () {
    const lessCode = getLessVars(filePath);
    const keys = (lessCode.match(keyReg) || []).map((item) => {
      const key = item.substring(1, item.length - 1);
      return `--${key}:@${key}`;
    });
    if (!keys.length) return {};
    const allCode = `
  ${lessCode}
   .css-var{${keys.join(';')};}
  `;
    const { css } = yield less_1.default.render(allCode);
    const result = {};
    do {
      const item = cssVarReg.exec(css);
      if (item) {
        result[item[1]] = item[2];
      }
    } while (cssVarReg.lastIndex);
    return result;
  });
}
exports.default = lessVars;
