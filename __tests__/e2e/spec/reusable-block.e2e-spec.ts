import 'jest-specific-snapshot'

import fs from 'fs'
import path from 'path'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockContent = {
	rendered: '<p>Mock Content</p>',
	protected: false,
}
const mockUpdatedTitle = { rendered: 'Updated Title' }
const mockRawContent = { raw: mockContent.rendered, protected: false }
const mockRawTitle = { raw: mockTitle.rendered, protected: false }

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

	describe('.reusableBlock', () => {
		let newBlockId = 0

		beforeEach(async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			newBlockId = response!.id
		})

		afterEach(async () => {
			if (newBlockId) await client.reusableBlock().delete(newBlockId)
			newBlockId = 0
		})

		it('.find (all)', async () => {
			expect(await client.reusableBlock().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'reusableBlock'),
			)
		})
		it('.find (one)', async () => {
			expect(
				await client.reusableBlock().find(newBlockId),
			).toMatchSpecificSnapshot(fileName('find_one', 'reusableBlock'))
		})
		it('.create', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			newBlockId = response!.id
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'reusableBlock'),
			)
		})
		it('.update', async () => {
			expect(
				await client
					.reusableBlock()
					.update(
						{ title: { raw: mockUpdatedTitle.rendered } },
						newBlockId,
					),
			).toMatchSpecificSnapshot(fileName('update', 'reusableBlock'))
		})
		it('.delete', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			expect(
				await client.reusableBlock().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'reusableBlock'))
		})
	})
})
