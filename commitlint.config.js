module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-empty': [2, 'always'], // Disable the body portion.
    'subject-max-length': [1, 'always', 110], // Warn when commit message is above 110 characters (longest commit message seen thus far in this repository).
    'subject-min-length': [1, 'always', 10], // Warn when commit message is below 10 characters (shortest commit message seen thus far in this repository).
    'subject-case': [2, 'always', 'sentence-case'],
    'scope-enum': [
      1,
      'always',
      [
        'bridge',
        'faucet',
        'hubble-stats',
        'stats',
        'tangle',
        'testnet-leaderboard',
        'zk-explorer',
        'webb-ui',
        'icons',
        'tools',
      ],
    ],
  },
};
