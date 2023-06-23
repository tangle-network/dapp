const { withNx } = require('@nx/next/plugins/with-nx');
const { createSecureHeaders } = require('next-secure-headers');

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
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'x-header',
            value: 'value',
          },
        ],
      },
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
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ]),
      },
    ];
  },
};

module.exports = withNx(nextConfig);
