const { override, addWebpackAlias, useBabelRc, getBabelLoader, babelExclude, addBabelPresets, addBabelPlugin, addExternalBabelPlugin } = require('customize-cra');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const webpack = require('webpack');
const path = require('path');
const exec = require('child_process').exec;
const findPackages = require('../../scripts/findPackages');
const packages = findPackages();

const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const { configPaths } = require('react-app-rewire-alias/lib/aliasDangerous');
const WebpackPostBuildScript = function () {
  this.apply = function (compiler) {
    compiler.hooks.afterEmit.tap('WebpackPostBuildScript', (compilation) => {
      exec('../../scripts/bigintBabelFix.sh', (err, stdout, stderr) => {
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);
      });
    });
  };
};

const addWebpackPostBuildScript = (config) => {
  config.plugins.push(new WebpackPostBuildScript());

  return config;
};

const removeBuiltInBabelConfig = config => {
  getBabelLoader(config).options.presets = [];
  getBabelLoader(config).options.plugins = [];
  return config;
}

module.exports = override(
  removeBuiltInBabelConfig,
  ...addBabelPresets(
    '@babel/preset-typescript',
    ['@babel/preset-react', { development: false, runtime: 'automatic' }],
    ['@babel/preset-env', { loose: true, modules: 'commonjs', targets: { browsers: '>0.25% and last 2 versions and not ie 11 and not OperaMini all', node: '12' } }]
  ),
  addBabelPlugin('@babel/plugin-proposal-nullish-coalescing-operator'),
  addBabelPlugin('@babel/plugin-proposal-numeric-separator'),
  addBabelPlugin('@babel/plugin-proposal-optional-chaining'),
  addBabelPlugin(['@babel/plugin-transform-runtime', { "useESModules": false }]),
  addBabelPlugin('@babel/plugin-syntax-bigint'),
  addBabelPlugin('@babel/plugin-transform-react-jsx'),
  addBabelPlugin('@babel/plugin-syntax-top-level-await'),
  addBabelPlugin('babel-plugin-styled-components'),
  addBabelPlugin(['@babel/plugin-proposal-class-properties', { "loose": true }]),
  addBabelPlugin(['@babel/plugin-proposal-private-methods', { "loose": true }]),
  addBabelPlugin(['@babel/plugin-proposal-private-property-in-object', { "loose": true }]),
  addExternalBabelPlugin(['@babel/plugin-proposal-class-properties', { "loose": true }]),
  addExternalBabelPlugin(['@babel/plugin-proposal-private-methods', { "loose": true }]),
  addExternalBabelPlugin(['@babel/plugin-proposal-private-property-in-object', { "loose": true }]),
  addWebpackPostBuildScript,
  function (config, env) {
    config.plugins.push(
      new webpack.ProvidePlugin({
        'process.env.NODE_ENV': JSON.stringify(config.mode),
      })
    );

    // include lib
    config.module.rules.forEach((rule) => {
      if (!Reflect.has(rule, 'oneOf')) {
        return false;
      }

      rule.oneOf.forEach((loader) => {
        if (loader.test && loader.test.toString().includes('tsx')) {
          loader.include = packages.map(({ dir }) => path.resolve(__dirname, `../${dir}/src`));
        }
      });
    });

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    config.module.rules.push({
      test: /\.js$/,
      loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      include: path.resolve(__dirname, '../../node_modules/@polkadot'),
    })

    const wasmExtensionRegExp = /\.wasm$/;
    config.resolve.extensions.push('.wasm');

    config.module.rules.forEach((rule) => {
      (rule.oneOf || []).forEach((oneOf) => {
        if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
          // make file-loader ignore WASM files
          oneOf.exclude.push(wasmExtensionRegExp);
        }
      });
    });
    //wasam
    // config.module.rules.push({
    //  test: wasmExtensionRegExp,
    //  include: /node_modules/,
    //  type: 'javascript/dynamic',
    //  include: path.resolve(__dirname, 'src'),
    //  use: [{ loader: require.resolve('wasm-loader'), options: {} }],
    // });

    config.module.rules.push({
      test: /.worker.(ts|js)?$/,
      loader: 'worker-loader',
      options: {
        filename: '[name].[contenthash].js',
      },
      // include: path.resolve(__dirname, 'src'),
    });

    // remove ModuleScoplePlugin
    config.resolve.plugins = config.resolve.plugins.filter((plugin) => !(plugin instanceof ModuleScopePlugin));
    config.resolve.alias = packages.reduce((pre, cur) => {
      pre[cur.name] = path.resolve(__dirname, `../${cur.dir}/src`);

      return pre;
    }, {});

    if (config.mode !== 'production') {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'react-dom': '@hot-loader/react-dom',
      };
      config = rewireReactHotLoader(config, env);
    } else {
      const paths = configPaths('../../tsconfig.json');
      const p = {};
      for (const key of Object.keys(paths)) {
        p[key + '/'] = path.resolve(process.cwd(), '..', '..', paths[key]);
      }
      addWebpackAlias(p)(config);
    }
    return config;
  }
);
