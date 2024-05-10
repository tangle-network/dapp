// SPDX-License-Identifier: Apache-2.0

const { composePlugins, withNx } = require('@nx/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.js');

module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (_config, env) => {
    env.context = __dirname;

    return merge(baseConfig(env, 'production'), {
      devtool: process.env.BUILD_ANALYZE ? 'source-map' : false,
      devServer: {
        client: {
          logging: 'error',
          overlay: {
            errors: true,
            warnings: false,
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
  }
);
