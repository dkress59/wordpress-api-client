import 'jest-specific-snapshot'

import fs from 'fs'
import path from 'path'

import WpApiClient from '../../../src'

const snapshotPath = path.resolve(process.cwd(), './__snapshots__')

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
	})

	beforeAll(() => () => {
		if (!fs.existsSync(snapshotPath)) fs.mkdirSync(snapshotPath)
	})

	it('.blockDirectory', async () => {
		const response = await client.blockDirectory(' ')
		expect(response.some(Boolean)).toBe(true)
	})
})
