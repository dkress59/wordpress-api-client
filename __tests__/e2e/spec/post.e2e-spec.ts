import 'jest-specific-snapshot'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockContent = {
	rendered: '<p>Mock Content</p>',
	protected: false,
}
const mockUpdatedTitle = { rendered: 'Updated Title' }

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

		beforeEach(async () => {
			if (newPostId) await client.post().delete(newPostId)
			newPostId = 0
		})

		it('.find (all)', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
				status: 'publish',
			})
			newPostId = response!.id
			const currentLength = (await client.post().find()).length
			expect(currentLength > 1).toBe(true)
		})
		it('.find (one)', async () => {
			const allPosts = await client.post().find()
			expect(await client.post().find(allPosts[0]!.id)).toEqual([
				allPosts[0],
			])
		})
		it('.create', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response!.id
			expect(response?.title).toEqual({
				...mockTitle,
				raw: mockTitle.rendered,
			})
		})
		it('.update', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(
				(
					await client
						.post()
						.update({ title: mockUpdatedTitle }, response!.id)
				)?.title.raw,
			).toEqual(mockUpdatedTitle.rendered)
		})
		it('.delete', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			await client.post().delete(response!.id)
			expect(response?.title).toEqual({
				...mockTitle,
				raw: mockTitle.rendered,
			})
		})
	})
})
