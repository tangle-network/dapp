const { withNx } = require('@nx/next/plugins/with-nx');
const headers = require('../../tools/shared/headers');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: true,
  },
  headers,
};

module.exports = withNx(nextConfig);
