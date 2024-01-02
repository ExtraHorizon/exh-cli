module.exports = {
  verbose: true,
  testEnvironment: 'node',
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ],
  transform: {
    '\\.ts$': 'ts-jest'
  },
  testRegex: '/tests/.*\\.(ts|js)$',
  // setupFiles: [
  //   "<rootDir>/tests/__helpers__/beforeEachSuite.ts"
  // ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/__helpers__/',
    '/build/',
  ],
  reporters: [
    'default',
  ]
}
