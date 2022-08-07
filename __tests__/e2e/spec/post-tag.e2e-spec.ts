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

	describe('.postTag', () => {
		let newTagId: number | undefined

		beforeAll(async () => {
			await client.postTag().create({
				name: 'Initial Tag',
			})
		})

		afterEach(async () => {
			if (newTagId) await client.postTag().delete(newTagId)
			newTagId = 0
		})

		it('.create', async () => {
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			newTagId = response?.id
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'postTag'),
			)
		})
		it('.delete', async () => {
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.postTag().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'postTag'))
		})
		it('.find (all)', async () => {
			expect(await client.postTag().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'postTag'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.postTag().find(2)).toMatchSpecificSnapshot(
				fileName('find_one', 'postTag'),
			)
		})
		it('.update', async () => {
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			newTagId = response?.id
			expect(
				await client.postTag().update(
					{
						name: mockUpdatedTitle.rendered,
					},
					response!.id,
				),
			).toMatchSpecificSnapshot(fileName('update', 'postTag'))
		})
	})
})
