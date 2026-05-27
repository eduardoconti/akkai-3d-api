module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.spec\\.ts$',
    '\\.module\\.ts$',
    '/database/migrations/',
    '/config/',
    'main\\.ts$',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^@auth/(.*)$': '<rootDir>/auth/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@consignacao/(.*)$': '<rootDir>/consignacao/$1',
    '^@financeiro/(.*)$': '<rootDir>/financeiro/$1',
    '^@orcamento/(.*)$': '<rootDir>/orcamento/$1',
    '^@produto/(.*)$': '<rootDir>/produto/$1',
    '^@relatorio/(.*)$': '<rootDir>/relatorio/$1',
    '^@venda/(.*)$': '<rootDir>/venda/$1',
    '^@assinatura/(.*)$': '<rootDir>/assinatura/$1',
  },
  // CRITICAL: Use only 1 worker to prevent concurrency issues in tests that access shared resources (database, etc)
  // See .clauderules and CLAUDE.md for details
  maxWorkers: 1,
};
