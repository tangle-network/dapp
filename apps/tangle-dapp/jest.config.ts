import type { Config } from 'jest';

/* eslint-disable */
export default {
  displayName: 'tangle-dapp',
  preset: '../../jest.preset.cjs',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/next/babel'],
        plugins: ['babel-plugin-transform-import-meta'],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!@webb-tools/app-util|use-local-storage-state|react-syntax-highlighter|@mangatax-highlighter|wagmi|@wagmi/core|@mangata-finance/type-definitions|@hyperlane-xyz/sdk|@hyperlane-xyz/utils|@hyperlane-xyz/core|@hyperlane-xyz/registry|lodash-es)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/tangle-dapp',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/../../__mocks__/svg.js',
    '\\.svg\\?url$': '<rootDir>/../../__mocks__/svgUrl.js',
  },
} satisfies Config;
