
const plugins = require('@polkadot/dev/config/babel-plugins.cjs');
const presets = require('@polkadot/dev/config/babel-presets.cjs');

module.exports = {
  assumptions: {
    privateFieldsAsProperties: true,
    setPublicClassFields: true
  },
  plugins: plugins(false, false),
  presets: presets(false),
  babelrcRoots: ['.', 'packages/*']
};
