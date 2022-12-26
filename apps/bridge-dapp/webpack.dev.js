// Copyright 2017-2022 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.js');
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = (env, config) => {
  env.context = __dirname;
  console.log('environment in dev');
  return merge(baseConfig(env, 'development'), {
    devtool: 'eval-source-map',
    devServer: {
      hot: true,
      open: false,
      port: process.env.PORT_BRIDGE_DAPP || 3000,
      static: path.resolve(__dirname, 'build'),
      client: {
        overlay: {
          errors: true,
          warnings: false, // Hide warnings as they present on the terminal
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: './index.html',
        inject: true,
        template: './src/public/index.html',
      }),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ],
    watchOptions: {
      // 5.66.0 work-around (was reduced to 20, then started failing)
      // https://github.com/webpack/webpack/commit/96da7660021e8aa31e163bacd3515960eb253422#diff-13cf5374edb5eced5f3770d5f346c59252f87a90de91bc57306077693c8b95e2R52
      aggregateTimeout: 600,
      ignored: ['.yarn', 'build', 'node_modules'],
    },
  });
};
