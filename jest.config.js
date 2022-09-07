const { pathsToModuleNameMapper } = require('ts-jest');
const { paths } = require('./tsconfig').compilerOptions;

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>' }),
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json'
    }
  }
};
