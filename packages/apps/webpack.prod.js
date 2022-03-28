// Copyright 2017-2022 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.js');

module.exports = (env) => {
  env.context = __dirname;
  const hasPublic = fs.existsSync(path.join(env.context, 'public'));

  return merge(baseConfig(env), {
    devtool: process.env.BUILD_ANALYZE ? 'source-map' : false,
    plugins: [
      new HtmlWebpackPlugin({
        PAGE_TITLE: 'Webb Portal',
        inject: true,
        template: path.join(env.context, `${hasPublic ? 'public/' : ''}index.html`),
      }),
    ],
  });
};
