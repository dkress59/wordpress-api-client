import 'jest-specific-snapshot'

import WpApiClient from '../../../src'

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
	})

	it('.theme', async () => {
		expect(
			(await client.theme()).filter(
				theme => theme.textdomain === 'twentytwentyone',
			),
		).toHaveLength(1)
	})
})
