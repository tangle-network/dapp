// SPDX-License-Identifier: Apache-2.0

const { composePlugins, withNx } = require('@nx/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.cjs');

module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  async (_config, env) => {
    env.context = __dirname;

    const base = await baseConfig(env, 'production');

    return merge(base, {
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
  },
);
