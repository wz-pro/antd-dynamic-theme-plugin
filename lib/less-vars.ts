import { readFileSync } from 'fs';
import less from 'less';
import path from 'path';
const importReg = /@import\s*['"]([^'"]+)['"]\s*;/gm;
const varReg = /@[^:@'";]+\s*:\s*[^:]+\s*;/gm;
const keyReg = /@[^:@'";]+\s*:/gm;
const cssVarReg = /--([^;]+)\s*:\s*([^;]+);/g;

const solveImportItem = (parentPath: string, content: string) => {
  importReg.lastIndex = 0;
  const match = importReg.exec(content) as RegExpMatchArray;
  const matchFile = match[1].endsWith('.less') ? match[1] : `${match[1]}.less`;
  return {
    text: match[0],
    path: match[1].startsWith('~')
      ? require.resolve(matchFile.substring(1))
      : path.resolve(parentPath, matchFile),
  };
};

const getImports = (parentPath: string, fileContent: string) => {
  const result = fileContent.match(importReg);
  if (result) {
    return result.map((item) => solveImportItem(parentPath, item));
  }
  return [];
};

function getLessVars(filePath: string): string {
  const fileText = readFileSync(filePath, 'utf-8');
  const imports = getImports(path.dirname(filePath), fileText);
  const importVars: string[] = [];
  imports.forEach((item) => {
    item && importVars.push(getLessVars(item.path));
  });
  const vars = fileText.match(varReg);
  if (vars) {
    return `${importVars.join('')}${vars.join('')}`;
  }
  return `${importVars.join('')}`;
}

async function lessVars(filePath: string) {
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
  const { css } = await less.render(allCode);
  const result: { [key: string]: string } = {};
  do {
    const item = cssVarReg.exec(css);
    if (item) {
      result[item[1]] = item[2];
    }
  } while (cssVarReg.lastIndex);
  return result;
}

export default lessVars;
