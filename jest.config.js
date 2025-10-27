const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {

  testEnvironment: 'jest-environment-jsdom-global',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'next/server': '<rootDir>/__mocks__/next/server.js',
    'node-fetch': '<rootDir>/__mocks__/node-fetch.js',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
