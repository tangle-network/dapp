const { withNx } = require('@nx/next/plugins/with-nx');
const nextCfgBase = require('../../next.config');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  ...nextCfgBase,

  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: true,
  },
};

module.exports = withNx(nextConfig);
