const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  publicPath: './',
  // 输出到 dist 目录
  outputDir: 'dist',
  productionSourceMap: false,
  indexPath: 'index.html',  // 确保生成的 index.html 在正确位置
  // 复制 plugin.json、preload.js 和 logo 到输出目录
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public/plugin.json'),
            to: path.resolve(__dirname, 'dist/plugin.json')
          },
          {
            from: path.resolve(__dirname, 'public/preload.js'),
            to: path.resolve(__dirname, 'preload.js')
          },
          {
            from: path.resolve(__dirname, 'public/logo.png'),
            to: path.resolve(__dirname, 'dist/logo.png')
          },
          {
            from: path.resolve(__dirname, 'public/favicon.ico'),
            to: path.resolve(__dirname, 'dist/favicon.ico')
          }
        ]
      })
    ]
  }
};
