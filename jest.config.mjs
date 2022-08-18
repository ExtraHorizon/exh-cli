export default {
  verbose: true,
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  moduleFileExtensions: [
    'mjs',
    'mts',
    'ts',
    'js',
    'json'
  ],
  transform: {},
  testRegex: "/tests/.*\\.test\\.mts",
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/src/'
  ],
  reporters: [
    'default',
  ],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  resolver: "<rootDir>/mjs-resolver.ts"
}