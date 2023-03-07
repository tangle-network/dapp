// Copyright 2017-2022 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.js');

module.exports = (env) => {
  env.context = __dirname;

  return merge(baseConfig(env), {
    devtool: process.env.BUILD_ANALYZE ? 'source-map' : false,
    devServer: {
      client: {
        logging: 'error',
        overlay: {
          errors: true,
          warnings: false, // Hide overlay warnings as they present on the terminal
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: './index.html',
        inject: true,
        template: './src/public/index.html',
      }),
    ],
  });
};
