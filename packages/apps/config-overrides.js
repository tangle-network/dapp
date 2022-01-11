const { override, addWebpackAlias, getBabelLoader } = require('customize-cra');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const path = require('path');
const exec = require('child_process').exec;
const nodeExternals = require('webpack-node-externals');
const findPackages = require('../../scripts/findPackages');
const packages = findPackages();

const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const { aliasDangerous, configPaths, CracoAliasPlugin } = require('react-app-rewire-alias/lib/aliasDangerous');
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

module.exports = override(addWebpackPostBuildScript, function (config, env) {
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
  config.stats = {
    warningsFilter: [
      (w) => {
        console.log(w);
        return false;
      },
    ],
  };
  config.externals = [nodeExternals()];
  return config;
});
