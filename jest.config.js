export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)',
  ],
  testMatch: [
    '<rootDir>/src/tests/**/*.test.{js,jsx}',
  ],
  collectCoverageFrom: [
    'src/services/**/*.{js,jsx}',
    'src/features/**/*.{js,jsx}',
    'src/components/**/*.{js,jsx}',
    'src/hooks/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/tests/**',
  ],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testTimeout: 10000,
}
