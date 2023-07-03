const { withNx } = require('@nx/next/plugins/with-nx');
const { createSecureHeaders } = require('next-secure-headers');

const securityHeaders = createSecureHeaders({
  frameGuard: 'sameorigin',
  xssProtection: 'block-rendering',
  referrerPolicy: 'no-referrer-when-downgrade',
}).concat([
  {
    key: 'Content-Security-Policy',
    value: 'upgrade-insecure-requests',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
]);

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
        source: '/', // Netlify preview link doesn't work without this
        headers: securityHeaders,
      },
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withNx(nextConfig);
