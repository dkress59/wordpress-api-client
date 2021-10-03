module.exports = {
	root: true,
	env: {
		node: true,
		jest: true,
	},
	extends: ['@sprylab/eslint-config'],
	parserOptions: {
		project: ['./tsconfig.json'],
	},
	plugins: ['jam3', 'unused-imports'],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
		},
	},
	rules: {
		'curly': 'off',
		'jam3/no-sanitizer-with-danger': 2,
		'unused-imports/no-unused-imports': 'error',
		'eslint-comments/disable-enable-pair': 'off',
	},
}
