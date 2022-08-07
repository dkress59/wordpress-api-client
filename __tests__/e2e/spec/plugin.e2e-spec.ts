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

	beforeAll(() => () => {
		if (!fs.existsSync(snapshotPath)) fs.mkdirSync(snapshotPath)
	})

	describe('.plugin', () => {
		jest.setTimeout(30 * 1000)
		it('.create', async () => {
			const response = await client
				.plugin()
				.create('advanced-custom-fields', 'active')
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'plugin'),
			)

			await client
				.plugin()
				.update('advanced-custom-fields/acf', 'inactive')
		})
		it('.delete', async () => {
			expect(
				await client.plugin().delete('akismet/akismet'),
			).toMatchSpecificSnapshot(fileName('delete', 'plugin'))
		})
		it('.find (all)', async () => {
			expect(await client.plugin().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'plugin'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.plugin().find('hello')).toMatchSpecificSnapshot(
				fileName('find_one', 'plugin'),
			)
		})
		it('.update', async () => {
			expect(
				await client.plugin().update('hello', 'active'),
			).toMatchSpecificSnapshot(fileName('update', 'plugin'))
		})
	})
})
