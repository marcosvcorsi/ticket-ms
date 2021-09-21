/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  coverageDirectory: "coverage",
  testMatch: ['**/*.spec.ts'],
  roots: [
    "<rootDir>/src",
    "<rootDir>/tests"
  ],
  transform: {
    '\\.ts$': 'ts-jest'
  },
};
