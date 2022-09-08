import getCompiler from './getCompiler';
import { Configuration } from 'webpack';
import AntdDynamicThemePlugin from '../../lib';
import path from 'path';

export default function (config: Configuration = {}) {
  const compiler = getCompiler(config);

  new AntdDynamicThemePlugin({
    root: path.resolve(__dirname, '../../'),
    themeDir: path.resolve(__dirname, '../assets'),
  }).apply(compiler);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || !stats) return reject(err);
      resolve({ compiler, stats, compilation: stats.compilation });
    });
  });
}
