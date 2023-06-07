// Copyriget 2017-2022 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const findPackages = require('../../tools/scripts/findPackages');
const packageJson = require(path.resolve(__dirname, 'package.json'));
const packageVersion = packageJson.version;

function mapChunks(name, regs, inc) {
  return regs.reduce(
    (result, test, index) => ({
      ...result,
      [`${name}${index}`]: {
        chunks: 'initial',
        enforce: true,
        name: `${name}.${`0${index + (inc || 0)}`.slice(-2)}`,
        test,
      },
    }),
    {}
  );
}

function createWebpack(env, mode = 'production') {
  console.log('Running webpack in: ', mode);
  const isDevelopment = mode === 'development';
  const alias = findPackages().reduce((alias, { dir, name }) => {
    alias[name] = path.resolve(__dirname, `../../libs/${dir}/src`);

    return alias;
  }, {});
  alias['@webb-tools/bridge-dapp'] = path.resolve(__dirname, `src`);
  const plugins = fs.existsSync(path.join(env.context, 'src/public'))
    ? [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'src/public',
              globOptions: {
                dot: true,
                ignore: ['**/index.html'],
              },
            },
          ],
        }),
      ]
    : [];

  return {
    experiments: {
      asyncWebAssembly: true,
    },
    context: env.context,
    entry: [path.resolve(__dirname, 'src', 'index.tsx')],
    mode,
    module: {
      rules: [
        {
          scheme: 'data',
          type: 'asset/resource',
        },
        {
          test: /\.s?[ac]ss$/i,
          use: [
            isDevelopment
              ? 'style-loader'
              : {
                  // save the css to external file
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    esModule: false,
                  },
                },
            {
              // becombine other css files into one
              // https://www.npmjs.com/package/css-loader
              loader: 'css-loader',
              options: {
                esModule: false,
                importLoaders: 2, // 2 other loaders used first, postcss-loader and sass-loader
                sourceMap: isDevelopment,
              },
            },
            {
              // process tailwind stuff
              // https://webpack.js.org/loaders/postcss-loader/
              loader: 'postcss-loader',
              options: {
                sourceMap: isDevelopment,
                postcssOptions: {
                  plugins: [require('tailwindcss')],
                },
              },
            },
            {
              // load sass files into css files
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment,
              },
            },
          ],
        },
        {
          // exclude all node_modules except @webb-tools/contracts
          exclude: /node_modules\/(?!(@webb-tools\/contracts(\/.*)?)).*/,
          test: /\.(js|mjs|ts|tsx)$/,
          use: [
            require.resolve('thread-loader'),
            {
              loader: require.resolve('babel-loader'),
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-typescript',
                  [
                    '@babel/preset-react',
                    { development: isDevelopment, runtime: 'automatic' },
                  ],
                ],
                plugins: [
                  isDevelopment && require.resolve('react-refresh/babel'),
                  ['@babel/plugin-transform-runtime', { loose: false }],
                  ['@babel/plugin-proposal-class-properties', { loose: true }],
                  [
                    '@babel/plugin-proposal-private-property-in-object',
                    { loose: true },
                  ],
                  ['@babel/plugin-proposal-private-methods', { loose: true }],
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.md$/,
          use: [
            require.resolve('html-loader'),
            require.resolve('markdown-loader'),
          ],
        },
        {
          exclude: [/semantic-ui-css/],
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          type: 'asset/resource',
          generator: {
            filename: 'static/[name].[contenthash:8].[ext]',
          },
        },
        {
          exclude: [/semantic-ui-css/],
          test: [/\.eot$/, /\.ttf$/, /\.woff$/, /\.woff2$/],
          type: 'asset/resource',
          generator: {
            filename: 'static/[name].[contenthash:8].[ext]',
          },
        },
        {
          include: [/semantic-ui-css/],
          test: [
            /\.bmp$/,
            /\.gif$/,
            /\.jpe?g$/,
            /\.png$/,
            /\.eot$/,
            /\.ttf$/,
            /\.woff$/,
            /\.woff2$/,
          ],
          use: [
            {
              loader: require.resolve('null-loader'),
            },
          ],
        },
        // svg react generator
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack'],
        },
      ],
    },
    node: {
      __dirname: true,
      __filename: false,
    },
    optimization: {
      minimize: mode === 'production',
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
      splitChunks: {
        cacheGroups: {
          ...mapChunks('robohash', [
            /* 00 */ /RoboHash\/(backgrounds|sets\/set1)/,
            /* 01 */ /RoboHash\/sets\/set(2|3)/,
            /* 02 */ /RoboHash\/sets\/set(4|5)/,
          ]),
          ...mapChunks('polkadot', [
            /* 00 */ /node_modules\/@polkadot\/(wasm)/,
            /* 01 */ /node_modules\/(@polkadot\/(api|metadata|rpc|types))/,
            /* 02 */ /node_modules\/(@polkadot\/(extension|keyring|networks|react|ui|util|vanitygen|x-)|@acala-network|@edgeware|@laminar|@ledgerhq|@open-web3|@sora-substrate|@subsocial|@zondax|edgeware)/,
          ]),
          ...mapChunks('react', [
            /* 00 */ /node_modules\/(@fortawesome)/,
            /* 01 */ /node_modules\/(@emotion|@semantic-ui-react|@stardust|classnames|chart\.js|codeflask|copy-to-clipboard|file-selector|file-saver|hoist-non-react|i18next|jdenticon|keyboard-key|mini-create-react|popper\.js|prop-types|qrcode-generator|react|remark-parse|semantic-ui|styled-components)/,
          ]),
          ...mapChunks('other', [
            /* 00 */ /node_modules\/(@babel|ansi-styles|asn1|browserify|buffer|history|html-parse|inherit|lodash|object|path-|parse-asn1|pbkdf2|process|public-encrypt|query-string|readable-stream|regenerator-runtime|repeat|rtcpeerconnection-shim|safe-buffer|stream-browserify|store|tslib|unified|unist-util|util|vfile|vm-browserify|webrtc-adapter|whatwg-fetch)/,
            /* 01 */ /node_modules\/(attr|brorand|camelcase|core|chalk|color|create|cuint|decode-uri|deep-equal|define-properties|detect-browser|es|event|evp|ext|function-bind|has-symbols|ieee754|ip|is|lru|markdown|minimalistic-|moment|next-tick|node-libs-browser|random|regexp|resolve|rxjs|scheduler|sdp|setimmediate|timers-browserify|trough)/,
            /* 03 */ /node_modules\/(base-x|base64-js|blakejs|bip|bn\.js|cipher-base|crypto|des\.js|diffie-hellman|elliptic|hash|hmac|js-sha3|md5|miller-rabin|ripemd160|secp256k1|scryptsy|sha\.js|xxhashjs)/,
          ]),
        },
      },
    },
    output: {
      chunkFilename: '[name].[chunkhash:8].js',
      filename: '[name].[contenthash:8].js',
      globalObject: "(typeof self !== 'undefined' ? self : this)",
      hashFunction: 'xxhash64',
      path: path.join(env.context, '../../dist/apps/bridge-dapp'),
      publicPath: '',
    },
    performance: {
      hints: false,
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js',
        React: 'react',
      }),
      new webpack.IgnorePlugin({
        contextRegExp: /moment$/,
        resourceRegExp: /^\.\/locale$/,
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.LOCAL_FIXTURES': JSON.stringify(
          process.env.LOCAL_FIXTURES
        ),
        'process.env.DEPLOYMENT': JSON.stringify(
          process.env.DEPLOYMENT ?? 'develop'
        ),
        'process.env.NX_BRIDGE_APP_DOMAIN': JSON.stringify(
          process.env.NX_BRIDGE_APP_DOMAIN
        ),
        'process.env.BRIDGE_VERSION': JSON.stringify(packageVersion),
      }),
      new webpack.optimize.SplitChunksPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
      }),
    ].concat(plugins),
    resolve: {
      alias: {
        ...alias,
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      },
      extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
      fallback: {
        assert: require.resolve('assert/'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        zlib: require.resolve('browserify-zlib'),
        constants: false,
        fs: false,
        url: false,
      },
    },

    // https://webpack.js.org/configuration/dev-server/
    devServer: {
      port: 3000,
      host: '0.0.0.0',
      compress: true,
      allowedHosts: 'all',
      // This option fix the error `originalOnListen is not a function` when using `webpack-dev-server`
      onListening: function (devServer) {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        const port = devServer.server.address().port;
        console.log('Listening on port:', port);
      },
      hot: true,
    },
  };
}

module.exports = createWebpack;
