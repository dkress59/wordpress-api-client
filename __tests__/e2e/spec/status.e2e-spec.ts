import 'jest-specific-snapshot'

import fs from 'fs'
import path from 'path'

import WpApiClient from '../../../src'

const snapshotPath = path.resolve(process.cwd(), './__snapshots__')
function fileName(name: string, dir?: string) {
	const pathName = path.join(snapshotPath, dir ?? '')
	if (dir && !fs.existsSync(pathName)) fs.mkdirSync(pathName)
	return path.join(pathName, `e2e-${name}.snapshot`)
}

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
	})
	const noAuthClient = new WpApiClient('http://localhost:8080')

	beforeAll(() => () => {
		if (!fs.existsSync(snapshotPath)) fs.mkdirSync(snapshotPath)
	})

	describe('.status', () => {
		it('unauthenticated', async () => {
			expect(await noAuthClient.status()).toMatchSpecificSnapshot(
				fileName('status'),
			)
		})
		it('authenticated', async () => {
			expect(await client.status()).toMatchSpecificSnapshot(
				fileName('status-authenticated'),
			)
		})
	})
})
