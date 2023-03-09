// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
const path = require('path'),
  fs = require('fs'),
  webpack = require('webpack'),
  TerserPlugin = require('terser-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
  ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin'),
  HtmlWebPackPlugin = require('html-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const findPackages = require('../../tools/scripts/findPackages');

const isDevelopment = process.env.NODE_ENV !== 'production';

const alias = findPackages().reduce((alias, { dir, name }) => {
  alias[name] = path.resolve(__dirname, `../../libs/${dir}/src`);

  return alias;
}, {});
alias['@webb-tools/stats-dapp'] = path.resolve(__dirname, `src`);

const plugins = fs.existsSync(path.join(__dirname, 'src/public'))
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

function createWebpackBase() {
  console.log(
    'Running webpack in: ',
    isDevelopment ? 'development' : 'production'
  );

  return {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'source-map' : false,
    context: __dirname,

    experiments: {
      asyncWebAssembly: true,
    },

    watchOptions: {
      poll: 1000,
      aggregateTimeout: 1000,
      ignored: ['**/node_modules'],
    },

    entry: ['@babel/polyfill', path.resolve(__dirname, 'src', 'index.tsx')],

    output: {
      chunkFilename: '[name].[chunkhash:8].js',
      filename: '[name].[contenthash:8].js',
      globalObject: "(typeof self !== 'undefined' ? self : this)",
      hashFunction: 'xxhash64',
      path: path.join(__dirname, 'build'),
      publicPath: '',
    },

    resolve: {
      alias: {
        ...alias,
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      },

      extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss', '.css'],
      modules: ['node_modules'],

      plugins: [
        new TsconfigPathsPlugin({
          extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss', '.css'],
          configFile: path.resolve(__dirname, './tsconfig.app.json'),
        }),
      ],

      fallback: {
        assert: require.resolve('assert/'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        constants: false,
        fs: false,
        url: false,
      },
    },

    module: {
      rules: [
        // js stuffs
        {
          test: /\.(t|j)sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@nrwl/web/babel',
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'entry',
                    corejs: '3',
                    targets: {
                      browsers: ['last 2 versions', 'not ie <= 8'],
                      node: 'current',
                    },
                  },
                ],
                '@babel/preset-typescript',
                ['@babel/preset-react', { development: isDevelopment }],
              ],
              plugins: [
                '@babel/plugin-proposal-nullish-coalescing-operator',
                '@babel/plugin-proposal-numeric-separator',
                '@babel/plugin-proposal-optional-chaining',
                isDevelopment && require.resolve('react-refresh/babel'),
                [
                  '@babel/plugin-transform-runtime',
                  { useESModules: false, loose: false },
                ],
                '@babel/plugin-transform-react-jsx',
                '@babel/plugin-syntax-bigint',
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-syntax-import-meta',
                '@babel/plugin-syntax-top-level-await',
                '@babel/plugin-proposal-class-properties',
                [
                  '@babel/plugin-proposal-private-property-in-object',
                  { loose: false },
                ],
                ['@babel/plugin-proposal-private-methods', { loose: false }],
                'preval',
              ].filter(Boolean),
            },
          },
        },

        // css stuffs
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
                  plugins: [
                    require('tailwindcss'),
                    // add addtional postcss plugins here
                    // easily find plugins at https://www.postcss.parts/
                  ],
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

        // markdown
        {
          test: /\.md$/,
          use: [
            require.resolve('html-loader'),
            require.resolve('markdown-loader'),
          ],
        },

        // assets
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          exclude: [/semantic-ui-css/],
          type: 'asset/resource',
          generator: {
            filename: 'static/[name].[contenthash:8][ext]',
          },
        },

        // fonts
        {
          test: /\.(ttf|eot|otf|woff)$/,
          exclude: [/semantic-ui-css/],
          type: 'asset/resource',
          generator: {
            filename: 'static/[name].[contenthash:8][ext]',
          },
        },

        // icon
        {
          test: /\.(ico)$/,
          loader: 'file-loader',
          options: {
            name: '[name][ext]',
            esModule: false,
          },
        },

        // assets
        {
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
          include: [/semantic-ui-css/],
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
          use: ['@svgr/webpack', 'file-loader'],
        },
      ],
    },

    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js',
      }),

      new webpack.ProvidePlugin({
        React: 'react',
      }),

      // build html file
      new HtmlWebPackPlugin({
        template: './src/public/index.html',
        inject: true,
        filename: './index.html',
      }),

      isDevelopment && new ReactRefreshWebpackPlugin(),

      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
      }),

      // Bundle Analyzer, a visual view of what goes into each JS file.
      // https://www.npmjs.com/package/webpack-bundle-analyzer
      process.env.ANALYZE && new BundleAnalyzerPlugin(),

      new webpack.optimize.SplitChunksPlugin(),
    ]
      .concat(plugins)
      .filter(Boolean),

    optimization: {
      minimize: !isDevelopment,

      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              // We want terser to parse ecma 8 code. However, we don't want it
              // to apply minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the `compress` and `output`
              ecma: 8,
            },
            compress: {
              ecma: 5,
              inline: 2,
              drop_console: true,
            },
            mangle: {
              // Find work around for Safari 10+
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
            },
          },

          // Use multi-process parallel running to improve the build speed
          parallel: true,

          extractComments: false,
        }),

        // https://webpack.js.org/plugins/css-minimizer-webpack-plugin/
        new CssMinimizerPlugin({
          // style do anything to the wordpress style.css file
          exclude: /style\.css$/,

          // Use multi-process parallel running to improve the build speed
          parallel: true,

          minimizerOptions: {
            preset: ['default', { discardComments: { removeAll: true } }],
            // plugins: ['autoprefixer'],
          },
        }),
      ],

      splitChunks: {
        chunks: 'all',
      },
    },

    // https://webpack.js.org/configuration/dev-server/
    devServer: {
      port: 3001,
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
      ...(isDevelopment
        ? {
            client: {
              overlay: {
                errors: false,
                warnings: false, // Hide warnings as they present on the terminal
              },
            },
          }
        : {}),
    },

    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
}

module.exports = createWebpackBase;
