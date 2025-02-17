/* eslint-disable */
export default {
  displayName: 'testnet-leaderboard',
  preset: '../../jest.preset.cjs',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/testnet-leaderboard',
};
