module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['<rootDir>/test/**/*.test.(ts|js)'],
  moduleNameMapper: {
    '^elmish$': '<rootDir>/test/__mocks__/elmish.(ts|js)'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
