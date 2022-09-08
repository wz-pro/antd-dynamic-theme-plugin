export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: 'ts-jest',
  transform: { '^.+\\.ts?$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'js', 'node'],
  testEnvironment: 'node',
};
