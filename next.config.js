// Contains shared configuration for all Next.js apps in the workspace.

import { createSecureHeaders } from 'next-secure-headers';

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
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
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

export default nextConfig;
