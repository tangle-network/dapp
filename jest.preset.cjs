/** @type {import('@jest/types').Config.InitialOptions} */

const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  setupFilesAfterEnv: ['<rootDir>../../jest.setup.ts'],
};
