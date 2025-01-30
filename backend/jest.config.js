module.exports = {
    testEnvironment: 'node',
    verbose: true,
    testTimeout: 10000,
    setupFilesAfterEnv: ['./tests/setup.js'],
    collectCoverage: true,
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/tests/setup.js'
    ],
    testMatch: ['**/tests/**/*.test.js'],
    moduleDirectories: ['node_modules', '<rootDir>']
  };