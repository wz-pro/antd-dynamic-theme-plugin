import webpack, { Configuration } from 'webpack';
import path from 'path';
import { createFsFromVolume, Volume } from 'memfs';

export default function (config: Configuration) {
  const allConfig: Configuration = {
    mode: 'development',
    context: path.resolve(__dirname, '../assets'),
    entry: '',
    output: {
      path: path.resolve(__dirname, '../build'),
    },
    module: {
      rules: [
        {
          test: '.less$',
          use: ['style-loader', 'css-loader', 'less-loader'],
        },
      ],
    },
    ...config,
  };

  const compiler = webpack(allConfig);

  if (!compiler.outputFileSystem) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
  }

  return compiler;
}
