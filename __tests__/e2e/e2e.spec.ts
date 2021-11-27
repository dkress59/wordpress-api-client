import WpApiClient from '../../src'

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
	})

	describe('.page', () => {
		it('.find (all)', async () => {
			expect(await client.page().find()).toMatchSnapshot()
		})
		it('.find (one)', async () => {
			expect(await client.page().find(2)).toMatchSnapshot()
		})
	})
})
