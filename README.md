<div align="center" style="margin: 40px 0">
  <a href="https://ant.design" style="margin-right: 60px">
    <img width="160" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg">
  </a>

  <a href="https://github.com/webpack/webpack">
    <img width="160" height="160" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>

  <div style="margin-top: 20px">
    <a align="center" href="https://lesscss.org/">
      <img src="http://lesscss.org/public/img/less_logo.png" width="264" height="117">
    </a>
  </div>

</div>

[![npm version](https://img.shields.io/npm/v/ts-loader.svg)](https://www.npmjs.com/package/antd-dynamic-theme-plugin)
[![Downloads](http://img.shields.io/npm/dm/ts-loader.svg)](https://www.npmjs.com/package/antd-dynamic-theme-plugin)
[![node version](https://img.shields.io/node/v/ts-loader.svg)](https://www.npmjs.com/package/ts-loader)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# Antd Dynamic Theme Plugin

This plugin allows the project to support theme switching between dark and light modes

## Getting Started

Make sure the project has `antd`, `less`, `less-loader` and `webpack` installed before starting.

To begin, you'll need to install `antd-dynamic-theme-plugin`.

```console
npm install antd-dynamic-theme-plugin --save-dev
```

or

```console
yarn add -D antd-dynamic-theme-plugin
```

## Config

Then add the plugin to your `webpack` config. For example:

**webpack.config.js**

```js
import AntdDynamicThemePlugin from 'antd-dynamic-theme-plugin';

export default {
  plugins: [
    new AntdDynamicThemePlugin({
      themeDir: 'src/theme',
      darkFileName: 'dark.less',
      lightFileName: 'light.less',
    }),
  ],
};
```

You need to create `src/theme` folder, then create `dark.less` and `light.less`, corresponding to light and dark themes respectively.For example:

**dark.less**

```less
// antd color
@primary-color: #4e5969;
@background-color: #101222;

// more color
@my-color: blue;
```

**light.less**

```less
@primary-color: green;

@my-color: red;
```

## Usage

Now, you can use variables directly in less files without importing dark.less or light.less, For example:

```index.less
.root {
  color: @my-clor;
}
```

In js, you can get the corresponding variable through the global variable, For example:

```js
const isDark = true;

function getColor(color) {
  const { dark, light } = window.THEMEVARS;
  return isDark ? dark[color] : light[color];
}

getColor('primary-color'); // return #4e5969
```

you can change theme, like this:

```js
// dark;
window.changeGlobalTheme(true);

//light;
window.changeGlobalTheme(false);
```

## Options

|       Name        |       Type        |     Default     | Description                                     |
| :---------------: | :---------------: | :-------------: | :---------------------------------------------- |
|     `'root'`      |     `string`      | `process.cwd()` | project root directory                          |
| `'themeClassPre'` |     `string`      |  `antd-theme`   | global class name pre                           |
|   `'themeDir'`    |     `string`      |   `src/theme`   | The directory where the theme files are located |
| `'darkFileName'`  |     `string`      |   `dark.less`   | dark theme filename                             |
| `'lightFileName'` |     `string`      |  `light.less`   | light theme filename                            |
|   `'initTheme'`   | `dark` or `light` |     `dark`      | default theme                                   |
