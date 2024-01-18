// SPDX-License-Identifier: Apache-2.0

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.js');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = merge(
  baseConfig(__dirname, isDevelopment ? 'development' : 'production'),
  {
    plugins: [
      new HtmlWebpackPlugin({
        PAGE_TITLE: 'Hubble Bridge',
        inject: true,
        template: path.join(__dirname, 'src/public/index.html'),
      }),
    ],
    watchOptions: {
      // 5.66.0 work-around (was reduced to 20, then started failing)
      // https://github.com/webpack/webpack/commit/96da7660021e8aa31e163bacd3515960eb253422#diff-13cf5374edb5eced5f3770d5f346c59252f87a90de91bc57306077693c8b95e2R52
      aggregateTimeout: 600,
      ignored: ['.yarn', 'build', 'node_modules'],
    },
  }
);
