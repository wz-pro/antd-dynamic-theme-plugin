const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// import  webpack from 'webpack';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import ThemePlugin from 'antd-dynamic-theme-plugin';
const ThemePlugin = require('antd-dynamic-theme-plugin').default;

module.exports = {
  entry: [
    'webpack/hot/dev-server.js',
    'webpack-dev-server/client/index.js?hot=true&live-reload=true',
    path.resolve(__dirname, 'src/index.tsx'),
  ],
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    modules: [path.join(__dirname, 'src'), path.join(__dirname, 'node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.less', '.css'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      favicon: path.resolve(__dirname, 'public/favicon.svg'),
      template: path.resolve(__dirname, 'public/index.html'),
      inject: true,
    }),
    new ThemePlugin({}),
  ],
  devServer: {
    static: path.join(process.cwd(), 'dist'),
    host: '0.0.0.0',
    port: 8080,
    hot: false,
    client: false,
  },
};