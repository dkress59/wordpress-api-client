module.exports = {
	root: true,
	env: {
		node: true,
		jest: true,
	},
	extends: ['@tool-belt/eslint-config'],
	parserOptions: {
		project: ['./tsconfig.json'],
	},
	plugins: ['unused-imports'],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
		},
	},
	rules: {
		'curly': 'off',
		'no-console': 'error',
		'unused-imports/no-unused-imports': 'error',
		//'no-restricted-imports': ['error', { 'paths': ['.'] }]
	},
}
