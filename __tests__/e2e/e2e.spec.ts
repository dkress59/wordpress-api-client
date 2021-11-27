import 'jest-specific-snapshot'
import WpApiClient from '../../src'
import path from 'path'

const mockTitle = 'Mock Title'
const mockContent = '<p>Mock Content</p>'
const mockUpdatedTitle = 'Updated Title'

function fileName(name: string) {
	const snapshotPath = path.resolve('./__snapshots__')
	return path.join(snapshotPath, `e2e-${name}.spec.ts.snap`)
}

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
	})

	describe('.post', () => {
		let newPostId: number | undefined

		afterEach(async () => {
			if (newPostId) await client.post().delete(newPostId)
			newPostId = 0
		})

		it('.find (all)', async () => {
			expect(await client.post().find()).toMatchSpecificSnapshot(
				fileName('post-find_all'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.post().find(1)).toMatchSpecificSnapshot(
				fileName('post-find_one'),
			)
		})
		it('.create', async () => {
			const response = await client.post().create({
				content: {
					rendered: mockContent,
					protected: false,
				},
				title: {
					rendered: mockTitle,
				},
			})
			newPostId = response?.id
			expect(response).toMatchSpecificSnapshot(fileName('post-create'))
		})
		it('.update', async () => {
			const response = await client.post().create({
				content: {
					rendered: mockContent,
					protected: false,
				},
				title: {
					rendered: mockTitle,
				},
			})
			newPostId = response?.id
			expect(
				await client
					.post()
					.update(
						{ title: { rendered: mockUpdatedTitle } },
						response!.id,
					),
			).toMatchSpecificSnapshot(fileName('post-update'))
		})
		it('.delete', async () => {
			const response = await client.post().create({
				content: {
					rendered: mockContent,
					protected: false,
				},
				title: {
					rendered: mockTitle,
				},
			})
			expect(
				await client.post().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('post-delete'))
		})
	})
	describe('.page', () => {
		let newPostId: number | undefined

		afterEach(async () => {
			if (newPostId) await client.page().delete(newPostId)
			newPostId = 0
		})

		it('.find (all)', async () => {
			expect(await client.page().find()).toMatchSpecificSnapshot(
				fileName('page-find_all'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.page().find(2)).toMatchSpecificSnapshot(
				fileName('page-find_one'),
			)
		})
		it('.create', async () => {
			const response = await client.page().create({
				content: {
					rendered: mockContent,
					protected: false,
				},
				title: {
					rendered: mockTitle,
				},
			})
			newPostId = response?.id
			expect(response).toMatchSpecificSnapshot(fileName('page-create'))
		})
		it('.update', async () => {
			const response = await client.page().create({
				content: {
					rendered: mockContent,
					protected: false,
				},
				title: {
					rendered: mockTitle,
				},
			})
			newPostId = response?.id
			expect(
				await client
					.page()
					.update(
						{ title: { rendered: mockUpdatedTitle } },
						response!.id,
					),
			).toMatchSpecificSnapshot(fileName('page-update'))
		})
		it('.delete', async () => {
			const response = await client.page().create({
				content: {
					rendered: mockContent,
					protected: false,
				},
				title: {
					rendered: mockTitle,
				},
			})
			expect(
				await client.page().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('page-delete'))
		})
	})
})
