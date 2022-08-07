import { ForegroundColor } from 'chalk'
// eslint-disable-next-line jest/no-jest-import
import jest from 'jest'

const coveragePathIgnorePatterns = [
	'__tests__',
	'.yarn',
	'.factory.ts',
	'.spec.ts',
]

function createProject(
	name: string,
	color: ForegroundColor,
	testMatch: string[],
): jest.Config {
	return {
		clearMocks: true,
		coveragePathIgnorePatterns,
		displayName: {
			color,
			name,
		},
		preset: 'ts-jest',
		testMatch,
	}
}

const jestConfig: jest.Config = {
	cacheDirectory: '.jest/cache',
	collectCoverage: true,
	coverageProvider: 'v8',
	preset: 'ts-jest',
	projects: [
		createProject('core', 'gray', ['**/__tests__/**/*.spec.[jt]s']),
		createProject('e2e', 'green', ['**/__tests__/**/*.e2e-spec.[jt]s']),
	],
	testMatch: ['**/__tests__/**/*.(e2e-spec|spec).[jt]s'],
	verbose: true,
}

export default jestConfig
