import 'jest-specific-snapshot'

import fs from 'fs'
import path from 'path'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockUpdatedTitle = { rendered: 'Updated Title' }

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

	describe('.postCategory', () => {
		let newCategoryId: number | undefined

		afterEach(async () => {
			if (newCategoryId) await client.postCategory().delete(newCategoryId)
			newCategoryId = 0
		})

		it('.create', async () => {
			const response = await client.postCategory().create({
				name: mockTitle.rendered,
			})
			newCategoryId = response?.id
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'postCategory'),
			)
		})
		it('.delete', async () => {
			const response = await client.postCategory().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.postCategory().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'postCategory'))
		})
		it('.find (all)', async () => {
			expect(await client.postCategory().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'postCategory'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.postCategory().find(1)).toMatchSpecificSnapshot(
				fileName('find_one', 'postCategory'),
			)
		})
		it('.update', async () => {
			const response = await client.postCategory().create({
				name: mockTitle.rendered,
			})
			newCategoryId = response?.id
			expect(
				await client.postCategory().update(
					{
						name: mockUpdatedTitle.rendered,
					},
					response!.id,
				),
			).toMatchSpecificSnapshot(fileName('update', 'postCategory'))
		})
	})
})
