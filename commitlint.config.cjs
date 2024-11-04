module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'footer-leading-blank': [2, 'never'],
    'subject-max-length': [1, 'always', 110], // Warn when commit message is above 110 characters (longest commit message seen thus far in this repository).
    'subject-min-length': [1, 'always', 10], // Warn when commit message is below 10 characters (shortest commit message seen thus far in this repository).
    'subject-case': [1, 'always', 'sentence-case'],
    'scope-empty': [1, 'never'],
    'scope-enum': [
      1,
      'always',
      [
        'repo',
        'tangle-dapp',
        'tangle-cloud',
        'testnet-leaderboard',
        'webb-ui',
        'icons',
        'tools',
      ],
    ],
  },
  ignores: [(message) => message.startsWith('[RELEASE]')],
};
