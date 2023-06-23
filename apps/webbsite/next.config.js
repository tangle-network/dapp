const { withNx } = require('@nx/next/plugins/with-nx');
const { createSecureHeaders } = require('next-secure-headers');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: createSecureHeaders({
          frameGuard: 'sameorigin',
          xssProtection: 'block-rendering',
          referrerPolicy: 'origin-when-cross-origin',
        }).concat([
          {
            key: 'Content-Security-Policy',
            value: 'upgrade-insecure-requests',
          },
        ]),
      },
    ];
  },
};

module.exports = withNx(nextConfig);
