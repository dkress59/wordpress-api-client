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

	describe('.page', () => {
		let newPostId: number | undefined

		beforeEach(async () => {
			if (newPostId) await client.page().delete(newPostId)
			newPostId = 0
		})

		it('.find (all)', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
				status: 'publish',
			})
			newPostId = response!.id
			const currentLength = (await client.page().find()).length
			expect(currentLength > 1).toBe(true)
		})
		it('.find (one)', async () => {
			const allPages = await client.page().find()
			expect(await client.page().find(allPages[0]!.id)).toEqual([
				allPages[0],
			])
		})
		it('.create', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(response!.title).toEqual({
				...mockTitle,
				raw: mockTitle.rendered,
			})
		})
		it('.update', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(
				(
					await client
						.page()
						.update({ title: mockUpdatedTitle }, response!.id)
				)?.title.raw,
			).toEqual(mockUpdatedTitle.rendered)
		})
		it('.delete', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
			})
			await client.page().delete(response!.id)
			expect(response?.title).toEqual({
				...mockTitle,
				raw: mockTitle.rendered,
			})
		})
	})
})
