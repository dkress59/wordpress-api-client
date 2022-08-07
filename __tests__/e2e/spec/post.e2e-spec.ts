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

	describe('.post', () => {
		let newPostId: number | undefined

		afterEach(async () => {
			if (newPostId) await client.post().delete(newPostId)
			newPostId = 0
		})

		it('.find (all)', async () => {
			expect(await client.post().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'post'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.post().find(1)).toMatchSpecificSnapshot(
				fileName('find_one', 'post'),
			)
		})
		it('.create', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(response).toMatchSpecificSnapshot(fileName('create', 'post'))
		})
		it('.update', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(
				await client
					.post()
					.update({ title: mockUpdatedTitle }, response!.id),
			).toMatchSpecificSnapshot(fileName('update', 'post'))
		})
		it('.delete', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			expect(
				await client.post().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'post'))
		})
	})
})
