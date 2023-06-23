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
        source: '/(.*)',
        headers: createSecureHeaders({
          frameGuard: 'sameorigin',
          xssProtection: 'block-rendering',
          contentSecurityPolicy: {
            directives: {
              defaultSrc: 'self',
            },
          },
          referrerPolicy: 'origin-when-cross-origin',
        }),
      },
    ];
  },
};

module.exports = withNx(nextConfig);
