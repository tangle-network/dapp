module.exports = async function () {
  return [
    {
      source: '/(.*)',
      headers: [
        // Enforce HTTPS connections
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        // Protect against XSS attacks
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        // Prevent clickjacking
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        // Define which browser features and APIs can be used in its context.
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
        },
        // Prevent MIME-sniffing
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        // Controls how much referrer information should be included with requests.
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        // Upgrade all HTTP requests to HTTPS
        {
          key: 'Content-Security-Policy',
          value: 'upgrade-insecure-requests',
        },
      ],
    },
  ];
};
