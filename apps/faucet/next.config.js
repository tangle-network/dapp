const { withNx } = require('@nx/next/plugins/with-nx');
const headers = require('../../tools/shared/headers');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  reactStrictMode: true,
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  headers,
};

module.exports = withNx(nextConfig);
