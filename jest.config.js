const findPackages = require('./scripts/findPackages');
const { defaults } = require('jest-config');

const config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': require.resolve('babel-jest'),
  },
  verbose: true,
};

const internalModules = findPackages()
  .filter(({ name }) => !['@webb-dapps/apps'].includes(name))
  .reduce((modules, { dir, name }) => {
    modules[`${name}(.*)$`] = `<rootDir>/packages/${dir}/src/$1`;

    return modules;
  }, {});

module.exports = Object.assign({}, config, {
  setupFilesAfterEnv: ['./setupTests.ts'],
  moduleNameMapper: {
    ...internalModules,
    '\\.(jpg|jpeg|png|gif|svg|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/node_modules/identity-obj-proxy',
    '\\.(css|less|scss|sass)$': '<rootDir>/node_modules/jest-css-modules',
  },
  // modulePathIgnorePatterns: [...Object.values(internalModules)],
  // testPathIgnorePatterns: [...Object.values(internalModules)],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'ts-jest',
  },
});
