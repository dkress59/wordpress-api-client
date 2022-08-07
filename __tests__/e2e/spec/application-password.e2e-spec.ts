import 'jest-specific-snapshot'

import { randomUUID } from 'crypto'
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

	describe('.applicationPassword', () => {
		it('.create', async () => {
			const appId = randomUUID()
			const mockAppName = 'mock-app-name'
			const userId = (await client.user().findMe()).id
			const response = await client
				.applicationPassword()
				.create(userId, appId, mockAppName)
			expect(response._links.self).toHaveLength(1)
			expect(response.name).toEqual(mockAppName)
			expect(response.last_used).toBeNull()
		})
	})
})
