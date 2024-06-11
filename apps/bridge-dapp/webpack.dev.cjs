// SPDX-License-Identifier: Apache-2.0

const { composePlugins, withNx } = require('@nx/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.cjs');

module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  async (_config, env) => {
    env.context = __dirname;

    const base = await baseConfig(env, 'development');

    return merge(base, {
      devtool: 'eval-source-map',
      devServer: {
        hot: true,
        open: false,
        port: 3000,
        static: path.resolve(__dirname, '../../dist/apps/bridge-dapp'),
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
        new ReactRefreshWebpackPlugin(),
      ],
      watchOptions: {
        // 5.66.0 work-around (was reduced to 20, then started failing)
        // https://github.com/webpack/webpack/commit/96da7660021e8aa31e163bacd3515960eb253422#diff-13cf5374edb5eced5f3770d5f346c59252f87a90de91bc57306077693c8b95e2R52
        aggregateTimeout: 600,
        ignored: ['.yarn', 'build', 'node_modules'],
      },
    });
  },
);
