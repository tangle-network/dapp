const { override } = require('customize-cra');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const path = require('path');

const findPackages = require('../../scripts/findPackages');

const packages = findPackages();

const rewireReactHotLoader = require('react-app-rewire-hot-loader');

module.exports = override(function (config, env) {
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
  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: /node_modules/,
    type: 'javascript/auto',
    // include: path.resolve(__dirname, 'src'),
    use: [{ loader: require.resolve('wasm-loader'), options: {} }],
  });

  config.module.rules.push({
    test: /.worker.(ts|js)?$/,
    loader: 'worker-loader',
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
  }

  config = rewireReactHotLoader(config, env);
  return config;
});
