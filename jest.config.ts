import jest from 'jest'

const jestConfig: jest.Config = {
	cacheDirectory: '.jest/cache',
	clearMocks: true,
	collectCoverage: true,
	coveragePathIgnorePatterns: [
		'.yarn',
		'node_modules',
		'src/factories.ts',
		'.factory.ts',
		'__tests__',
		'.spec.ts',
	],
	coverageProvider: 'v8',
	preset: 'ts-jest',
	testMatch: ['**/__tests__/**/*.(spec|test).[jt]s?(x)'],
}

export default jestConfig
